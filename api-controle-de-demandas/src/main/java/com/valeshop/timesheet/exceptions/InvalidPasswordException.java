package com.valeshop.timesheet.exceptions;


public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() { super("Senha invalida");}
}