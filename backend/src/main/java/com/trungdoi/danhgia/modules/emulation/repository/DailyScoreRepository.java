package com.trungdoi.danhgia.modules.emulation.repository;

import com.trungdoi.danhgia.modules.emulation.entity.DailyScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DailyScoreRepository extends JpaRepository<DailyScore, String> {
    List<DailyScore> findByScoreDateAndPlatoonId(String scoreDate, String platoonId);
    Optional<DailyScore> findBySoldierIdAndScoreDate(String soldierId, String scoreDate);
    List<DailyScore> findByScoreDate(String scoreDate);
}
