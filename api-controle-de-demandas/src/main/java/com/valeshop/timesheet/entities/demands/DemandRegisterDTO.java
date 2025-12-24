package com.valeshop.timesheet.entities.demands;

import com.valeshop.timesheet.entities.user.User;

import java.util.Date;

public record DemandRegisterDTO(String title, String gitlink, Integer priority, String status, Date date, String description, User user) {
}
