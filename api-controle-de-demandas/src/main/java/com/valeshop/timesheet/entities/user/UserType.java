package com.valeshop.timesheet.entities.user;

import lombok.*;

@Getter
public enum UserType {
    Administrador(1),
    Normal(2);

    private int code;

    UserType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static UserType valueOf(int code){
        for (UserType value : UserType.values()){
            if(value.getCode() == code) return value;
        }
        throw new IllegalArgumentException("Invalid user type code");
    }

}
