package org.ssssy.backend.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

  private static final String KEY_PREFIX = "blacklist:jwt:";

  private final StringRedisTemplate redisTemplate;

  /**
   * Blacklist the given JWT ID for the remainder of its lifetime.
   * If the token is already expired (ttlMs <= 0), nothing is stored.
   */
  public void blacklist(String jti, long ttlMs) {
    if (ttlMs <= 0) {
      return;
    }
    try {
      redisTemplate.opsForValue().set(KEY_PREFIX + jti, "1", ttlMs, TimeUnit.MILLISECONDS);
      log.debug("Blacklisted JWT jti={} ttlMs={}", jti, ttlMs);
    } catch (Exception e) {
      log.error("Failed to blacklist JWT jti={} — Redis error: {}", jti, e.getMessage());
    }
  }

  /**
   * Returns true if the given JWT ID is blacklisted (i.e. revoked).
   * Fails open: on Redis error, returns false so auth is not broken.
   */
  public boolean isBlacklisted(String jti) {
    try {
      return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jti));
    } catch (Exception e) {
      log.error("Failed to check blacklist for jti={} — Redis error: {}. Failing open.", jti, e.getMessage());
      return false;
    }
  }
}
