package com.trungdoi.danhgia.modules.emulation.repository;

import com.trungdoi.danhgia.modules.emulation.entity.EmulationCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmulationCriterionRepository extends JpaRepository<EmulationCriterion, String> {
    List<EmulationCriterion> findByIsActiveTrue();
    Optional<EmulationCriterion> findByCode(String code);
}
