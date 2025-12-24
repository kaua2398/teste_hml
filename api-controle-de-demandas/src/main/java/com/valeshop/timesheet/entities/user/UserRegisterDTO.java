package com.valeshop.timesheet.entities.user;

import java.time.Instant;

public record UserRegisterDTO(String email, String password, String userType) {
}
