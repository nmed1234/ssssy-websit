package org.ssssy.backend.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a method for security audit logging.
 * AuditAspect intercepts all methods annotated with @SecurityAudit and
 * persists an AuditLog entry capturing: actor, action, entityType, IP,
 * user-agent, timestamp, and success/failure.
 *
 * Usage:
 * <pre>
 *   @SecurityAudit(action = "LOGIN_SUCCESS", entityType = "USER")
 *   public AuthResponse login(LoginRequest request) { ... }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SecurityAudit {

    /** Short uppercase action label, e.g. "LOGIN_SUCCESS", "MEDIA_UPLOAD". */
    String action();

    /** Entity type being acted upon, e.g. "USER", "CONTENT", "MEDIA". */
    String entityType() default "";
}
