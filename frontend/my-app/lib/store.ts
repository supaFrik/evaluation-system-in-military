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
import {
  TODAY_DATE,
  ALL_UNITS,
  DEFAULT_CRITERIA,
  MOCK_SOLDIERS,
  mockUsers,
  mockAppeals,
} from './mock-data';
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
  APPEALS: 'thi_dua_appeals',
};

export function useEmulationStore() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [units, setUnits] = useState<MilitaryUnit[]>(ALL_UNITS);
  const [users, setUsers] = useState<UserAccount[]>(mockUsers);
  const [appeals, setAppeals] = useState<EmulationAppeal[]>(mockAppeals);
  const [unitRemarks, setUnitRemarks] = useState<Record<string, string>>({});
  const [soldiers, setSoldiers] = useState<Soldier[]>(MOCK_SOLDIERS);
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [commendations, setCommendations] = useState<CommendationItem[]>([]);
  const [criteria, setCriteria] = useState<EmulationCriterion[]>(DEFAULT_CRITERIA);
  const [dailyLocks, setDailyLocks] = useState<Record<string, DailyLockStatus>>({});
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Trạng thái đơn vị phân cấp đang chọn ─────────────────────────
  const [selectedUnitId, setSelectedUnitId] = useState<string>('e335');
  const [selectedTier, setSelectedTier] = useState<UnitTier>('REGIMENT');

  // Khởi tạo và nạp dữ liệu từ Real API
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

        // Tạm nạp từ cache để render nhanh
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

        // Gọi Backend GET /auth/me nếu có token để xác thực token và lấy thông tin chính thức từ CSDL
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
            // Nếu lỗi mạng hoặc server tạm thời nhưng có savedUser, giữ nguyên để không làm gián đoạn UI
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

        // Nạp appeals từ cache LocalStorage hoặc mockAppeals
        if (typeof window !== 'undefined') {
          const savedAppeals = localStorage.getItem(STORAGE_KEYS.APPEALS);
          if (savedAppeals) {
            try {
              const parsedAppeals = JSON.parse(savedAppeals);
              if (Array.isArray(parsedAppeals) && parsedAppeals.length > 0 && isMounted) {
                setAppeals(parsedAppeals);
              } else if (isMounted) {
                setAppeals(mockAppeals);
                localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(mockAppeals));
              }
            } catch {
              if (isMounted) setAppeals(mockAppeals);
            }
          } else {
            if (isMounted) setAppeals(mockAppeals);
            localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(mockAppeals));
          }
        }

        // 2. Gọi Real API song song để nạp đầy đủ các thực thể
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

        // Cập nhật Units
        if (unitsRes.status === 'fulfilled' && unitsRes.value?.length > 0) {
          setUnits(unitsRes.value);
        }

        // Cập nhật Soldiers
        if (soldiersRes.status === 'fulfilled' && soldiersRes.value?.length > 0) {
          setSoldiers(soldiersRes.value.map((s) => ({ ...s, avatarUrl: s.avatarUrl || '/default-avatar.png' })));
        }

        // Cập nhật Criteria
        if (criteriaRes.status === 'fulfilled' && criteriaRes.value?.length > 0) {
          setCriteria(criteriaRes.value);
        }

        // Cập nhật Daily Scores & Locks
        if (dailyScoresRes.status === 'fulfilled' && dailyScoresRes.value) {
          if (dailyScoresRes.value.scores) {
            setDailyScores(dailyScoresRes.value.scores);
          }
          if (dailyScoresRes.value.lockStatus) {
            setDailyLocks((prev) => ({ ...prev, [selectedDate]: dailyScoresRes.value.lockStatus }));
          }
        }

        // Cập nhật Commendations
        if (commendationsRes.status === 'fulfilled' && Array.isArray(commendationsRes.value)) {
          setCommendations(commendationsRes.value);
        }

        // Cập nhật Lock Status nếu có
        if (lockStatusRes.status === 'fulfilled' && lockStatusRes.value) {
          setDailyLocks((prev) => ({ ...prev, [selectedDate]: lockStatusRes.value }));
        }

        // Cập nhật Appeals
        if (appealsRes.status === 'fulfilled' && Array.isArray(appealsRes.value) && appealsRes.value.length > 0) {
          setAppeals(appealsRes.value);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(appealsRes.value));
          }
        }

        // Cập nhật Users từ Backend nếu có
        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) && usersRes.value.length > 0) {
          setUsers(usersRes.value);
        }
      } catch (err: any) {
        console.warn('Lỗi kết nối Real API, sử dụng dữ liệu cục bộ:', err);
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
      if (data && data.length > 0) {
        setUsers(data);
        return data;
      }
    } catch (error: any) {
      console.warn('Lỗi lấy danh sách tài khoản từ API:', error);
    }
    setUsers((prev) => (prev.length > 0 ? prev : mockUsers));
    return mockUsers;
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
      const baseUsers = users.length > 0 ? users : mockUsers;
      const updatedUsers = baseUsers.map((user) => {
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

      setUsers(updatedUsers);

      // Cập nhật currentUser nếu bị ảnh hưởng
      if (currentUser) {
        const updatedCurrent = updatedUsers.find((u) => u.id === currentUser.id);
        if (updatedCurrent) {
          setCurrentUser(updatedCurrent);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedCurrent));
          }
        }
      }

      // Đồng bộ tới backend API nếu có
      const usersToSync = updatedUsers.filter((u) => {
        const prev = baseUsers.find((p) => p.id === u.id);
        const prevIds = prev?.assignedUnitIds || [];
        return (
          prevIds.length !== u.assignedUnitIds.length ||
          prevIds.some((id) => !u.assignedUnitIds.includes(id))
        );
      });

      await Promise.allSettled(
        usersToSync.map((u) => userService.assignUnitsToUser(u.id, u.assignedUnitIds))
      );

      notify.success('Phân quyền thành công', 'Đã cập nhật danh sách cán bộ chấm điểm cho đơn vị');
    } catch (error: unknown) {
      console.error('Lỗi phân quyền cán bộ chấm điểm:', error);
      const errMsg = error instanceof Error ? error.message : 'Không thể cập nhật phân quyền cán bộ';
      notify.error('Lỗi phân quyền', errMsg);
      throw error;
    }
  };

  // ── Khiếu nại Thi đua (Emulation Appeals) ─────────────────────────
  const createAppeal = async (
    appealData: Omit<EmulationAppeal, 'id' | 'status' | 'createdAt'>
  ): Promise<EmulationAppeal> => {
    const newAppeal: EmulationAppeal = {
      ...appealData,
      id: `appeal-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    let finalAppeal = newAppeal;
    try {
      const apiResult = await appealService.createAppeal(appealData);
      if (apiResult && apiResult.id) {
        finalAppeal = apiResult;
      }
    } catch (err) {
      console.warn('Backend API createAppeal không khả dụng, lưu vào local store:', err);
    }

    setAppeals((prev) => {
      const updated = [finalAppeal, ...prev.filter((a) => a.id !== finalAppeal.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(updated));
      }
      return updated;
    });

    notify.success('Gửi khiếu nại thành công', 'Ý kiến của đồng chí đã được chuyển tới cán bộ phụ trách');
    return finalAppeal;
  };

  const resolveAppeal = async (
    appealId: string,
    status: AppealStatus,
    reply: string
  ): Promise<EmulationAppeal> => {
    const resolvedAt = new Date().toISOString();
    const resolvedBy = currentUser?.name || currentUser?.username || 'Cán bộ phụ trách';
    const targetAppeal = appeals.find((a) => a.id === appealId);

    let resolvedItem: EmulationAppeal | undefined;
    try {
      const apiResult = await appealService.resolveAppeal(appealId, status, reply, resolvedBy);
      if (apiResult && apiResult.id) {
        resolvedItem = apiResult;
      }
    } catch (err) {
      console.warn('Backend API resolveAppeal không khả dụng, cập nhật local store:', err);
    }

    let finalItem: EmulationAppeal =
      resolvedItem ||
      (targetAppeal
        ? { ...targetAppeal, status, reply, resolvedAt, resolvedBy }
        : ({
            id: appealId,
            soldierId: '',
            soldierName: '',
            unitId: '',
            unitName: '',
            date: selectedDate,
            reason: '',
            status,
            reply,
            createdAt: resolvedAt,
            resolvedAt,
            resolvedBy,
          } as EmulationAppeal));

    setAppeals((prev) => {
      const updated = prev.map((item) => {
        if (item.id === appealId) {
          finalItem = resolvedItem || {
            ...item,
            status,
            reply,
            resolvedAt,
            resolvedBy,
          };
          return finalItem;
        }
        return item;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(updated));
      }
      return updated;
    });

    // Tự động hoàn lại số điểm bị trừ vào tiêu chí tương ứng của quân nhân trong ngày đó nếu APPROVED
    if (status === 'APPROVED' && targetAppeal && targetAppeal.status !== 'APPROVED') {
      const pointsToRestore = Math.abs(targetAppeal.deductionPoints ?? 5);
      const critName = (targetAppeal.criterionName || '').toLowerCase();
      const targetCritId =
        targetAppeal.criterionId ||
        (critName.includes('nhiệm vụ') || critName.includes('huấn luyện')
          ? 'c_task'
          : critName.includes('nội vụ') || critName.includes('vệ sinh')
            ? 'c_hygiene'
            : critName.includes('lễ tiết') || critName.includes('tác phong') || critName.includes('kỷ luật')
              ? 'c_bearing'
              : 'c_political');

      setDailyScores((prev) => {
        const idx = prev.findIndex(
          (s) => s.soldierId === targetAppeal.soldierId && s.date === targetAppeal.date
        );
        const existing: DailyScore =
          idx >= 0
            ? prev[idx]
            : {
                id: `sc-${targetAppeal.soldierId}-${targetAppeal.date}`,
                soldierId: targetAppeal.soldierId,
                soldierName: targetAppeal.soldierName,
                platoonId: targetAppeal.unitId,
                date: targetAppeal.date,
                politicalScore: 100,
                taskScore: 100,
                hygieneScore: 100,
                bearingScore: 100,
                totalScore: 400,
                criteriaScores: {
                  c_political: 100,
                  c_task: 100,
                  c_hygiene: 100,
                  c_bearing: 100,
                },
                violations: [],
                evaluatedBy: resolvedBy,
              };

        const critScores = { ...(existing.criteriaScores || {}) };
        let politicalScore = existing.politicalScore ?? 100;
        let taskScore = existing.taskScore ?? 100;
        let hygieneScore = existing.hygieneScore ?? 100;
        let bearingScore = existing.bearingScore ?? 100;

        if (targetCritId === 'c_political') {
          politicalScore = Math.min(100, politicalScore + pointsToRestore);
          critScores['c_political'] = politicalScore;
        } else if (targetCritId === 'c_task') {
          taskScore = Math.min(100, taskScore + pointsToRestore);
          critScores['c_task'] = taskScore;
        } else if (targetCritId === 'c_hygiene') {
          hygieneScore = Math.min(100, hygieneScore + pointsToRestore);
          critScores['c_hygiene'] = hygieneScore;
        } else if (targetCritId === 'c_bearing') {
          bearingScore = Math.min(100, bearingScore + pointsToRestore);
          critScores['c_bearing'] = bearingScore;
        } else {
          critScores[targetCritId] = Math.min(100, (critScores[targetCritId] ?? 95) + pointsToRestore);
        }

        const activeCriteriaList = criteria.filter((c) => c.isActive);
        const totalScore =
          activeCriteriaList.length > 0
            ? activeCriteriaList.reduce(
                (sum, c) =>
                  sum +
                  (critScores[c.id] !== undefined
                    ? critScores[c.id]
                    : c.id === 'c_political'
                      ? politicalScore
                      : c.id === 'c_task'
                        ? taskScore
                        : c.id === 'c_hygiene'
                          ? hygieneScore
                          : c.id === 'c_bearing'
                            ? bearingScore
                            : c.maxScore),
                0
              )
            : politicalScore + taskScore + hygieneScore + bearingScore;

        const updatedScore: DailyScore = {
          ...existing,
          politicalScore,
          taskScore,
          hygieneScore,
          bearingScore,
          criteriaScores: critScores,
          totalScore,
          violations: [
            ...(existing.violations || []),
            {
              id: `v-appeal-${Date.now()}`,
              category: 'chinh_tri',
              content: `Hoàn điểm sau khiếu nại được chấp thuận (${targetAppeal.criterionName || 'Chung'}): +${pointsToRestore}đ`,
              points: pointsToRestore,
              criterionId: targetCritId,
            },
          ],
        };

        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedScore;
          return next;
        }
        return [updatedScore, ...prev];
      });
    }

    notify.success(
      'Đã xử lý khiếu nại',
      status === 'APPROVED'
        ? `Đã chấp thuận và hoàn lại ${Math.abs(targetAppeal?.deductionPoints ?? 5)}đ cho chiến sĩ`
        : 'Đã từ chối khiếu nại của chiến sĩ'
    );

    return finalItem;
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
