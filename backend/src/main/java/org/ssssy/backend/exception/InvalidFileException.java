package org.ssssy.backend.exception;

/**
 * Thrown when an uploaded file fails MIME-type or size validation.
 * Mapped to HTTP 422 (Unprocessable Entity) by {@link GlobalExceptionHandler}.
 *
 * Requirements: 15.3, 15.4
 */
public class InvalidFileException extends RuntimeException {

  private final String reason;

  public InvalidFileException(String reason) {
    super(reason);
    this.reason = reason;
  }

  public String getReason() {
    return reason;
  }
}
