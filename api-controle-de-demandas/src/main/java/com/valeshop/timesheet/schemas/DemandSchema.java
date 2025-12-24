package com.valeshop.timesheet.schemas;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class DemandSchema {

    @NotBlank(message = "A demanda deve ter um título")
    protected String title;

    protected String gitLink;

    @NotNull(message = "Defina qual a ordem da prioridade da demanda. Ex: 1, 2, 3...")
    protected Integer priority;

    @NotBlank(message = "A demanda deve ser registrada com um status. Ex: Iniciada")
    protected String status;

    protected Date date;

    @NotBlank(message = "Envie junto uma descrição para a demanda")
    protected String description;
}
