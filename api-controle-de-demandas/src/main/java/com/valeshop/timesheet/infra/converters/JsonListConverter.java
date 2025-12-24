package com.valeshop.timesheet.infra.converters;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.valeshop.timesheet.entities.demands.DemandLogItem;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.List;

@Converter
public class JsonListConverter implements AttributeConverter<List<DemandLogItem>, String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<DemandLogItem> list) {
        try {
            return mapper.writeValueAsString(list != null ? list : new ArrayList<>());
        } catch (Exception e) {
            return "[]";
        }
    }

    @Override
    public List<DemandLogItem> convertToEntityAttribute(String json) {
        try {
            if (json == null || json.isEmpty()) return new ArrayList<>();
            return mapper.readValue(json, new TypeReference<List<DemandLogItem>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}