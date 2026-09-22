'use client';

import { useState, useEffect } from 'react';
import {
  UserAccount,
  Platoon,
  Soldier,
  DailyScore,
  CommendationItem,
  PlatoonAggregate,
} from './types';
import {
  MOCK_ACCOUNTS,
  MOCK_PLATOONS,
  MOCK_SOLDIERS,
  MOCK_DAILY_SCORES,
  MOCK_COMMENDATIONS,
  TODAY_DATE,
} from './mock-data';

const STORAGE_KEYS = {
  USER: 'thi_dua_user',
  SCORES: 'thi_dua_scores',
  COMMENDATIONS: 'thi_dua_commendations',
  SOLDIERS: 'thi_dua_soldiers',
};

export function useEmulationStore() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [soldiers, setSoldiers] = useState<Soldier[]>(MOCK_SOLDIERS);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>(MOCK_DAILY_SCORES);
  const [commendations, setCommendations] = useState<CommendationItem[]>(MOCK_COMMENDATIONS);
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

  // Tính toán bảng tổng hợp xếp hạng 3 Trung đội theo ngày được chọn
  const getPlatoonAggregates = (date: string = selectedDate): PlatoonAggregate[] => {
    const platoons = MOCK_PLATOONS;
    const scoresForDate = dailyScores.filter((s) => s.date === date);

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
          rank: 0,
          generalRemark: 'Chưa có dữ liệu chấm điểm',
        };
      }

      const count = soldierScores.length;
      const avgPolitical = Math.round((soldierScores.reduce((acc, s) => acc + s.politicalScore, 0) / count) * 10) / 10;
      const avgTask = Math.round((soldierScores.reduce((acc, s) => acc + s.taskScore, 0) / count) * 10) / 10;
      const avgHygiene = Math.round((soldierScores.reduce((acc, s) => acc + s.hygieneScore, 0) / count) * 10) / 10;
      const avgBearing = Math.round((soldierScores.reduce((acc, s) => acc + s.bearingScore, 0) / count) * 10) / 10;
      const avgTotal = Math.round(avgPolitical + avgTask + avgHygiene + avgBearing);

      let remark = '';
      if (p.id === 'td1') remark = 'Gấp chăn màn vuông đẹp, lễ tiết tác phong nghiêm túc';
      else if (p.id === 'td2') remark = 'Chính trị vững vàng, cần chấn chỉnh sắp xếp giày dép';
      else if (p.id === 'td3') remark = 'Nhiệm vụ xuất sắc, cần rút kinh nghiệm xưng hô giờ nghỉ';

      return {
        platoonId: p.id,
        platoonName: p.name,
        totalSoldiers: platoonSoldiers.length,
        avgPolitical,
        avgTask,
        avgHygiene,
        avgBearing,
        avgTotal,
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
    selectedDate,
    setSelectedDate,
    login,
    logout,
    saveDailyScore,
    addCommendation,
    updateSoldier,
    addSoldier,
    deleteSoldier,
    getPlatoonAggregates,
  };
}
