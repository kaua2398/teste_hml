package com.valeshop.timesheet.schemas;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResendVerificationSchema {

    @JsonProperty("email")
    @NotBlank(message = "O email não pode estar vazio.")
    @Email
    private String email;
}
