package org.ssssy.backend.exception;

public class InvalidStateTransitionException extends RuntimeException {

    private final String currentState;
    private final String requiredState;

    public InvalidStateTransitionException(String currentState, String requiredState) {
        super("invalid_state_transition");
        this.currentState = currentState;
        this.requiredState = requiredState;
    }

    public String getCurrentState() {
        return currentState;
    }

    public String getRequiredState() {
        return requiredState;
    }
}
