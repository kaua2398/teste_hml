package com.valeshop.timesheet.exceptions;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
    public InvalidTokenException() {
        super("Token expirado ou inválido!");
    }
}
