package org.ssssy.backend.exception;

public class InsufficientPermissionsException extends RuntimeException {

    public InsufficientPermissionsException(String message) {
        super(message);
    }
}
