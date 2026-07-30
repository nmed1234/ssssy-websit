package org.ssssy.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.WebUtils;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.security.JwtTokenProvider;
import org.ssssy.backend.security.TokenBlacklistService;
import org.ssssy.backend.service.AuthService;
import org.ssssy.backend.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final UserService userService;
  private final JwtTokenProvider jwtTokenProvider;
  private final TokenBlacklistService tokenBlacklistService;

  @Value("${app.cookie.secure:true}")
  private boolean cookieSecure;

  /** Build a Set-Cookie header value for the given name/value/path/maxAge. */
  private String buildCookieHeader(String name, String value, String path, int maxAgeSeconds) {
    StringBuilder sb = new StringBuilder();
    sb.append(name).append("=").append(value).append("; ");
    sb.append("HttpOnly; ");
    if (cookieSecure) {
      sb.append("Secure; ");
    }
    sb.append("SameSite=Lax; ");
    sb.append("Path=").append(path).append("; ");
    sb.append("Max-Age=").append(maxAgeSeconds);
    return sb.toString();
  }

  /** Attach accessToken + refreshToken httpOnly cookies to the response. */
  private void setTokenCookies(HttpServletResponse response, AuthResponse auth) {
    // accessToken: 15 minutes, Path=/ so the browser sends it on ALL requests
    // (including Next.js middleware checks on /admin, /dashboard, etc.)
    response.addHeader("Set-Cookie",
        buildCookieHeader("accessToken", auth.getAccessToken(), "/", 900));
    // refreshToken: 7 days, restricted to the refresh endpoint only
    response.addHeader("Set-Cookie",
        buildCookieHeader("refreshToken", auth.getRefreshToken(), "/api/auth/refresh", 604800));
  }

  /** Clear both token cookies by setting Max-Age=0. */
  private void clearTokenCookies(HttpServletResponse response) {
    response.addHeader("Set-Cookie",
        buildCookieHeader("accessToken", "", "/", 0));
    response.addHeader("Set-Cookie",
        buildCookieHeader("refreshToken", "", "/api/auth/refresh", 0));
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthResponse>> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletResponse response) {
    AuthResponse auth = authService.login(request);
    setTokenCookies(response, auth);
    return ResponseEntity.ok(ApiResponse.ok(auth));
  }

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<AuthResponse>> register(
      @Valid @RequestBody RegisterRequest request,
      HttpServletResponse response) {
    AuthResponse auth = authService.register(request);
    setTokenCookies(response, auth);
    return ResponseEntity.ok(ApiResponse.ok(auth));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<AuthResponse>> refresh(
      jakarta.servlet.http.HttpServletRequest request,
      HttpServletResponse response) {
    // Extract the refresh token from the httpOnly cookie first.
    String refreshTokenValue = null;
    jakarta.servlet.http.Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (jakarta.servlet.http.Cookie c : cookies) {
        if ("refreshToken".equals(c.getName())) {
          refreshTokenValue = c.getValue();
          break;
        }
      }
    }
    // Fall back to JSON body for non-browser clients (e.g. mobile apps).
    if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
      try {
        byte[] bodyBytes = request.getInputStream().readAllBytes();
        if (bodyBytes.length > 0) {
          com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
          com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(bodyBytes);
          if (node != null && node.has("refreshToken")) {
            refreshTokenValue = node.get("refreshToken").asText(null);
          }
        }
      } catch (Exception ignored) { /* no body or unreadable */ }
    }
    if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
      return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.error("Refresh token not provided"));
    }
    AuthResponse auth = authService.refreshByToken(refreshTokenValue);
    setTokenCookies(response, auth);
    return ResponseEntity.ok(ApiResponse.ok(auth));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @AuthenticationPrincipal UserDetails userDetails,
      HttpServletRequest request,
      HttpServletResponse response) {
    // Blacklist the current access token so it cannot be reused after logout.
    String accessToken = resolveAccessToken(request);
    if (accessToken != null) {
      try {
        String jti = jwtTokenProvider.getJtiFromToken(accessToken);
        long ttlMs = jwtTokenProvider.getRemainingTtlMs(accessToken);
        tokenBlacklistService.blacklist(jti, ttlMs);
      } catch (Exception ignored) {
        // Malformed / already-expired token — nothing to blacklist.
      }
    }
    if (userDetails != null) {
      authService.logout(UUID.fromString(userDetails.getUsername()));
    }
    clearTokenCookies(response);
    return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
  }

  /** Extract the raw access token from the Authorization header or the httpOnly cookie. */
  private String resolveAccessToken(HttpServletRequest request) {
    String bearer = request.getHeader("Authorization");
    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
      return bearer.substring(7);
    }
    jakarta.servlet.http.Cookie cookie = WebUtils.getCookie(request, "accessToken");
    if (cookie != null && StringUtils.hasText(cookie.getValue())) {
      return cookie.getValue();
    }
    return null;
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
