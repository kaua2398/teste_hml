package com.valeshop.timesheet.schemas;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetRequestSchema {
    @NotBlank
    @Email
    private String email;
}
