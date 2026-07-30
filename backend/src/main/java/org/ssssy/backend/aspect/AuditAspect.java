package org.ssssy.backend.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.ssssy.backend.audit.AuditService;
import org.ssssy.backend.audit.SecurityAudit;
import org.ssssy.backend.model.entity.AuditLog;
import org.ssssy.backend.repository.AuditLogRepository;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Security audit aspect — intercepts methods annotated with {@link SecurityAudit}
 * and writes a structured entry to the audit log table.
 *
 * Fields captured per entry:
 *   actor (userId), action, entityType, IP address, user-agent, success/failure,
 *   and the first UUID argument (used as entityId when present).
 *
 * Slow-request monitoring is demoted to DEBUG logging and no longer
 * creates audit entries.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;

    @Value("${app.security.trusted-proxies:127.0.0.1,::1,0:0:0:0:0:0:0:1}")
    private String trustedProxiesConfig;

    // ─────────────────────────────────────────────────────────────────────────
    // @SecurityAudit pointcut
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Intercepts every method annotated with @SecurityAudit.
     * Records the actor, action, entity info, IP, user-agent, and
     * whether the method completed successfully or threw an exception.
     */
    @Around("@annotation(org.ssssy.backend.audit.SecurityAudit)")
    public Object auditSecurityEvent(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        SecurityAudit annotation = method.getAnnotation(SecurityAudit.class);

        String action = annotation.action();
        String entityType = annotation.entityType();
        UUID actorId = resolveActorId();
        String ip = resolveClientIp();
        String userAgent = resolveUserAgent();

        // Try to extract a UUID entity ID from the method arguments
        UUID entityId = resolveEntityId(joinPoint.getArgs());

        boolean success = true;
        Object result = null;
        try {
            result = joinPoint.proceed();

            // If the return value is a UUID or has a UUID getId(), use it as entityId.
            if (entityId == null && result != null) {
                entityId = tryExtractId(result);
            }
        } catch (Throwable ex) {
            success = false;
            auditService.log(
                action + "_FAILURE",
                entityType,
                entityId,
                null,
                ex.getClass().getSimpleName() + ": " + ex.getMessage(),
                actorId,
                ip,
                userAgent
            );
            throw ex;
        }

        if (success) {
            auditService.log(action, entityType, entityId, null, null, actorId, ip, userAgent);
        }

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Slow-request logging (demoted to DEBUG — no longer an audit entry)
    // ─────────────────────────────────────────────────────────────────────────

    @Around("within(@org.springframework.web.bind.annotation.RestController *)")
    public Object logSlowRequests(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long duration = System.currentTimeMillis() - start;
        if (duration > 1000) {
            ServletRequestAttributes attrs = (ServletRequestAttributes)
                    RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                log.debug("SLOW_REQUEST duration={}ms {} {}", duration,
                        req.getMethod(), req.getRequestURI());
            }
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private UUID resolveActorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails ud) {
            try {
                return UUID.fromString(ud.getUsername());
            } catch (IllegalArgumentException ignored) {}
        }
        return null;
    }

    private String resolveClientIp() {
        ServletRequestAttributes attrs = (ServletRequestAttributes)
                RequestContextHolder.getRequestAttributes();
        if (attrs == null) return null;
        HttpServletRequest req = attrs.getRequest();
        String remoteAddr = req.getRemoteAddr();
        Set<String> proxies = parseTrustedProxies();
        if (proxies.contains(remoteAddr)) {
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
        }
        return remoteAddr;
    }

    private String resolveUserAgent() {
        ServletRequestAttributes attrs = (ServletRequestAttributes)
                RequestContextHolder.getRequestAttributes();
        if (attrs == null) return null;
        return attrs.getRequest().getHeader("User-Agent");
    }

    /** Returns the first UUID argument found in the args array, or null. */
    private UUID resolveEntityId(Object[] args) {
        if (args == null) return null;
        for (Object arg : args) {
            if (arg instanceof UUID id) return id;
        }
        return null;
    }

    /** Tries to read a UUID 'id' field from the return value via getId() reflection. */
    private UUID tryExtractId(Object obj) {
        if (obj instanceof UUID id) return id;
        try {
            Object id = obj.getClass().getMethod("getId").invoke(obj);
            if (id instanceof UUID uuid) return uuid;
        } catch (Exception ignored) {}
        return null;
    }

    private Set<String> parseTrustedProxies() {
        Set<String> result = new HashSet<>();
        if (trustedProxiesConfig != null) {
            Arrays.stream(trustedProxiesConfig.split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .forEach(result::add);
        }
        return result;
    }
}
