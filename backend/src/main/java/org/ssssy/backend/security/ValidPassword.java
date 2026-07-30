package org.ssssy.backend.security;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Validates that the annotated {@code String} field satisfies the SSSSY password policy:
 * <ul>
 *   <li>Minimum 8 characters, maximum 100 characters</li>
 *   <li>At least one uppercase letter (A–Z)</li>
 *   <li>At least one lowercase letter (a–z)</li>
 *   <li>At least one digit (0–9)</li>
 *   <li>At least one special character (!@#$%^&amp;*…)</li>
 * </ul>
 *
 * Usage:
 * <pre>
 *   &#64;ValidPassword
 *   private String password;
 * </pre>
 */
@Documented
@Constraint(validatedBy = PasswordPolicyValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default
        "Password must be 8–100 characters and contain at least one uppercase letter, "
        + "one lowercase letter, one digit, and one special character (!@#$%^&*()-_=+[]{}|;:,.<>?).";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
