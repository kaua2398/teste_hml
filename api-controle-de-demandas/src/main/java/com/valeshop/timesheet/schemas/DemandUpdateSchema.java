package com.valeshop.timesheet.schemas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class DemandUpdateSchema {

    protected String title;
    protected String gitLink;
    protected Integer priority;
    protected String status;
    protected Date date;
    protected String description;
    protected Long userId;
}
