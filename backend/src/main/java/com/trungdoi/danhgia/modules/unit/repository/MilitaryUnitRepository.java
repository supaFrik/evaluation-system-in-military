package com.trungdoi.danhgia.modules.unit.repository;

import com.trungdoi.danhgia.common.enums.UnitTier;
import com.trungdoi.danhgia.modules.unit.entity.MilitaryUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilitaryUnitRepository extends JpaRepository<MilitaryUnit, String> {
    List<MilitaryUnit> findByParentId(String parentId);
    List<MilitaryUnit> findByTier(UnitTier tier);
    List<MilitaryUnit> findByParentIdIsNull();
    Optional<MilitaryUnit> findByCode(String code);
    Optional<MilitaryUnit> findByCodeIgnoreCase(String code);
    boolean existsByCode(String code);
    boolean existsByParentId(String parentId);
    long countByParentId(String parentId);
}
