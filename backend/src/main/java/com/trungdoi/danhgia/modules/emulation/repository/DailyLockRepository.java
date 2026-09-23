package com.trungdoi.danhgia.modules.emulation.repository;

import com.trungdoi.danhgia.modules.emulation.entity.DailyLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DailyLockRepository extends JpaRepository<DailyLock, String> {
    Optional<DailyLock> findByLockDate(String lockDate);
}
