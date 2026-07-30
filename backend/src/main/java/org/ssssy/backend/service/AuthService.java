package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.audit.SecurityAudit;
import org.ssssy.backend.event.CmsEventBus;
import org.ssssy.backend.event.UserRegisteredEvent;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.UnauthorizedException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.RefreshToken;
import org.ssssy.backend.model.entity.Role;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.RefreshTokenRepository;
import org.ssssy.backend.repository.RoleRepository;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.security.JwtTokenProvider;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final AuthenticationManager authenticationManager;
  private final CmsEventBus cmsEventBus;
  private final EmailAccountService emailAccountService;
  private final JavaMailSender mailSender;

  @Value("${app.base-url:https://ssssyria.org}")
  private String baseUrl;

  @Value("${spring.mail.username:noreply@ssssyria.org}")
  private String fromAddress;

  @Transactional
  @SecurityAudit(action = "LOGIN", entityType = "USER")
  public AuthResponse login(LoginRequest request) {
    User user = userRepository.findByUsername(request.getUsername())
        .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

    if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
      throw new UnauthorizedException("Account is locked. Try again later.");
    }

    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
    } catch (Exception e) {
      int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
      user.setFailedLoginAttempts(attempts);
      if (attempts >= 5) {
        user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
      }
      userRepository.save(user);
      throw new UnauthorizedException("Invalid credentials");
    }

    user.setLastLoginAt(LocalDateTime.now());
    user.setFailedLoginAttempts(0);
    user.setAccountLockedUntil(null);
    userRepository.save(user);

    String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().getName());
    String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    saveRefreshToken(user, refreshToken);

    return AuthResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .userId(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .role(user.getRole().getName())
        .tokenType("Bearer")
        .build();
  }

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new BadRequestException("Username already taken");
    }
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new BadRequestException("Email already registered");
    }

    Role memberRole = roleRepository.findByName("MEMBER")
        .orElseThrow(() -> new RuntimeException("Default role MEMBER not found"));

    User user = User.builder()
        .username(request.getUsername())
        .email(request.getEmail())
        .passwordHash(passwordEncoder.encode(request.getPassword()))
        .firstNameAr(request.getFirstNameAr())
        .lastNameAr(request.getLastNameAr())
        .firstNameEn(request.getFirstNameEn())
        .lastNameEn(request.getLastNameEn())
        .phone(request.getPhone())
        .role(memberRole)
        .isActive(true)
        .isEmailVerified(false)
        .failedLoginAttempts(0)
        .build();

    user = userRepository.save(user);

    try {
      emailAccountService.provisionAccount(user.getId());
    } catch (Exception e) {
      log.warn("Failed to provision email account for user {}: {}", user.getId(), e.getMessage());
    }

    cmsEventBus.publish(new UserRegisteredEvent(
        user.getId(), user.getEmail(), user.getUsername(), user.getRole().getName()));

    String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().getName());
    String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    saveRefreshToken(user, refreshToken);

    return AuthResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .userId(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .role(user.getRole().getName())
        .tokenType("Bearer")
        .build();
  }

  /** Called by cookie-based flow (browser) and non-browser clients alike. */
  public AuthResponse refreshByToken(String tokenValue) {
    RefreshToken storedToken = refreshTokenRepository.findByToken(tokenValue)
        .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

    if (storedToken.getIsRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new BadRequestException("Refresh token expired or revoked");
    }

    User user = storedToken.getUser();
    String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().getName());
    String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

    storedToken.setIsRevoked(true);
    refreshTokenRepository.save(storedToken);

    saveRefreshToken(user, newRefreshToken);

    return AuthResponse.builder()
        .accessToken(newAccessToken)
        .refreshToken(newRefreshToken)
        .userId(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .role(user.getRole().getName())
        .tokenType("Bearer")
        .build();
  }

  /** Overload accepting a DTO — delegates to {@link #refreshByToken(String)}. */
  public AuthResponse refresh(RefreshTokenRequest request) {
    return refreshByToken(request.getRefreshToken());
  }

  @Transactional
  @SecurityAudit(action = "LOGOUT", entityType = "USER")
  public void logout(UUID userId) {
    refreshTokenRepository.deleteByUserId(userId);
  }

  public void forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

    String resetToken = jwtTokenProvider.generateRefreshToken(user.getId());
    saveResetToken(user, resetToken);

    // Gap 2 fix: send the password reset email.
    String resetLink = baseUrl + "/auth/reset-password?token=" + resetToken;
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(fromAddress);
      message.setTo(user.getEmail());
      message.setSubject("Password Reset — Syrian Soil Science Society");
      message.setText(
          "Hello " + (user.getFirstNameEn() != null ? user.getFirstNameEn() : user.getUsername()) + ",\n\n"
          + "We received a request to reset your password for the SSSS website.\n\n"
          + "Click the link below to set a new password (valid for 1 hour):\n\n"
          + resetLink + "\n\n"
          + "If you did not request this, please ignore this email. Your password will not change.\n\n"
          + "Syrian Soil Science Society\n"
          + baseUrl
      );
      mailSender.send(message);
      log.info("Password reset email sent to {}", user.getEmail());
    } catch (Exception e) {
      // Log the error but do not reveal to the caller whether the send failed —
      // this prevents user enumeration via email delivery errors.
      log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
    }
  }

  @Transactional
  @SecurityAudit(action = "PASSWORD_RESET", entityType = "USER")
  public void resetPassword(ResetPasswordRequest request) {
    RefreshToken storedToken = refreshTokenRepository.findByToken(request.getToken())
        .orElseThrow(() -> new BadRequestException("Invalid reset token"));

    if (storedToken.getIsRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new BadRequestException("Reset token expired or revoked");
    }

    User user = storedToken.getUser();
    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    storedToken.setIsRevoked(true);
    refreshTokenRepository.save(storedToken);
  }

  @Transactional
  public void verifyEmail(VerifyEmailRequest request) {
    RefreshToken storedToken = refreshTokenRepository.findByToken(request.getToken())
        .orElseThrow(() -> new BadRequestException("Invalid verification token"));

    if (storedToken.getIsRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new BadRequestException("Verification token expired");
    }

    User user = storedToken.getUser();
    user.setIsEmailVerified(true);
    user.setEmailVerifiedAt(LocalDateTime.now());
    userRepository.save(user);

    storedToken.setIsRevoked(true);
    refreshTokenRepository.save(storedToken);
  }

  @Transactional
  @SecurityAudit(action = "PASSWORD_CHANGE", entityType = "USER")
  public void changePassword(UUID userId, ChangePasswordRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
      throw new BadRequestException("Current password is incorrect");
    }

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }

  private void saveRefreshToken(User user, String token) {
    // Delete all existing tokens for this user before inserting a new one.
    // Prevents duplicate-key violations when the same user logs in multiple times.
    refreshTokenRepository.deleteByUserId(user.getId());
    RefreshToken refreshToken = RefreshToken.builder()
        .user(user)
        .token(token)
        .expiresAt(LocalDateTime.now().plusDays(7))
        .isRevoked(false)
        .build();
    refreshTokenRepository.save(refreshToken);
  }

  private void saveResetToken(User user, String token) {
    RefreshToken resetToken = RefreshToken.builder()
        .user(user)
        .token(token)
        .expiresAt(LocalDateTime.now().plusHours(1))
        .isRevoked(false)
        .build();
    refreshTokenRepository.save(resetToken);
  }
}
