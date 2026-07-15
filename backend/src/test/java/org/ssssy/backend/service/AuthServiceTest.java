package org.ssssy.backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private RoleRepository roleRepository;

  @Mock
  private RefreshTokenRepository refreshTokenRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private JwtTokenProvider jwtTokenProvider;

  @Mock
  private AuthenticationManager authenticationManager;

  @InjectMocks
  private AuthService authService;

  private UUID userId = UUID.randomUUID();
  private final String accessToken = "access-token";
  private final String refreshToken = "refresh-token";

  private User createUser() {
    Role role = Role.builder().id(UUID.randomUUID()).name("MEMBER").build();
    return User.builder()
        .id(userId)
        .username("testuser")
        .email("test@example.com")
        .passwordHash("encoded-pass")
        .firstNameEn("Test")
        .lastNameEn("User")
        .role(role)
        .isActive(true)
        .isEmailVerified(true)
        .failedLoginAttempts(0)
        .build();
  }

  private RefreshToken createRefreshToken(User user, boolean revoked) {
    return RefreshToken.builder()
        .id(UUID.randomUUID())
        .user(user)
        .token("refresh-token")
        .expiresAt(LocalDateTime.now().plusDays(7))
        .isRevoked(revoked)
        .build();
  }

  @Test
  void login_success() {
    User user = createUser();
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(authenticationManager.authenticate(any())).thenReturn(null);
    when(jwtTokenProvider.generateAccessToken(userId, "testuser", "MEMBER")).thenReturn(accessToken);
    when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn(refreshToken);

    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("password");
    AuthResponse result = authService.login(request);

    assertNotNull(result);
    assertEquals("testuser", result.getUsername());
    assertEquals(accessToken, result.getAccessToken());
    verify(userRepository).save(user);
  }

  @Test
  void login_throws_whenUserNotFound() {
    when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

    LoginRequest request = new LoginRequest();
    request.setUsername("unknown");
    request.setPassword("password");

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
  }

  @Test
  void login_throws_whenAccountLocked() {
    User user = createUser();
    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("password");

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
  }

  @Test
  void login_throws_whenBadCredentials_incrementsAttempts() {
    User user = createUser();
    user.setFailedLoginAttempts(3);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("wrong");

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
    assertEquals(4, user.getFailedLoginAttempts());
    verify(userRepository).save(user);
  }

  @Test
  void login_locksAccountAfterFiveFailures() {
    User user = createUser();
    user.setFailedLoginAttempts(4);
    when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
    when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

    LoginRequest request = new LoginRequest();
    request.setUsername("testuser");
    request.setPassword("wrong");

    assertThrows(UnauthorizedException.class, () -> authService.login(request));
    assertEquals(5, user.getFailedLoginAttempts());
    assertNotNull(user.getAccountLockedUntil());
    verify(userRepository).save(user);
  }

  @Test
  void register_success() {
    User user = createUser();
    Role memberRole = user.getRole();
    when(userRepository.existsByUsername("newuser")).thenReturn(false);
    when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
    when(roleRepository.findByName("MEMBER")).thenReturn(Optional.of(memberRole));
    when(passwordEncoder.encode("password")).thenReturn("encoded");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
      User saved = invocation.getArgument(0);
      saved.setId(userId);
      return saved;
    });
    when(jwtTokenProvider.generateAccessToken(userId, "newuser", "MEMBER")).thenReturn(accessToken);
    when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn(refreshToken);

    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("new@example.com");
    request.setPassword("password");
    request.setFirstNameEn("New");
    request.setLastNameEn("User");
    AuthResponse result = authService.register(request);

    assertNotNull(result);
    assertEquals("newuser", result.getUsername());
    verify(userRepository).save(any(User.class));
  }

  @Test
  void register_throws_whenUsernameTaken() {
    when(userRepository.existsByUsername("existing")).thenReturn(true);

    RegisterRequest request = new RegisterRequest();
    request.setUsername("existing");
    request.setEmail("new@example.com");
    request.setPassword("password");

    assertThrows(BadRequestException.class, () -> authService.register(request));
  }

  @Test
  void register_throws_whenEmailTaken() {
    when(userRepository.existsByEmail("used@example.com")).thenReturn(true);

    RegisterRequest request = new RegisterRequest();
    request.setUsername("newuser");
    request.setEmail("used@example.com");
    request.setPassword("password");

    assertThrows(BadRequestException.class, () -> authService.register(request));
  }

  @Test
  void refresh_success() {
    User user = createUser();
    RefreshToken stored = createRefreshToken(user, false);
    when(refreshTokenRepository.findByToken("valid-refresh")).thenReturn(Optional.of(stored));
    when(jwtTokenProvider.generateAccessToken(userId, "testuser", "MEMBER")).thenReturn(accessToken);
    when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn("new-refresh");

    RefreshTokenRequest request = new RefreshTokenRequest();
    request.setRefreshToken("valid-refresh");
    AuthResponse result = authService.refresh(request);

    assertNotNull(result);
    assertEquals(accessToken, result.getAccessToken());
    assertTrue(stored.getIsRevoked());
    verify(refreshTokenRepository).save(stored);
  }

  @Test
  void refresh_throws_whenTokenInvalid() {
    when(refreshTokenRepository.findByToken("invalid")).thenReturn(Optional.empty());

    RefreshTokenRequest request = new RefreshTokenRequest();
    request.setRefreshToken("invalid");

    assertThrows(BadRequestException.class, () -> authService.refresh(request));
  }

  @Test
  void refresh_throws_whenTokenRevoked() {
    User user = createUser();
    RefreshToken stored = createRefreshToken(user, true);
    when(refreshTokenRepository.findByToken("revoked")).thenReturn(Optional.of(stored));

    RefreshTokenRequest request = new RefreshTokenRequest();
    request.setRefreshToken("revoked");

    assertThrows(BadRequestException.class, () -> authService.refresh(request));
  }

  @Test
  void logout_revokesAllTokens() {
    authService.logout(userId);
    verify(refreshTokenRepository).deleteByUserId(userId);
  }

  @Test
  void forgotPassword_sendsResetToken() {
    User user = createUser();
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
    when(jwtTokenProvider.generateRefreshToken(userId)).thenReturn(refreshToken);

    ForgotPasswordRequest request = new ForgotPasswordRequest();
    request.setEmail("test@example.com");
    authService.forgotPassword(request);

    verify(refreshTokenRepository).save(any(RefreshToken.class));
  }

  @Test
  void forgotPassword_throws_whenEmailNotFound() {
    when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

    ForgotPasswordRequest request = new ForgotPasswordRequest();
    request.setEmail("unknown@example.com");

    assertThrows(ResourceNotFoundException.class, () -> authService.forgotPassword(request));
  }

  @Test
  void resetPassword_success() {
    User user = createUser();
    RefreshToken stored = createRefreshToken(user, false);
    when(refreshTokenRepository.findByToken("reset-token")).thenReturn(Optional.of(stored));
    when(passwordEncoder.encode("newPass123")).thenReturn("new-encoded");

    ResetPasswordRequest request = new ResetPasswordRequest();
    request.setToken("reset-token");
    request.setNewPassword("newPass123");
    authService.resetPassword(request);

    assertEquals("new-encoded", user.getPasswordHash());
    assertTrue(stored.getIsRevoked());
    verify(userRepository).save(user);
  }

  @Test
  void resetPassword_throws_whenTokenExpired() {
    User user = createUser();
    RefreshToken stored = createRefreshToken(user, false);
    stored.setExpiresAt(LocalDateTime.now().minusHours(1));
    when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(stored));

    ResetPasswordRequest request = new ResetPasswordRequest();
    request.setToken("expired");
    request.setNewPassword("newPass123");

    assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
  }

  @Test
  void verifyEmail_success() {
    User user = createUser();
    user.setIsEmailVerified(false);
    RefreshToken stored = createRefreshToken(user, false);
    when(refreshTokenRepository.findByToken("verify-token")).thenReturn(Optional.of(stored));

    VerifyEmailRequest request = new VerifyEmailRequest();
    request.setToken("verify-token");
    authService.verifyEmail(request);

    assertTrue(user.getIsEmailVerified());
    assertNotNull(user.getEmailVerifiedAt());
    verify(userRepository).save(user);
  }

  @Test
  void verifyEmail_throws_whenTokenExpired() {
    User user = createUser();
    RefreshToken stored = createRefreshToken(user, false);
    stored.setExpiresAt(LocalDateTime.now().minusMinutes(5));
    when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(stored));

    VerifyEmailRequest request = new VerifyEmailRequest();
    request.setToken("expired");

    assertThrows(BadRequestException.class, () -> authService.verifyEmail(request));
  }

  @Test
  void changePassword_success() {
    User user = createUser();
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("oldPass", "encoded-pass")).thenReturn(true);
    when(passwordEncoder.encode("newPass")).thenReturn("new-encoded");

    ChangePasswordRequest request = new ChangePasswordRequest();
    request.setCurrentPassword("oldPass");
    request.setNewPassword("newPass");
    authService.changePassword(userId, request);

    assertEquals("new-encoded", user.getPasswordHash());
    verify(userRepository).save(user);
  }

  @Test
  void changePassword_throws_whenCurrentPasswordIncorrect() {
    User user = createUser();
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrong", "encoded-pass")).thenReturn(false);

    ChangePasswordRequest request = new ChangePasswordRequest();
    request.setCurrentPassword("wrong");
    request.setNewPassword("newPass");

    assertThrows(BadRequestException.class, () -> authService.changePassword(userId, request));
  }

  @Test
  void changePassword_throws_whenUserNotFound() {
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    ChangePasswordRequest request = new ChangePasswordRequest();
    request.setCurrentPassword("old");
    request.setNewPassword("new");

    assertThrows(ResourceNotFoundException.class, () -> authService.changePassword(userId, request));
  }
}
