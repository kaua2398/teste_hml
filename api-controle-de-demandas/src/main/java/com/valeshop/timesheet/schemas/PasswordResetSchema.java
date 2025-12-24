package com.valeshop.timesheet.schemas;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetSchema {
    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;
}
