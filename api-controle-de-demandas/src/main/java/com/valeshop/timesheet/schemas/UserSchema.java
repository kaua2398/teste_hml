package com.valeshop.timesheet.schemas;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSchema {
    @NotBlank(message = "O email não pode estar vazio.")
    @Email(message = "Insira um email válido")
    private String email;

    @NotBlank(message = "É obrigatório inserir uma senha")
    private String password;

    @NotBlank(message = "O tipo de usuário é obrigatório.")
    private String userType;

}
