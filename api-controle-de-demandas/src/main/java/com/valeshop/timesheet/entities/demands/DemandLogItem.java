package com.valeshop.timesheet.entities.demands;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DemandLogItem implements Serializable {
    private String text;
    private Date createdAt;
}