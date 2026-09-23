package com.trungdoi.danhgia.modules.unit.repository;

import com.trungdoi.danhgia.modules.unit.entity.UnitRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRemarkRepository extends JpaRepository<UnitRemark, String> {
    Optional<UnitRemark> findByUnitIdAndRemarkDate(String unitId, String remarkDate);
    List<UnitRemark> findByRemarkDate(String remarkDate);
    List<UnitRemark> findByUnitId(String unitId);
}
