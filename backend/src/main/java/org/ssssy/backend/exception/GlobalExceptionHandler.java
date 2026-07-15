package org.ssssy.backend.exception;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.ssssy.backend.model.dto.ApiResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.LinkedHashMap;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error("Invalid username or password"));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error("Access denied"));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
      MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      errors.put(error.getField(), error.getDefaultMessage());
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.error("Validation failed"));
  }

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleEntityNotFound(EntityNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.error(ex.getMessage()));
  }

  @ExceptionHandler(InsufficientAuthenticationException.class)
  public ResponseEntity<ApiResponse<Void>> handleInsufficientAuth(InsufficientAuthenticationException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.error("Authentication required"));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(ApiResponse.error("Data integrity violation"));
  }

  @ExceptionHandler(InvalidStateTransitionException.class)
  public ResponseEntity<ApiResponse<Map<String, String>>> handleInvalidStateTransition(InvalidStateTransitionException ex) {
    Map<String, String> detail = new LinkedHashMap<>();
    detail.put("error", "invalid_state_transition");
    detail.put("currentState", ex.getCurrentState());
    detail.put("requiredState", ex.getRequiredState());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.<Map<String, String>>builder()
            .success(false)
            .message("invalid_state_transition")
            .data(detail)
            .build());
  }

  @ExceptionHandler(InsufficientPermissionsException.class)
  public ResponseEntity<ApiResponse<Void>> handleInsufficientPermissions(InsufficientPermissionsException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error(ex.getMessage()));
  }

  /**
   * Handles expired or invalid preview tokens.
   * Returns HTTP 403 with {"error": "preview_token_expired_or_invalid"}.
   *
   * Requirements: 8.7
   */
  @ExceptionHandler(PreviewTokenExpiredException.class)
  public ResponseEntity<Map<String, String>> handlePreviewTokenExpired(PreviewTokenExpiredException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Map.of("error", "preview_token_expired_or_invalid"));
  }

  /**
   * Handles invalid file uploads (MIME type or size violations).
   * Returns HTTP 422 with {"error": "invalid_file", "reason": "unsupported_type|size_exceeded"}.
   *
   * Requirements: 15.3, 17.5
   */
  @ExceptionHandler(InvalidFileException.class)
  public ResponseEntity<Map<String, String>> handleInvalidFile(InvalidFileException ex) {
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
        .body(Map.of("error", "invalid_file", "reason", ex.getReason()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
    // 405 is a client error — log at WARN, not ERROR, and omit the stack trace
    log.warn("Method not supported: {} {}", ex.getMethod(), ex.getMessage());
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
        .body(ApiResponse.error("Method not allowed: " + ex.getMethod()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
    // Log the full stack trace so we can diagnose in the Spring Boot console
    log.error("Unhandled exception: {}", ex.getMessage(), ex);
    // Return the real cause message so the browser also shows it
    String detail = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error("Internal error: " + detail));
  }
}
