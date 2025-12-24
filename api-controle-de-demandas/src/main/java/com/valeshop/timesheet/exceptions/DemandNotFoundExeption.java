package com.valeshop.timesheet.exceptions;

public class DemandNotFoundExeption extends RuntimeException {
    public DemandNotFoundExeption() {
        super("Usuario nao encontrado, verifique o login.");
    }
}
