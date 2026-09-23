package com.trungdoi.danhgia.modules.unit.repository;

import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import com.trungdoi.danhgia.common.enums.UnitTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilitaryUnitRepository extends JpaRepository<MilitaryUnit, String> {
    List<MilitaryUnit> findByParentId(String parentId);
    List<MilitaryUnit> findByTier(UnitTier tier);
    List<MilitaryUnit> findByParentIdIsNull();
}
