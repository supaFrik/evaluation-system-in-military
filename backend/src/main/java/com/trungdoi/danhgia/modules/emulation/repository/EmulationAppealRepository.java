package com.trungdoi.danhgia.modules.emulation.repository;

import com.trungdoi.danhgia.modules.emulation.entity.EmulationAppeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmulationAppealRepository extends JpaRepository<EmulationAppeal, String> {
    List<EmulationAppeal> findAllByOrderByCreatedAtDesc();
}
