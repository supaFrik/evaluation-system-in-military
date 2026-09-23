package com.trungdoi.danhgia.modules.emulation.repository;

import com.trungdoi.danhgia.modules.emulation.entity.ViolationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRecordRepository extends JpaRepository<ViolationRecord, String> {
    List<ViolationRecord> findByDailyScoreId(String dailyScoreId);
}
