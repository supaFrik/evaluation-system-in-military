package com.trungdoi.danhgia.modules.soldier.repository;

import com.trungdoi.danhgia.modules.soldier.entity.Soldier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoldierRepository extends JpaRepository<Soldier, String> {
    Optional<Soldier> findByMilitaryCode(String militaryCode);
    List<Soldier> findBySquadId(String squadId);
    Page<Soldier> findBySquadId(String squadId, Pageable pageable);
    List<Soldier> findByPlatoonId(String platoonId);
    Page<Soldier> findByPlatoonId(String platoonId, Pageable pageable);
    List<Soldier> findByCompanyId(String companyId);
    Page<Soldier> findByCompanyId(String companyId, Pageable pageable);
    List<Soldier> findByBattalionId(String battalionId);
    Page<Soldier> findByBattalionId(String battalionId, Pageable pageable);
    long countBySquadId(String squadId);
    long countByPlatoonId(String platoonId);
    long countByCompanyId(String companyId);
    long countByBattalionId(String battalionId);

    @Query("SELECT s FROM Soldier s WHERE " +
           "(:unitId IS NULL OR :unitId = '' OR " +
           " LOWER(s.squadId) = LOWER(:unitId) OR " +
           " LOWER(s.platoonId) = LOWER(:unitId) OR " +
           " LOWER(s.companyId) = LOWER(:unitId) OR " +
           " LOWER(s.battalionId) = LOWER(:unitId)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.militaryCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Soldier> searchSoldiers(@Param("unitId") String unitId,
                                 @Param("search") String search,
                                 Pageable pageable);

    @Query("SELECT s FROM Soldier s WHERE " +
           "LOWER(s.squadId) = LOWER(:unitId) OR " +
           "LOWER(s.platoonId) = LOWER(:unitId) OR " +
           "LOWER(s.companyId) = LOWER(:unitId) OR " +
           "LOWER(s.battalionId) = LOWER(:unitId)")
    List<Soldier> findAllByAnyUnitId(@Param("unitId") String unitId);
}
