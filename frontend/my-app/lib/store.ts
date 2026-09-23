'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserAccount,
  Platoon,
  Soldier,
  DailyScore,
  CommendationItem,
  PlatoonAggregate,
  UnitAggregate,
  EmulationCriterion,
  DailyLockStatus,
  UnitTier,
  MilitaryUnit,
} from './types';
import {
  MOCK_ACCOUNTS,
  MOCK_PLATOONS,
  MOCK_SOLDIERS,
  MOCK_DAILY_SCORES,
  MOCK_COMMENDATIONS,
  TODAY_DATE,
  DEFAULT_CRITERIA,
  ALL_UNITS,
  getChildUnits,
  getDescendantUnits,
} from './mock-data';

const STORAGE_KEYS = {
  USER: 'thi_dua_user',
  SCORES: 'thi_dua_scores',
  COMMENDATIONS: 'thi_dua_commendations',
  SOLDIERS: 'thi_dua_soldiers',
  CRITERIA: 'thi_dua_criteria',
  LOCKS: 'thi_dua_locks',
  SELECTED_UNIT: 'thi_dua_selected_unit',
  UNITS: 'thi_dua_units',
  UNIT_REMARKS: 'thi_dua_unit_remarks',
};

export function useEmulationStore() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [units, setUnits] = useState<MilitaryUnit[]>(ALL_UNITS);
  const [unitRemarks, setUnitRemarks] = useState<Record<string, string>>({});
  const [soldiers, setSoldiers] = useState<Soldier[]>(MOCK_SOLDIERS);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>(MOCK_DAILY_SCORES);
  const [commendations, setCommendations] = useState<CommendationItem[]>(MOCK_COMMENDATIONS);
  const [criteria, setCriteria] = useState<EmulationCriterion[]>(DEFAULT_CRITERIA);
  const [dailyLocks, setDailyLocks] = useState<Record<string, DailyLockStatus>>({});
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Trạng thái đơn vị phân cấp đang chọn ─────────────────────────
  const [selectedUnitId, setSelectedUnitId] = useState<string>('e335');
  const [selectedTier, setSelectedTier] = useState<UnitTier>('REGIMENT');

  // Khởi tạo từ LocalStorage nếu có
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser({ ...u, avatarUrl: u.avatarUrl || '/default-avatar.png' });
      } else {
        setCurrentUser(null);
      }

      const savedScores = localStorage.getItem(STORAGE_KEYS.SCORES);
      if (savedScores) setDailyScores(JSON.parse(savedScores));

      const savedCommendations = localStorage.getItem(STORAGE_KEYS.COMMENDATIONS);
      if (savedCommendations) setCommendations(JSON.parse(savedCommendations));

      const savedSoldiers = localStorage.getItem(STORAGE_KEYS.SOLDIERS);
      if (savedSoldiers) {
        const sList = JSON.parse(savedSoldiers);
        setSoldiers(sList.map((s: Soldier) => ({ ...s, avatarUrl: s.avatarUrl || '/default-avatar.png' })));
      }

      const savedCriteria = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      if (savedCriteria) {
        setCriteria(JSON.parse(savedCriteria));
      } else {
        setCriteria(DEFAULT_CRITERIA);
      }

      const savedLocks = localStorage.getItem(STORAGE_KEYS.LOCKS);
      if (savedLocks) setDailyLocks(JSON.parse(savedLocks));

      const savedUnits = localStorage.getItem(STORAGE_KEYS.UNITS);
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      } else {
        setUnits(ALL_UNITS);
      }

      const savedRemarks = localStorage.getItem(STORAGE_KEYS.UNIT_REMARKS);
      if (savedRemarks) {
        setUnitRemarks(JSON.parse(savedRemarks));
      }

      const savedUnit = localStorage.getItem(STORAGE_KEYS.SELECTED_UNIT);
      if (savedUnit) {
        const parsed = JSON.parse(savedUnit);
        setSelectedUnitId(parsed.unitId || 'e335');
        setSelectedTier(parsed.tier || 'REGIMENT');
      }
    } catch (e) {
      console.error('Failed to load from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Lưu lại vào LocalStorage khi có thay đổi
  const login = (account: UserAccount) => {
    setCurrentUser(account);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(account));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // ── Chọn đơn vị phân cấp ─────────────────────────────────────────
  const selectUnit = useCallback((unitId: string, tier: UnitTier) => {
    setSelectedUnitId(unitId);
    setSelectedTier(tier);
    localStorage.setItem(STORAGE_KEYS.SELECTED_UNIT, JSON.stringify({ unitId, tier }));
  }, []);

  // ── Lấy danh sách quân nhân thuộc đơn vị (đệ quy) ───────────────
  const getSoldiersForUnit = useCallback((unitId: string): Soldier[] => {
    const unit = units.find((u) => u.id === unitId) || ALL_UNITS.find((u) => u.id === unitId);
    if (!unit) return soldiers;

    switch (unit.tier) {
      case 'REGIMENT':
        return soldiers; // Toàn Trung đoàn
      case 'BATTALION':
        return soldiers.filter((s) => s.battalionId === unitId);
      case 'COMPANY':
        return soldiers.filter((s) => s.companyId === unitId);
      case 'PLATOON':
        return soldiers.filter((s) => s.platoonId === unitId);
      case 'SQUAD':
        return soldiers.filter((s) => s.squadId === unitId);
      default:
        return soldiers;
    }
  }, [soldiers, units]);

  // ── Quân nhân hiện tại theo đơn vị đang chọn ─────────────────────
  const filteredSoldiers = useMemo(
    () => getSoldiersForUnit(selectedUnitId),
    [selectedUnitId, getSoldiersForUnit]
  );

  const saveDailyScore = (score: DailyScore) => {
    const activeCriteriaList = criteria.filter((c) => c.isActive);
    const critScores = score.criteriaScores || {};
    const computedTotal = activeCriteriaList.reduce(
      (sum, c) => sum + (critScores[c.id] !== undefined ? critScores[c.id] : c.maxScore),
      0
    );
    const normalizedScore = { ...score, totalScore: computedTotal };

    setDailyScores((prev) => {
      const index = prev.findIndex(
        (s) => s.soldierId === score.soldierId && s.date === score.date
      );
      let updated: DailyScore[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = normalizedScore;
      } else {
        updated = [normalizedScore, ...prev];
      }
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(updated));
      return updated;
    });
  };

  const addCommendation = (item: Omit<CommendationItem, 'id' | 'date'>) => {
    const newItem: CommendationItem = {
      ...item,
      id: `c-${Date.now()}`,
      date: selectedDate,
    };
    setCommendations((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem(STORAGE_KEYS.COMMENDATIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const updateCommendation = (item: CommendationItem) => {
    setCommendations((prev) => {
      const updated = prev.map((c) => (c.id === item.id ? item : c));
      localStorage.setItem(STORAGE_KEYS.COMMENDATIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCommendation = (id: string) => {
    setCommendations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.COMMENDATIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const updateUnit = (updatedUnit: MilitaryUnit) => {
    setUnits((prev) => {
      const updated = prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u));
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(updated));
      return updated;
    });
  };

  const updateUnitRemark = (unitId: string, date: string, remark: string) => {
    setUnitRemarks((prev) => {
      const updated = { ...prev, [`${unitId}_${date}`]: remark };
      localStorage.setItem(STORAGE_KEYS.UNIT_REMARKS, JSON.stringify(updated));
      return updated;
    });
  };

  const updateSoldier = (soldier: Soldier) => {
    setSoldiers((prev) => {
      const updated = prev.map((s) => (s.id === soldier.id ? soldier : s));
      localStorage.setItem(STORAGE_KEYS.SOLDIERS, JSON.stringify(updated));
      return updated;
    });
  };

  const addSoldier = (soldier: Omit<Soldier, 'id'>) => {
    const newSoldier: Soldier = {
      ...soldier,
      id: `s-${Date.now()}`,
    };
    setSoldiers((prev) => {
      const updated = [...prev, newSoldier];
      localStorage.setItem(STORAGE_KEYS.SOLDIERS, JSON.stringify(updated));
      return updated;
    });
    return newSoldier;
  };

  const deleteSoldier = (soldierId: string) => {
    setSoldiers((prev) => {
      const updated = prev.filter((s) => s.id !== soldierId);
      localStorage.setItem(STORAGE_KEYS.SOLDIERS, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Quản lý Tiêu chí Thi đua Động (Criteria) ──────────────────────
  const addCriterion = (item: Omit<EmulationCriterion, 'id'>) => {
    const newCriterion: EmulationCriterion = {
      ...item,
      id: `crit_${Date.now()}`,
    };
    setCriteria((prev) => {
      const updated = [...prev, newCriterion];
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(updated));
      return updated;
    });
    return newCriterion;
  };

  const updateCriterion = (item: EmulationCriterion) => {
    setCriteria((prev) => {
      const updated = prev.map((c) => (c.id === item.id ? item : c));
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCriterion = (id: string) => {
    setCriteria((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleCriterion = (id: string) => {
    setCriteria((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      );
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Quản lý Khóa sổ Thi đua 21:00 (Daily Lock Status) ────────────
  const getDailyLockStatus = (date: string = selectedDate): DailyLockStatus => {
    if (dailyLocks[date]) {
      return dailyLocks[date];
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    // Nếu ngày trong quá khứ (<today) thì mặc định tự động khóa
    if (date < todayStr) {
      return {
        date,
        isLocked: true,
        lockedBy: 'Hệ thống tự động',
        lockedAt: `${date}T21:00:00.000Z`,
        lockNote: 'Tự động chốt sổ sau 21:00 (giờ điểm danh tối)',
      };
    }

    // Nếu là ngày hôm nay: kiểm tra giờ thực tế
    if (date === todayStr) {
      const now = new Date();
      if (now.getHours() >= 21) {
        return {
          date,
          isLocked: true,
          lockedBy: 'Hệ thống tự động',
          lockedAt: now.toISOString(),
          lockNote: 'Tự động chốt sổ sau 21:00 (giờ điểm danh tối)',
        };
      }
    }

    return {
      date,
      isLocked: false,
    };
  };

  const lockDate = (date: string, officerName: string, note?: string) => {
    const lockInfo: DailyLockStatus = {
      date,
      isLocked: true,
      lockedAt: new Date().toISOString(),
      lockedBy: officerName,
      lockNote: note || 'Chỉ huy đơn vị đã kiểm tra, phê duyệt và chốt sổ thi đua.',
    };
    setDailyLocks((prev) => {
      const updated = { ...prev, [date]: lockInfo };
      localStorage.setItem(STORAGE_KEYS.LOCKS, JSON.stringify(updated));
      return updated;
    });
  };

  const unlockDate = (date: string, officerName: string, reason: string) => {
    const current = dailyLocks[date];
    const newHistory = current?.unlockHistory ? [...current.unlockHistory] : [];
    newHistory.push({
      unlockedAt: new Date().toISOString(),
      unlockedBy: officerName,
      reason,
    });

    const unlockInfo: DailyLockStatus = {
      date,
      isLocked: false,
      lockedAt: undefined,
      lockedBy: undefined,
      lockNote: undefined,
      unlockHistory: newHistory,
    };

    setDailyLocks((prev) => {
      const updated = { ...prev, [date]: unlockInfo };
      localStorage.setItem(STORAGE_KEYS.LOCKS, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Tính toán bảng tổng hợp xếp hạng 3 Trung đội theo ngày (backward compat) ─
  const getPlatoonAggregates = (date: string = selectedDate): PlatoonAggregate[] => {
    const platoons = MOCK_PLATOONS;
    const scoresForDate = dailyScores.filter((s) => s.date === date);
    const activeCriteria = criteria.filter((c) => c.isActive);

    const aggregates: PlatoonAggregate[] = platoons.map((p) => {
      const platoonSoldiers = soldiers.filter((s) => s.platoonId === p.id);
      const soldierScores = platoonSoldiers
        .map((s) => scoresForDate.find((sc) => sc.soldierId === s.id))
        .filter((sc): sc is DailyScore => sc !== undefined);

      if (soldierScores.length === 0) {
        return {
          platoonId: p.id,
          platoonName: p.name,
          totalSoldiers: platoonSoldiers.length,
          avgPolitical: 0,
          avgTask: 0,
          avgHygiene: 0,
          avgBearing: 0,
          avgTotal: 0,
          avgCriteriaScores: {},
          rank: 0,
          generalRemark: 'Chưa có dữ liệu chấm điểm',
        };
      }

      const count = soldierScores.length;

      // Điểm trung bình các tiêu chí truyền thống
      const avgPolitical = Math.round((soldierScores.reduce((acc, s) => acc + (s.politicalScore || 0), 0) / count) * 10) / 10;
      const avgTask = Math.round((soldierScores.reduce((acc, s) => acc + (s.taskScore || 0), 0) / count) * 10) / 10;
      const avgHygiene = Math.round((soldierScores.reduce((acc, s) => acc + (s.hygieneScore || 0), 0) / count) * 10) / 10;
      const avgBearing = Math.round((soldierScores.reduce((acc, s) => acc + (s.bearingScore || 0), 0) / count) * 10) / 10;

      // Điểm trung bình cho các tiêu chí động
      const avgCriteriaScores: Record<string, number> = {};
      activeCriteria.forEach((crit) => {
        const sum = soldierScores.reduce((acc, s) => {
          if (s.criteriaScores && s.criteriaScores[crit.id] !== undefined) {
            return acc + s.criteriaScores[crit.id];
          }
          // Fallback sang tiêu chí tương ứng nếu có
          if (crit.id === 'c_political') return acc + (s.politicalScore || 0);
          if (crit.id === 'c_task') return acc + (s.taskScore || 0);
          if (crit.id === 'c_hygiene') return acc + (s.hygieneScore || 0);
          if (crit.id === 'c_bearing') return acc + (s.bearingScore || 0);
          return acc + crit.maxScore;
        }, 0);
        avgCriteriaScores[crit.id] = Math.round((sum / count) * 10) / 10;
      });

      const avgTotal = Math.round(
        soldierScores.reduce((acc, s) => {
          const sTotal = activeCriteria.reduce((sum, crit) => {
            if (s.criteriaScores && s.criteriaScores[crit.id] !== undefined) {
              return sum + s.criteriaScores[crit.id];
            }
            if (crit.id === 'c_political') return sum + (s.politicalScore || 0);
            if (crit.id === 'c_task') return sum + (s.taskScore || 0);
            if (crit.id === 'c_hygiene') return sum + (s.hygieneScore || 0);
            if (crit.id === 'c_bearing') return sum + (s.bearingScore || 0);
            return sum + crit.maxScore;
          }, 0);
          return acc + sTotal;
        }, 0) / count
      );

      let remark = '';
      if (p.id === 'C1-B1') remark = 'Nội vụ vệ sinh vuông đẹp, lễ tiết tác phong nghiêm túc';
      else if (p.id === 'C1-B2') remark = 'Chính trị vững vàng, cần chấn chỉnh việc duy trì trật tự';
      else if (p.id === 'C1-B3') remark = 'Nhiệm vụ huấn luyện đạt kết quả cao, tác phong khẩn trương';

      return {
        platoonId: p.id,
        platoonName: p.name,
        totalSoldiers: platoonSoldiers.length,
        avgPolitical,
        avgTask,
        avgHygiene,
        avgBearing,
        avgTotal,
        avgCriteriaScores,
        rank: 0,
        generalRemark: remark,
      };
    });

    // Xếp hạng giảm dần theo avgTotal
    aggregates.sort((a, b) => b.avgTotal - a.avgTotal);
    return aggregates.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  };

  // ── Tính toán bảng tổng hợp phân cấp (Adaptive Matrix) ───────────
  const getUnitAggregates = useCallback((parentUnitId: string, date: string = selectedDate): UnitAggregate[] => {
    const childUnits = units.filter((u) => u.parentId === parentUnitId);
    if (childUnits.length === 0) return [];

    const scoresForDate = dailyScores.filter((s) => s.date === date);
    const activeCriteria = criteria.filter((c) => c.isActive);

    const aggregates: UnitAggregate[] = childUnits.map((unit) => {
      // Lấy tất cả quân nhân thuộc đơn vị này (đệ quy)
      const unitSoldiers = getSoldiersForUnit(unit.id);
      const soldierScores = unitSoldiers
        .map((s) => scoresForDate.find((sc) => sc.soldierId === s.id))
        .filter((sc): sc is DailyScore => sc !== undefined);

      const customRemark = unitRemarks[`${unit.id}_${date}`];

      if (soldierScores.length === 0) {
        return {
          unitId: unit.id,
          unitName: unit.name,
          unitCode: unit.code,
          tier: unit.tier,
          totalSoldiers: unitSoldiers.length,
          avgPolitical: 0,
          avgTask: 0,
          avgHygiene: 0,
          avgBearing: 0,
          avgTotal: 0,
          avgCriteriaScores: {},
          rank: 0,
          generalRemark: customRemark ?? 'Chưa có dữ liệu chấm điểm',
        };
      }

      const count = soldierScores.length;
      const avgPolitical = Math.round((soldierScores.reduce((acc, s) => acc + (s.politicalScore || 0), 0) / count) * 10) / 10;
      const avgTask = Math.round((soldierScores.reduce((acc, s) => acc + (s.taskScore || 0), 0) / count) * 10) / 10;
      const avgHygiene = Math.round((soldierScores.reduce((acc, s) => acc + (s.hygieneScore || 0), 0) / count) * 10) / 10;
      const avgBearing = Math.round((soldierScores.reduce((acc, s) => acc + (s.bearingScore || 0), 0) / count) * 10) / 10;

      const avgCriteriaScores: Record<string, number> = {};
      activeCriteria.forEach((crit) => {
        const sum = soldierScores.reduce((acc, s) => {
          if (s.criteriaScores && s.criteriaScores[crit.id] !== undefined) {
            return acc + s.criteriaScores[crit.id];
          }
          if (crit.id === 'c_political') return acc + (s.politicalScore || 0);
          if (crit.id === 'c_task') return acc + (s.taskScore || 0);
          if (crit.id === 'c_hygiene') return acc + (s.hygieneScore || 0);
          if (crit.id === 'c_bearing') return acc + (s.bearingScore || 0);
          return acc + crit.maxScore;
        }, 0);
        avgCriteriaScores[crit.id] = Math.round((sum / count) * 10) / 10;
      });

      const avgTotal = Math.round(
        soldierScores.reduce((acc, s) => {
          const sTotal = activeCriteria.reduce((sum, crit) => {
            if (s.criteriaScores && s.criteriaScores[crit.id] !== undefined) {
              return sum + s.criteriaScores[crit.id];
            }
            if (crit.id === 'c_political') return sum + (s.politicalScore || 0);
            if (crit.id === 'c_task') return sum + (s.taskScore || 0);
            if (crit.id === 'c_hygiene') return sum + (s.hygieneScore || 0);
            if (crit.id === 'c_bearing') return sum + (s.bearingScore || 0);
            return sum + crit.maxScore;
          }, 0);
          return acc + sTotal;
        }, 0) / count
      );

      return {
        unitId: unit.id,
        unitName: unit.name,
        unitCode: unit.code,
        tier: unit.tier,
        totalSoldiers: unitSoldiers.length,
        avgPolitical,
        avgTask,
        avgHygiene,
        avgBearing,
        avgTotal,
        avgCriteriaScores,
        rank: 0,
        generalRemark: customRemark ?? '',
      };
    });

    aggregates.sort((a, b) => b.avgTotal - a.avgTotal);
    return aggregates.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [dailyScores, criteria, selectedDate, getSoldiersForUnit, units, unitRemarks]);

  return {
    currentUser,
    isLoaded,
    soldiers,
    filteredSoldiers,
    dailyScores,
    commendations,
    criteria,
    dailyLocks,
    selectedDate,
    setSelectedDate,
    // Phân cấp đơn vị
    units,
    updateUnit,
    unitRemarks,
    updateUnitRemark,
    selectedUnitId,
    selectedTier,
    selectUnit,
    getSoldiersForUnit,
    getUnitAggregates,
    // Auth
    login,
    logout,
    // CRUD
    saveDailyScore,
    addCommendation,
    updateCommendation,
    deleteCommendation,
    updateSoldier,
    addSoldier,
    deleteSoldier,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    toggleCriterion,
    lockDate,
    unlockDate,
    getDailyLockStatus,
    getPlatoonAggregates,
  };
}
