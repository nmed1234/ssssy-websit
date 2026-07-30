package org.ssssy.backend.security;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    // Lua script: atomic token-bucket refill + consume
    // Keys[1] = bucket key
    // Argv[1] = max_tokens, Argv[2] = refill_per_window, Argv[3] = window_seconds, Argv[4] = now_seconds
    private static final String LUA_SCRIPT =
        "local key = KEYS[1]\n" +
        "local max_tokens = tonumber(ARGV[1])\n" +
        "local refill = tonumber(ARGV[2])\n" +
        "local window = tonumber(ARGV[3])\n" +
        "local now = tonumber(ARGV[4])\n" +
        "local data = redis.call('HMGET', key, 'tokens', 'last_refill')\n" +
        "local tokens = tonumber(data[1])\n" +
        "local last_refill = tonumber(data[2])\n" +
        "if tokens == nil then\n" +
        "  tokens = max_tokens\n" +
        "  last_refill = now\n" +
        "else\n" +
        "  local elapsed = now - last_refill\n" +
        "  local periods = math.floor(elapsed / window)\n" +
        "  if periods > 0 then\n" +
        "    tokens = math.min(max_tokens, tokens + periods * refill)\n" +
        "    last_refill = last_refill + periods * window\n" +
        "  end\n" +
        "end\n" +
        "if tokens > 0 then\n" +
        "  tokens = tokens - 1\n" +
        "  redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)\n" +
        "  redis.call('EXPIRE', key, window * 2)\n" +
        "  return tokens\n" +
        "else\n" +
        "  redis.call('EXPIRE', key, window * 2)\n" +
        "  return -1\n" +
        "end";

    // Rate limit tiers: {name, path prefix, capacity, refill, windowSeconds}
    private record Tier(String name, String pathPrefix, int capacity, int refill, int windowSeconds) {}

    private static final Tier AUTH_TIER    = new Tier("auth",    "/api/auth/",         20,  20,  300);
    private static final Tier UPLOAD_TIER  = new Tier("upload",  "/api/media/upload",  20,  20,  60);
    private static final Tier PUBLIC_TIER  = new Tier("public",  "/api/public/",       120, 120, 60);
    private static final Tier DEFAULT_TIER = new Tier("default", "",                   60,  60,  60);

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<Long> redisScript;

    @Value("${app.security.trusted-proxies:127.0.0.1,::1,0:0:0:0:0:0:0:1}")
    private String trustedProxiesConfig;

    private Set<String> trustedProxies;

    public RateLimitFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.redisScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);
    }

    @PostConstruct
    public void init() {
        trustedProxies = new HashSet<>();
        Arrays.stream(trustedProxiesConfig.split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .forEach(trustedProxies::add);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        Tier tier = resolveTier(path);

        long now = Instant.now().getEpochSecond();
        String key = "rate_limit:" + tier.name() + ":" + clientIp;
        long resetAt = now + tier.windowSeconds();

        // Rate limit response headers (set on all responses)
        response.setHeader("X-RateLimit-Limit", String.valueOf(tier.capacity()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetAt));

        long remaining;
        try {
            Long result = redisTemplate.execute(
                redisScript,
                Collections.singletonList(key),
                String.valueOf(tier.capacity()),
                String.valueOf(tier.refill()),
                String.valueOf(tier.windowSeconds()),
                String.valueOf(now)
            );
            remaining = (result != null) ? result : tier.capacity() - 1;
        } catch (Exception ex) {
            log.error("Redis rate-limit check failed for ip={} path={} — failing open", clientIp, path, ex);
            response.setHeader("X-RateLimit-Remaining", String.valueOf(tier.capacity()));
            filterChain.doFilter(request, response);
            return;
        }

        if (remaining < 0) {
            // Blocked
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("Retry-After", String.valueOf(tier.windowSeconds()));
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"RATE_LIMIT_EXCEEDED\",\"message\":\"Too many requests. Please slow down.\"}"
            );
            return;
        }

        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        filterChain.doFilter(request, response);
    }

    private Tier resolveTier(String path) {
        if (path.startsWith(AUTH_TIER.pathPrefix()))   return AUTH_TIER;
        if (path.startsWith(UPLOAD_TIER.pathPrefix())) return UPLOAD_TIER;
        if (path.startsWith(PUBLIC_TIER.pathPrefix())) return PUBLIC_TIER;
        return DEFAULT_TIER;
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        if (trustedProxies != null && trustedProxies.contains(remoteAddr)) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }
}
