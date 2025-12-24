package com.valeshop.timesheet.exceptions;

public class CannotSendEmailCorrectlyException extends RuntimeException {
    public CannotSendEmailCorrectlyException() {
        super("Não foi possível enviar o email corretamente!");
    }

    public CannotSendEmailCorrectlyException(String message) {
        super(message);
    }
}
