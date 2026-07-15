package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.AuthService;
import org.ssssy.backend.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(authService.register(request)));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(authService.refresh(request)));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails userDetails) {
    if (userDetails != null) {
      authService.logout(UUID.fromString(userDetails.getUsername()));
    }
    return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserDetails userDetails) {
    UUID userId = UUID.fromString(userDetails.getUsername());
    return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(userId)));
  }

  @PutMapping("/me")
  public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody UpdateProfileRequest request) {
    UUID userId = UUID.fromString(userDetails.getUsername());
    return ResponseEntity.ok(ApiResponse.ok(userService.updateProfile(userId, request)));
  }

  @PutMapping("/me/password")
  public ResponseEntity<ApiResponse<Void>> changePassword(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody ChangePasswordRequest request) {
    UUID userId = UUID.fromString(userDetails.getUsername());
    authService.changePassword(userId, request);
    return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request);
    return ResponseEntity.ok(ApiResponse.ok("If the email exists, a reset link has been sent", null));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ResponseEntity.ok(ApiResponse.ok("Password reset successfully", null));
  }

  @PostMapping("/verify-email")
  public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
    authService.verifyEmail(request);
    return ResponseEntity.ok(ApiResponse.ok("Email verified successfully", null));
  }
}
