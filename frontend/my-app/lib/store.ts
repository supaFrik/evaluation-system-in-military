'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserAccount,
  Soldier,
  DailyScore,
  CommendationItem,
  PlatoonAggregate,
  UnitAggregate,
  EmulationCriterion,
  DailyLockStatus,
  UnitTier,
  MilitaryUnit,
  EmulationAppeal,
  AppealStatus,
} from './types';
import { TODAY_DATE } from './mock-data';
import {
  authService,
  unitService,
  soldierService,
  scoreService,
  criteriaService,
  commendationService,
  userService,
  appealService,
  AUTH_TOKEN_KEY,
} from './api';
import { notify } from './notify';

const STORAGE_KEYS = {
  USER: 'thi_dua_user',
  SELECTED_UNIT: 'thi_dua_selected_unit',
};

export function useEmulationStore() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [units, setUnits] = useState<MilitaryUnit[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [appeals, setAppeals] = useState<EmulationAppeal[]>([]);
  const [unitRemarks, setUnitRemarks] = useState<Record<string, string>>({});
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [commendations, setCommendations] = useState<CommendationItem[]>([]);
  const [criteria, setCriteria] = useState<EmulationCriterion[]>([]);
  const [dailyLocks, setDailyLocks] = useState<Record<string, DailyLockStatus>>({});
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Trạng thái đơn vị phân cấp đang chọn ─────────────────────────
  const [selectedUnitId, setSelectedUnitId] = useState<string>('e335');
  const [selectedTier, setSelectedTier] = useState<UnitTier>('REGIMENT');

  // Khởi tạo và nạp dữ liệu 100% từ Real API (CSDL MySQL)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // 1. Phục hồi và xác thực thông tin người dùng từ Backend (Single Source of Truth)
        const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER) : null;

        if (!token && !savedUser) {
          if (isMounted) {
            setCurrentUser(null);
            setIsLoaded(true);
          }
          return;
        }

        if (savedUser) {
          try {
            const u = JSON.parse(savedUser);
            if (isMounted) {
              setCurrentUser({ ...u, avatarUrl: u.avatarUrl || '/default-avatar.png' });
            }
          } catch {
            // ignore
          }
        }

        if (token) {
          try {
            const me = await authService.getMe();
            if (isMounted && me) {
              const updatedUser = { ...me, avatarUrl: me.avatarUrl || '/default-avatar.png' };
              setCurrentUser(updatedUser);
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
            }
          } catch (authErr: any) {
            console.warn('Backend chưa phản hồi hoặc lỗi kết nối phiên làm việc:', authErr);
            if (authErr?.status === 401 || authErr?.status === 403) {
              if (isMounted) {
                authService.logout();
                setCurrentUser(null);
                setIsLoaded(true);
                return;
              }
            }
          }
        }

        const savedUnit = localStorage.getItem(STORAGE_KEYS.SELECTED_UNIT);
        if (savedUnit) {
          try {
            const parsed = JSON.parse(savedUnit);
            if (isMounted) {
              setSelectedUnitId(parsed.unitId || 'e335');
              setSelectedTier(parsed.tier || 'REGIMENT');
            }
          } catch {
            // ignore
          }
        }

        // Xóa cache appeals giả lập cũ nếu từng lưu trong LocalStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('thi_dua_appeals');
        }

        // 2. Gọi Real API song song để nạp đầy đủ các thực thể từ CSDL
        const [
          unitsRes,
          soldiersRes,
          criteriaRes,
          dailyScoresRes,
          commendationsRes,
          lockStatusRes,
          appealsRes,
          usersRes,
        ] = await Promise.allSettled([
          unitService.getAllUnits(),
          soldierService.getAllSoldiers(),
          criteriaService.getCriteria(),
          scoreService.getDailyScores(selectedDate),
          commendationService.getCommendations({ date: selectedDate }),
          scoreService.getDailyLockStatus(selectedDate),
          appealService.getAppeals(),
          userService.getAllUsers(),
        ]);

        if (!isMounted) return;

        if (unitsRes.status === 'fulfilled' && Array.isArray(unitsRes.value)) {
          setUnits(unitsRes.value);
        }

        if (soldiersRes.status === 'fulfilled' && Array.isArray(soldiersRes.value)) {
          setSoldiers(soldiersRes.value.map((s) => ({ ...s, avatarUrl: s.avatarUrl || '/default-avatar.png' })));
        }

        if (criteriaRes.status === 'fulfilled' && Array.isArray(criteriaRes.value)) {
          setCriteria(criteriaRes.value);
        }

        if (dailyScoresRes.status === 'fulfilled' && dailyScoresRes.value) {
          if (Array.isArray(dailyScoresRes.value.scores)) {
            setDailyScores(dailyScoresRes.value.scores);
          }
          if (dailyScoresRes.value.lockStatus) {
            setDailyLocks((prev) => ({ ...prev, [selectedDate]: dailyScoresRes.value.lockStatus }));
          }
        }

        if (commendationsRes.status === 'fulfilled' && Array.isArray(commendationsRes.value)) {
          setCommendations(commendationsRes.value);
        }

        if (lockStatusRes.status === 'fulfilled' && lockStatusRes.value) {
          setDailyLocks((prev) => ({ ...prev, [selectedDate]: lockStatusRes.value }));
        }

        if (appealsRes.status === 'fulfilled' && Array.isArray(appealsRes.value)) {
          setAppeals(appealsRes.value);
        }

        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
          setUsers(usersRes.value);
        }
      } catch (err: any) {
        console.error('Lỗi kết nối Real API:', err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Auth actions
  const login = (account: UserAccount) => {
    setCurrentUser(account);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(account));
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // ── Chọn đơn vị phân cấp ─────────────────────────────────────────
  const selectUnit = useCallback((unitId: string, tier: UnitTier) => {
    setSelectedUnitId(unitId);
    setSelectedTier(tier);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_UNIT, JSON.stringify({ unitId, tier }));
    }
  }, []);

  // ── Lấy danh sách quân nhân thuộc đơn vị (đệ quy) ───────────────
  const getSoldiersForUnit = useCallback((unitId: string): Soldier[] => {
    const unit = units.find((u) => u.id === unitId);
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

  // ── Chấm điểm thi đua hàng ngày (Strict Real API) ───────────────
  const saveDailyScore = async (score: DailyScore) => {
    try {
      const activeCriteriaList = criteria.filter((c) => c.isActive);
      const critScores = score.criteriaScores || {};
      const computedTotal = activeCriteriaList.reduce(
        (sum, c) => sum + (critScores[c.id] !== undefined ? critScores[c.id] : c.maxScore),
        0
      );
      const payload = { ...score, totalScore: computedTotal };

      const savedScore = await scoreService.saveDailyScore(payload);

      setDailyScores((prev) => {
        const index = prev.findIndex(
          (s) => s.soldierId === score.soldierId && s.date === score.date
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedScore;
          return updated;
        } else {
          return [savedScore, ...prev];
        }
      });

      notify.success('Đã lưu điểm', `Cập nhật thành công cho ${score.soldierName || 'quân nhân'}`);
      return savedScore;
    } catch (error: any) {
      const errorMsg = error?.message || 'Không thể lưu điểm thi đua';
      notify.error('Lỗi lưu điểm', errorMsg);
      throw error;
    }
  };

  // ── Biểu dương / Nhắc nhở (Strict Real API) ────────────────────
  const addCommendation = async (item: Omit<CommendationItem, 'id' | 'date'>) => {
    try {
      const payload = {
        ...item,
        date: selectedDate,
      };
      const created = await commendationService.createCommendation(payload as any);
      setCommendations((prev) => [created, ...prev]);
      notify.success('Thành công', 'Đã tạo phiếu biểu dương / nhắc nhở');
      return created;
    } catch (error: any) {
      notify.error('Lỗi tạo biểu dương', error?.message || 'Không thể tạo phiếu');
      throw error;
    }
  };

  const updateCommendation = (item: CommendationItem) => {
    setCommendations((prev) => prev.map((c) => (c.id === item.id ? item : c)));
  };

  const deleteCommendation = async (id: string) => {
    try {
      await commendationService.deleteCommendation(id);
      setCommendations((prev) => prev.filter((c) => c.id !== id));
      notify.success('Thành công', 'Đã xóa phiếu biểu dương / nhắc nhở');
    } catch (error: any) {
      notify.error('Lỗi xóa phiếu', error?.message || 'Không thể xóa phiếu');
      throw error;
    }
  };

  // ── Cập nhật thông tin Đơn vị (Strict Real API) ──────────────────
  const updateUnit = async (updatedUnit: MilitaryUnit) => {
    try {
      const saved = await unitService.updateUnit(updatedUnit.id, updatedUnit);
      setUnits((prev) => prev.map((u) => (u.id === updatedUnit.id ? saved : u)));
      notify.success('Thành công', 'Đã cập nhật thông tin đơn vị');
      return saved;
    } catch (error: any) {
      notify.error('Lỗi cập nhật', error?.message || 'Không thể cập nhật đơn vị');
      throw error;
    }
  };

  // ── Quản lý Đơn vị (Strict Real API) ──────────────────────────
  const addUnit = async (newUnit: Partial<MilitaryUnit>) => {
    try {
      const created = await unitService.createUnit(newUnit);
      setUnits((prev) => [...prev, created]);
      notify.success('Thành công', `Đã thêm đơn vị ${created.name}`);
      return created;
    } catch (error: any) {
      notify.error('Lỗi thêm đơn vị', error?.message || 'Không thể tạo đơn vị');
      throw error;
    }
  };

  const deleteUnit = async (unitId: string) => {
    try {
      await unitService.deleteUnit(unitId);
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      notify.success('Thành công', 'Đã xóa đơn vị');
    } catch (error: any) {
      notify.error('Lỗi xóa đơn vị', error?.message || 'Không thể xóa đơn vị');
      throw error;
    }
  };

  const assignUnitLeader = async (unitId: string, payload: { soldierId?: string; leaderName?: string; leaderTitle?: string }) => {
    try {
      const updated = await unitService.assignLeader(unitId, payload);
      setUnits((prev) => prev.map((u) => (u.id === unitId ? updated : u)));
      notify.success('Thành công', `Đã bổ nhiệm cán bộ cho ${updated.name}`);
      return updated;
    } catch (error: any) {
      notify.error('Lỗi bổ nhiệm', error?.message || 'Không thể bổ nhiệm cán bộ');
      throw error;
    }
  };

  const importUnitsExcel = async (file: File) => {
    try {
      const summary = await unitService.importUnitsExcel(file);
      // Nạp lại cây đơn vị sau khi import
      const refreshed = await unitService.getUnitTree();
      setUnits(refreshed);
      notify.success('Import thành công', summary.message);
      return summary;
    } catch (error: any) {
      notify.error('Lỗi Import Excel', error?.message || 'Không thể nạp file Excel');
      throw error;
    }
  };

  const recalculateHeadcounts = async () => {
    try {
      await unitService.recalculateHeadcounts();
      const refreshed = await unitService.getUnitTree();
      setUnits(refreshed);
      notify.success('Đồng bộ thành công', 'Đã cập nhật lại toàn bộ quân số các cấp');
    } catch (error: any) {
      notify.error('Lỗi đồng bộ', error?.message || 'Không thể đồng bộ quân số');
      throw error;
    }
  };

  const updateUnitRemark = async (unitId: string, date: string, remark: string) => {
    try {
      await unitService.saveRemark(unitId, date, remark);
      setUnitRemarks((prev) => ({ ...prev, [`${unitId}_${date}`]: remark }));
      notify.success('Đã lưu nhận xét', 'Cập nhật nhận xét đơn vị thành công');
    } catch (error: any) {
      notify.error('Lỗi lưu nhận xét', error?.message || 'Không thể lưu nhận xét');
      throw error;
    }
  };

  // ── Quản lý Tài khoản & Phân quyền (Strict Real API) ─────────────
  const fetchUsers = useCallback(async () => {
    try {
      const data = await userService.getAllUsers();
      if (Array.isArray(data)) {
        setUsers(data);
        return data;
      }
      return [];
    } catch (error: any) {
      console.error('Lỗi lấy danh sách tài khoản từ API:', error);
      return [];
    }
  }, []);

  const assignUserSoldier = async (userId: string, soldierId: string) => {
    try {
      const updated = await userService.assignSoldier(userId, soldierId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notify.success('Thành công', 'Đã liên kết tài khoản với hồ sơ quân nhân');
      return updated;
    } catch (error: any) {
      notify.error('Lỗi liên kết', error?.message || 'Không thể liên kết hồ sơ');
      throw error;
    }
  };

  const updateUserRoleScope = async (userId: string, data: any) => {
    try {
      const updated = await userService.updateRoleScope(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      notify.success('Thành công', 'Đã cập nhật quyền và đơn vị phụ trách');
      return updated;
    } catch (error: any) {
      notify.error('Lỗi phân quyền', error?.message || 'Không thể cập nhật quyền');
      throw error;
    }
  };

  const deleteUserAccount = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      notify.success('Thành công', 'Đã xóa tài khoản');
    } catch (error: any) {
      notify.error('Lỗi xóa tài khoản', error?.message || 'Không thể xóa tài khoản');
      throw error;
    }
  };

  const assignScorersToUnit = async (unitId: string, scorerUserIds: string[]): Promise<void> => {
    try {
      const updatedUsers = users.map((user) => {
        const isAssigned = scorerUserIds.includes(user.id);
        const currentAssigned = Array.isArray(user.assignedUnitIds) ? [...user.assignedUnitIds] : [];
        let newAssigned: string[];

        if (isAssigned) {
          newAssigned = currentAssigned.includes(unitId) ? currentAssigned : [...currentAssigned, unitId];
        } else {
          newAssigned = currentAssigned.filter((id) => id !== unitId);
        }

        return {
          ...user,
          assignedUnitIds: newAssigned,
          assignedUnitId: newAssigned[0] || undefined,
        };
      });

      const usersToSync = updatedUsers.filter((u) => {
        const prev = users.find((p) => p.id === u.id);
        const prevIds = prev?.assignedUnitIds || [];
        return (
          prevIds.length !== u.assignedUnitIds.length ||
          prevIds.some((id) => !u.assignedUnitIds.includes(id))
        );
      });

      await Promise.all(
        usersToSync.map((u) => userService.assignUnitsToUser(u.id, u.assignedUnitIds))
      );

      setUsers(updatedUsers);

      if (currentUser) {
        const updatedCurrent = updatedUsers.find((u) => u.id === currentUser.id);
        if (updatedCurrent) {
          setCurrentUser(updatedCurrent);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedCurrent));
          }
        }
      }

      notify.success('Phân quyền thành công', 'Đã cập nhật danh sách cán bộ chấm điểm cho đơn vị');
    } catch (error: unknown) {
      console.error('Lỗi phân quyền cán bộ chấm điểm:', error);
      const errMsg = error instanceof Error ? error.message : 'Không thể cập nhật phân quyền cán bộ';
      notify.error('Lỗi phân quyền', errMsg);
      throw error;
    }
  };

  // ── Khiếu nại Thi đua (Strict Real API) ───────────────────────────
  const createAppeal = async (
    appealData: Omit<EmulationAppeal, 'id' | 'status' | 'createdAt'>
  ): Promise<EmulationAppeal> => {
    try {
      const created = await appealService.createAppeal(appealData);
      setAppeals((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
      notify.success('Gửi khiếu nại thành công', 'Ý kiến của đồng chí đã được chuyển tới cán bộ phụ trách');
      return created;
    } catch (error: any) {
      notify.error('Lỗi gửi khiếu nại', error?.message || 'Không thể tạo đơn khiếu nại');
      throw error;
    }
  };

  const resolveAppeal = async (
    appealId: string,
    status: AppealStatus,
    reply: string
  ): Promise<EmulationAppeal> => {
    const resolvedBy = currentUser?.name || currentUser?.username || 'Cán bộ phụ trách';
    const targetAppeal = appeals.find((a) => a.id === appealId);

    try {
      const resolvedItem = await appealService.resolveAppeal(appealId, status, reply, resolvedBy);
      setAppeals((prev) => prev.map((item) => (item.id === appealId ? resolvedItem : item)));

      if (status === 'APPROVED' && targetAppeal) {
        try {
          const refreshedScores = await scoreService.getDailyScores(selectedDate);
          if (refreshedScores?.scores) {
            setDailyScores(refreshedScores.scores);
          }
        } catch {
          // ignore
        }
      }

      notify.success(
        'Đã xử lý khiếu nại',
        status === 'APPROVED'
          ? `Đã chấp thuận và hoàn lại ${Math.abs(targetAppeal?.deductionPoints ?? 5)}đ cho chiến sĩ`
          : 'Đã từ chối khiếu nại của chiến sĩ'
      );

      return resolvedItem;
    } catch (error: any) {
      notify.error('Lỗi xử lý khiếu nại', error?.message || 'Không thể lưu phản hồi khiếu nại');
      throw error;
    }
  };

  // ── Quản lý Quân nhân (Strict Real API) ─────────────────────────
  const addSoldier = async (soldier: Omit<Soldier, 'id'>) => {
    try {
      const created = await soldierService.createSoldier(soldier);
      setSoldiers((prev) => [...prev, created]);
      notify.success('Thành công', `Đã thêm quân nhân ${created.name}`);
      return created;
    } catch (error: any) {
      notify.error('Lỗi thêm quân nhân', error?.message || 'Không thể thêm hồ sơ');
      throw error;
    }
  };

  const updateSoldier = async (soldier: Soldier) => {
    try {
      const updated = await soldierService.updateSoldier(soldier.id, soldier);
      setSoldiers((prev) => prev.map((s) => (s.id === soldier.id ? updated : s)));
      notify.success('Thành công', `Đã cập nhật hồ sơ quân nhân ${soldier.name}`);
      return updated;
    } catch (error: any) {
      notify.error('Lỗi cập nhật quân nhân', error?.message || 'Không thể cập nhật');
      throw error;
    }
  };

  const deleteSoldier = async (soldierId: string) => {
    try {
      await soldierService.deleteSoldier(soldierId);
      setSoldiers((prev) => prev.filter((s) => s.id !== soldierId));
      notify.success('Thành công', 'Đã xóa hồ sơ quân nhân');
    } catch (error: any) {
      notify.error('Lỗi xóa quân nhân', error?.message || 'Không thể xóa hồ sơ');
      throw error;
    }
  };

  // ── Quản lý Tiêu chí Thi đua Động (Strict Real API) ───────────────
  const addCriterion = async (item: Omit<EmulationCriterion, 'id'>) => {
    try {
      const created = await criteriaService.createCriterion(item);
      setCriteria((prev) => [...prev, created]);
      notify.success('Thành công', `Đã thêm tiêu chí ${created.name}`);
      return created;
    } catch (error: any) {
      notify.error('Lỗi thêm tiêu chí', error?.message || 'Không thể thêm tiêu chí');
      throw error;
    }
  };

  const updateCriterion = async (item: EmulationCriterion) => {
    try {
      const updated = await criteriaService.updateCriterion(item.id, item);
      setCriteria((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
      notify.success('Thành công', 'Đã cập nhật tiêu chí thi đua');
      return updated;
    } catch (error: any) {
      notify.error('Lỗi cập nhật tiêu chí', error?.message || 'Không thể cập nhật');
      throw error;
    }
  };

  const deleteCriterion = async (id: string) => {
    try {
      await criteriaService.deleteCriterion(id);
      setCriteria((prev) => prev.filter((c) => c.id !== id));
      notify.success('Thành công', 'Đã xóa tiêu chí');
    } catch (error: any) {
      notify.error('Lỗi xóa tiêu chí', error?.message || 'Không thể xóa tiêu chí');
      throw error;
    }
  };

  const toggleCriterion = async (id: string) => {
    try {
      const updated = await criteriaService.toggleCriterion(id);
      setCriteria((prev) => prev.map((c) => (c.id === id ? updated : c)));
      notify.success('Thành công', `Đã ${updated.isActive ? 'kích hoạt' : 'tắt'} tiêu chí`);
      return updated;
    } catch (error: any) {
      notify.error('Lỗi thao tác tiêu chí', error?.message || 'Không thể đổi trạng thái tiêu chí');
      throw error;
    }
  };

  // ── Quản lý Khóa sổ Thi đua 21:00 (Daily Lock Status) ────────────
  const getDailyLockStatus = (date: string = selectedDate): DailyLockStatus => {
    if (dailyLocks[date]) {
      return dailyLocks[date];
    }

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    if (date < todayStr) {
      return {
        date,
        isLocked: true,
        lockedBy: 'Hệ thống tự động',
        lockedAt: `${date}T21:00:00.000+07:00`,
        lockNote: 'Tự động chốt sổ sau 21:00 (giờ điểm danh tối)',
      };
    }

    if (date === todayStr) {
      const currentHour = new Date().getHours();
      if (currentHour >= 21) {
        return {
          date,
          isLocked: true,
          lockedBy: 'Hệ thống tự động',
          lockedAt: new Date().toISOString(),
          lockNote: 'Tự động chốt sổ sau 21:00 (giờ điểm danh tối)',
        };
      }
    }

    return {
      date,
      isLocked: false,
    };
  };

  const lockDate = async (date: string, officerName: string, note?: string) => {
    try {
      const lockStatus = await scoreService.lockDate({ date, officerName, note });
      setDailyLocks((prev) => ({ ...prev, [date]: lockStatus }));
      notify.success('Đã chốt sổ', `Đã chốt sổ thi đua ngày ${date}`);
      return lockStatus;
    } catch (error: any) {
      notify.error('Lỗi chốt sổ', error?.message || 'Không thể chốt sổ thi đua');
      throw error;
    }
  };

  const unlockDate = async (date: string, officerName: string, reason: string) => {
    try {
      const lockStatus = await scoreService.unlockDate({ date, officerName, reason });
      setDailyLocks((prev) => ({ ...prev, [date]: lockStatus }));
      notify.success('Đã mở khóa sổ', `Đã mở khóa sổ thi đua ngày ${date}`);
      return lockStatus;
    } catch (error: any) {
      notify.error('Lỗi mở khóa sổ', error?.message || 'Không thể mở khóa sổ');
      throw error;
    }
  };

  // ── Tính toán bảng tổng hợp xếp hạng 3 Trung đội theo ngày (backward compat) ─
  const getPlatoonAggregates = (date: string = selectedDate): PlatoonAggregate[] => {
    const platoons = [
      { id: 'C1-B1', name: 'Trung đội 1' },
      { id: 'C1-B2', name: 'Trung đội 2' },
      { id: 'C1-B3', name: 'Trung đội 3' },
    ];
    const scoresForDate = dailyScores.filter((s) => s.date === date);
    const activeCriteria = criteria.filter((c) => c.isActive);

    const aggregates: PlatoonAggregate[] = platoons.map((p) => {
      const platoonSoldiers = soldiers.filter(
        (s) => s.platoonId === p.id || (p.id === 'C1-B1' && (s.platoonId === 'b1' || s.platoonId === 'B1'))
      );
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
          if (crit.id === 'c_political' || crit.id === 'crit_ct') return acc + (s.politicalScore || 0);
          if (crit.id === 'c_task' || crit.id === 'crit_nv') return acc + (s.taskScore || 0);
          if (crit.id === 'c_hygiene' || crit.id === 'crit_nvvs') return acc + (s.hygieneScore || 0);
          if (crit.id === 'c_bearing' || crit.id === 'crit_ltp') return acc + (s.bearingScore || 0);
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
            if (crit.id === 'c_political' || crit.id === 'crit_ct') return sum + (s.politicalScore || 0);
            if (crit.id === 'c_task' || crit.id === 'crit_nv') return sum + (s.taskScore || 0);
            if (crit.id === 'c_hygiene' || crit.id === 'crit_nvvs') return sum + (s.hygieneScore || 0);
            if (crit.id === 'c_bearing' || crit.id === 'crit_ltp') return sum + (s.bearingScore || 0);
            return sum + crit.maxScore;
          }, 0);
          return acc + sTotal;
        }, 0) / count
      );

      const remark = unitRemarks[`${p.id}_${date}`] || '';

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
          if (crit.id === 'c_political' || crit.id === 'crit_ct') return acc + (s.politicalScore || 0);
          if (crit.id === 'c_task' || crit.id === 'crit_nv') return acc + (s.taskScore || 0);
          if (crit.id === 'c_hygiene' || crit.id === 'crit_nvvs') return acc + (s.hygieneScore || 0);
          if (crit.id === 'c_bearing' || crit.id === 'crit_ltp') return acc + (s.bearingScore || 0);
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
            if (crit.id === 'c_political' || crit.id === 'crit_ct') return sum + (s.politicalScore || 0);
            if (crit.id === 'c_task' || crit.id === 'crit_nv') return sum + (s.taskScore || 0);
            if (crit.id === 'c_hygiene' || crit.id === 'crit_nvvs') return sum + (s.hygieneScore || 0);
            if (crit.id === 'c_bearing' || crit.id === 'crit_ltp') return sum + (s.bearingScore || 0);
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
    platoons: useMemo(() => {
      return units
        .filter((u) => u.tier === 'PLATOON')
        .map((u) => ({
          id: u.id,
          name: u.name,
          code: u.code,
          leaderName: u.leaderName,
          totalSoldiers: u.totalSoldiers,
        }));
    }, [units]),
    addUnit,
    updateUnit,
    deleteUnit,
    assignUnitLeader,
    importUnitsExcel,
    recalculateHeadcounts,
    unitRemarks,
    updateUnitRemark,
    selectedUnitId,
    selectedTier,
    selectUnit,
    getSoldiersForUnit,
    getUnitAggregates,
    // Quản lý Tài khoản & Phân quyền
    users,
    fetchUsers,
    assignUserSoldier,
    updateUserRoleScope,
    deleteUserAccount,
    assignScorersToUnit,
    // Khiếu nại Thi đua (Appeals)
    appeals,
    createAppeal,
    resolveAppeal,
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
