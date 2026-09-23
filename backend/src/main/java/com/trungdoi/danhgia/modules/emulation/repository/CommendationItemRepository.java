package com.trungdoi.danhgia.modules.emulation.repository;

import com.trungdoi.danhgia.modules.emulation.entity.CommendationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommendationItemRepository extends JpaRepository<CommendationItem, String> {
    List<CommendationItem> findByItemDateAndPlatoonId(String itemDate, String platoonId);
    List<CommendationItem> findByItemDate(String itemDate);
    List<CommendationItem> findByTargetId(String targetId);
}
