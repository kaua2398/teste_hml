package com.valeshop.timesheet.repositories;

import com.valeshop.timesheet.entities.demands.DemandRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DemandRepository extends JpaRepository<DemandRecord, Long> {

    List<DemandRecord> findAllByUserId(Long userId);
    Optional<DemandRecord> findByIdAndUserId(Long id, Long userId);

}