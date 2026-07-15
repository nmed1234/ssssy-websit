package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final AuthenticationManager authenticationManager;

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

  public AuthResponse refresh(RefreshTokenRequest request) {
    RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
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

  @Transactional
  public void logout(UUID userId) {
    refreshTokenRepository.deleteByUserId(userId);
  }

  public void forgotPassword(ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

    String resetToken = jwtTokenProvider.generateRefreshToken(user.getId());
    saveResetToken(user, resetToken);

    // In production, send email with reset link
  }

  @Transactional
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
