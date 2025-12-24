package com.valeshop.timesheet.entities.user;

public record UserResponseDTO(Long id, String email, UserType userType) {
    public UserResponseDTO(User user) {
        this(user.getId(), user.getEmail(), user.getUserType());
    }
}
