package org.ssssy.backend.security;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Enforces the SSSSY password policy for any field annotated with {@link ValidPassword}.
 *
 * Rules:
 *   - Length: 8 ≤ length ≤ 100
 *   - At least one uppercase letter
 *   - At least one lowercase letter
 *   - At least one digit
 *   - At least one special character from the set: !@#$%^&*()-_=+[]{}|;:,.<>?
 */
public class PasswordPolicyValidator implements ConstraintValidator<ValidPassword, String> {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 100;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            // @NotBlank / @NotNull should handle null — don't double-report.
            return true;
        }

        int len = value.length();
        if (len < MIN_LENGTH || len > MAX_LENGTH) {
            return false;
        }

        boolean hasUpper   = false;
        boolean hasLower   = false;
        boolean hasDigit   = false;
        boolean hasSpecial = false;

        for (char c : value.toCharArray()) {
            if (Character.isUpperCase(c))       hasUpper   = true;
            else if (Character.isLowerCase(c))  hasLower   = true;
            else if (Character.isDigit(c))      hasDigit   = true;
            else                                hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
