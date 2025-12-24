package com.valeshop.timesheet.schemas;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DemandRegisterSchema {
    protected List<String> problems;
    protected List<String> observations;
    protected List<String> comments;

}
