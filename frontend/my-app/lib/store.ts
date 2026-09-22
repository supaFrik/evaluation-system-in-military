'use client';

import { useState, useEffect } from 'react';
import {
  UserAccount,
  Platoon,
  Soldier,
  DailyScore,
  CommendationItem,
  PlatoonAggregate,
  EmulationCriterion,
  DailyLockStatus,
} from './types';
import {
  MOCK_ACCOUNTS,
  MOCK_PLATOONS,
  MOCK_SOLDIERS,
  MOCK_DAILY_SCORES,
  MOCK_COMMENDATIONS,
  TODAY_DATE,
  DEFAULT_CRITERIA,
} from './mock-data';

const STORAGE_KEYS = {
  USER: 'thi_dua_user',
  SCORES: 'thi_dua_scores',
  COMMENDATIONS: 'thi_dua_commendations',
  SOLDIERS: 'thi_dua_soldiers',
  CRITERIA: 'thi_dua_criteria',
  LOCKS: 'thi_dua_locks',
};

export function useEmulationStore() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [soldiers, setSoldiers] = useState<Soldier[]>(MOCK_SOLDIERS);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>(MOCK_DAILY_SCORES);
  const [commendations, setCommendations] = useState<CommendationItem[]>(MOCK_COMMENDATIONS);
  const [criteria, setCriteria] = useState<EmulationCriterion[]>(DEFAULT_CRITERIA);
  const [dailyLocks, setDailyLocks] = useState<Record<string, DailyLockStatus>>({});
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Khởi tạo từ LocalStorage nếu có
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // Mặc định ban đầu vào vai trò Chỉ huy để tiện xem toàn hệ thống
        setCurrentUser(MOCK_ACCOUNTS[0]);
      }

      const savedScores = localStorage.getItem(STORAGE_KEYS.SCORES);
      if (savedScores) setDailyScores(JSON.parse(savedScores));

      const savedCommendations = localStorage.getItem(STORAGE_KEYS.COMMENDATIONS);
      if (savedCommendations) setCommendations(JSON.parse(savedCommendations));

      const savedSoldiers = localStorage.getItem(STORAGE_KEYS.SOLDIERS);
      if (savedSoldiers) setSoldiers(JSON.parse(savedSoldiers));

      const savedCriteria = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      if (savedCriteria) {
        setCriteria(JSON.parse(savedCriteria));
      } else {
        setCriteria(DEFAULT_CRITERIA);
      }

      const savedLocks = localStorage.getItem(STORAGE_KEYS.LOCKS);
      if (savedLocks) setDailyLocks(JSON.parse(savedLocks));
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

  const saveDailyScore = (score: DailyScore) => {
    setDailyScores((prev) => {
      const index = prev.findIndex(
        (s) => s.soldierId === score.soldierId && s.date === score.date
      );
      let updated: DailyScore[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = score;
      } else {
        updated = [score, ...prev];
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
    // Nếu ngày trong quá khứ (< today) thì mặc định tự động khóa
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

  // ── Tính toán bảng tổng hợp xếp hạng 3 Trung đội theo ngày ───────
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
        soldierScores.reduce((acc, s) => acc + s.totalScore, 0) / count
      );

      let remark = '';
      if (p.id === 'td1') remark = 'Nội vụ vệ sinh vuông đẹp, lễ tiết tác phong nghiêm túc';
      else if (p.id === 'td2') remark = 'Chính trị vững vàng, cần chấn chỉnh việc duy trì trật tự';
      else if (p.id === 'td3') remark = 'Nhiệm vụ huấn luyện đạt kết quả cao, tác phong khẩn trương';

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

  return {
    currentUser,
    isLoaded,
    soldiers,
    dailyScores,
    commendations,
    criteria,
    dailyLocks,
    selectedDate,
    setSelectedDate,
    login,
    logout,
    saveDailyScore,
    addCommendation,
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
