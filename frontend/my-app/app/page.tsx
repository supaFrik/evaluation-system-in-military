'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEmulationStore } from '@/lib/store';
import { NavTabId, Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { EmulationDashboard } from '@/components/dashboard/emulation-dashboard';
import { IndividualEmulationBoard } from '@/components/dashboard/individual-emulation-board';
import { DailyScoringSheet } from '@/components/scoring/daily-scoring-sheet';
import { CommendationSection } from '@/components/commendation/commendation-section';
import { AddCommendationDialog } from '@/components/commendation/add-commendation-dialog';
import { SoldierList } from '@/components/soldiers/soldier-list';
import { SoldierProfile } from '@/components/profile/soldier-profile';
import { PlatoonAnalysis } from '@/components/reports/platoon-analysis';
import { CriteriaHandbook } from '@/components/criteria/criteria-handbook';
import { UnitManagement } from '@/components/unit/unit-management';
import { AppealManagement } from '@/components/appeal/appeal-management';
import { Soldier, UnitTier } from '@/lib/types';
import { notify } from '@/lib/notify';
import { User } from 'lucide-react';

const TAB_TO_VI_QUERY: Record<NavTabId, string> = {
  platoon_summary: 'bang-thi-dua',
  individual_emulation: 'thi-dua-ca-nhan',
  daily_scoring: 'nhap-diem-thi-dua',
  commendations: 'bieu-duong-nhac-nho',
  soldiers: 'danh-sach-quan-nhan',
  soldier_profile: 'ho-so-quan-nhan',
  reports: 'bao-cao-danh-gia',
  units: 'cay-don-vi',
  criteria: 'quy-che-cham-diem',
  appeals: 'khieu-nai',
};

const QUERY_TO_TAB: Record<string, NavTabId> = {
  // Slug tiếng Việt chuẩn
  'bang-thi-dua': 'platoon_summary',
  'tong-hop-thi-dua': 'platoon_summary',
  'thi-dua-ca-nhan': 'individual_emulation',
  'ket-qua-thi-dua': 'individual_emulation',
  'nhap-diem-thi-dua': 'daily_scoring',
  'cham-diem-thi-dua': 'daily_scoring',
  'bieu-duong-nhac-nho': 'commendations',
  'khen-thuong': 'commendations',
  'danh-sach-quan-nhan': 'soldiers',
  'quan-nhan': 'soldiers',
  'ho-so-quan-nhan': 'soldier_profile',
  'ho-so-ca-nhan': 'soldier_profile',
  'bao-cao-danh-gia': 'reports',
  'bao-cao': 'reports',
  'cay-don-vi': 'units',
  'don-vi': 'units',
  'quy-che-cham-diem': 'criteria',
  'quy-che-thi-dua': 'criteria',
  'khieu-nai': 'appeals',
  'xu-ly-khieu-nai': 'appeals',
  // Tương thích ngược với các mã tiếng Anh cũ
  platoon_summary: 'platoon_summary',
  individual_emulation: 'individual_emulation',
  daily_scoring: 'daily_scoring',
  commendations: 'commendations',
  soldiers: 'soldiers',
  soldier_profile: 'soldier_profile',
  reports: 'reports',
  units: 'units',
  criteria: 'criteria',
  appeals: 'appeals',
};

function getTabUrl(tab: NavTabId): string {
  return tab === 'platoon_summary' ? '/' : `/?tab=${TAB_TO_VI_QUERY[tab]}`;
}

function parseTab(tabParam: string | null): NavTabId {
  if (!tabParam) return 'platoon_summary';
  const normalized = tabParam.trim().toLowerCase();
  return QUERY_TO_TAB[normalized] || 'platoon_summary';
}

function HomeContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    currentUser,
    isLoaded,
    users,
    soldiers,
    dailyScores,
    commendations,
    criteria,
    selectedDate,
    setSelectedDate,
    units,
    platoons,
    addUnit,
    updateUnit,
    deleteUnit,
    assignUnitLeader,
    assignScorersToUnit,
    importUnitsExcel,
    recalculateHeadcounts,
    updateUnitRemark,
    selectedUnitId,
    selectedTier,
    selectUnit,
    getUnitAggregates,
    logout,
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
    appeals,
    createAppeal,
    resolveAppeal,
  } = useEmulationStore();

  // Single source of truth: activeTab được tính toán trực tiếp từ URL Query String
  const searchTab = searchParams.get('tab');
  const activeTab = useMemo(() => parseTab(searchTab), [searchTab]);

  const handleTabChange = useCallback(
    (newTab: NavTabId, options: { scrollToTop?: boolean } = {}) => {
      if (options.scrollToTop && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      const targetUrl = getTabUrl(newTab);
      const currentTab = parseTab(searchParams.get('tab'));
      if (newTab !== currentTab || searchParams.get('tab') !== (newTab === 'platoon_summary' ? null : TAB_TO_VI_QUERY[newTab])) {
        router.push(targetUrl, { scroll: false });
      }
    },
    [router, searchParams]
  );

  const [selectedSoldierForProfile, setSelectedSoldierForProfile] = useState<Soldier | null>(null);
  const [isCommendationModalOpen, setIsCommendationModalOpen] = useState(false);
  const [targetSoldierForCommendation, setTargetSoldierForCommendation] = useState<Soldier | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'COMMANDER' || String(currentUser?.role || '').includes('ADMIN');
  const isScorer = currentUser?.role === 'SCORER';
  const isSoldier = currentUser?.role === 'SOLDIER' || currentUser?.role === 'USER';

  const scorerAllowedRootId = useMemo(() => {
    if (!isScorer || !currentUser) return undefined;
    if (currentUser.assignedUnitIds && currentUser.assignedUnitIds.length > 0) {
      return currentUser.assignedUnitIds[0];
    }
    return currentUser.assignedUnitId;
  }, [isScorer, currentUser]);

  // Tự động giới hạn đơn vị đang chọn về phân đội được phân công khi SCORER đăng nhập
  useEffect(() => {
    if (!isLoaded || !isScorer || !scorerAllowedRootId) return;
    if (selectedUnitId === 'e335') {
      const targetUnit = units.find((u) => u.id === scorerAllowedRootId);
      if (targetUnit) {
        selectUnit(targetUnit.id, targetUnit.tier);
      }
    }
  }, [isLoaded, isScorer, scorerAllowedRootId, selectedUnitId, units, selectUnit]);

  // Router Guard & Chuẩn hóa Query tiếng Việt trên URL
  useEffect(() => {
    if (!isLoaded || !currentUser) return;

    // Tự động chuẩn hóa URL nếu người dùng truy cập bằng mã tab tiếng Anh cũ
    const expectedQuery = TAB_TO_VI_QUERY[activeTab];
    if (searchTab && searchTab !== expectedQuery) {
      router.replace(getTabUrl(activeTab));
      return;
    }

    // 1. Quản trị viên tối cao: Đầy đủ quyền
    if (isAdmin) return;

    // 2. Cán bộ phụ trách (SCORER): Chỉ được vào daily_scoring, platoon_summary, commendations, appeals
    if (isScorer) {
      const allowedScorerTabs: NavTabId[] = ['daily_scoring', 'platoon_summary', 'commendations', 'appeals'];
      if (!allowedScorerTabs.includes(activeTab)) {
        notify.warning('Không có thẩm quyền', 'Đồng chí đã được chuyển đến màn hình Nhập điểm thi đua');
        router.replace(getTabUrl('daily_scoring'));
      }
      return;
    }

    // 3. Quân nhân (SOLDIER / USER): Chỉ được vào individual_emulation, commendations, appeals, soldier_profile
    if (isSoldier) {
      const allowedSoldierTabs: NavTabId[] = ['individual_emulation', 'commendations', 'appeals', 'soldier_profile'];
      if (!allowedSoldierTabs.includes(activeTab)) {
        router.replace(getTabUrl('individual_emulation'));
      }
      return;
    }
  }, [isLoaded, currentUser, isAdmin, isScorer, isSoldier, activeTab, searchTab, router]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 1200) {
          setIsSidebarExpanded(false);
        } else {
          setIsSidebarExpanded(true);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    notify.info('Đã đăng xuất', 'Đang chuyển đến trang đăng nhập...');
    router.replace('/login');
  };

  useEffect(() => {
    if (isLoaded && !currentUser) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      router.replace('/login' + search);
    }
  }, [isLoaded, currentUser, router]);

  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-3 border-red-700 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-semibold text-zinc-600">Đang tải dữ liệu thi đua quân nhân...</p>
        </div>
      </div>
    );
  }

  const platoonAggregates = getPlatoonAggregates(selectedDate);
  const lockStatus = getDailyLockStatus(selectedDate);
  const matchedOwnSoldier = currentUser?.soldierId
    ? soldiers.find((s) => s.id === currentUser.soldierId) || null
    : null;
  const displaySoldier =
    selectedSoldierForProfile ||
    matchedOwnSoldier ||
    (soldiers.length > 0 ? soldiers[0] : null);

  const handleOpenAddCommendationForSoldier = (soldier: Soldier) => {
    setTargetSoldierForCommendation(soldier);
    setIsCommendationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 font-sans antialiased flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Header
        currentUser={currentUser}
        units={units}
        onLogout={handleLogout}
        onOpenLogin={handleLogout}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onNavigateTab={(tab) => handleTabChange(tab)}
      />

      {/* ── Main Layout Body ────────────────────────────────────────── */}
      <div className="flex-1 flex pt-14">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tab) => handleTabChange(tab, { scrollToTop: true })}
          onLogout={handleLogout}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* ── Main Content Region ──────────────────────────────────── */}
        <main
          className={`flex-1 transition-all duration-200 p-3 sm:p-5 md:p-6 pb-12 max-w-full overflow-x-hidden ${
            isSidebarExpanded ? 'md:ml-64' : 'md:ml-[68px]'
          }`}
        >
          {activeTab === 'platoon_summary' && (
            <EmulationDashboard
              aggregates={platoonAggregates}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
              getUnitAggregates={getUnitAggregates}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              criteria={criteria}
              lockStatus={lockStatus}
              allowedRootId={scorerAllowedRootId}
              soldiers={soldiers}
              dailyScores={dailyScores}
              onViewSoldierProfile={(s) => {
                setSelectedSoldierForProfile(s);
                handleTabChange('soldier_profile');
              }}
              units={units}
              canManage={isAdmin}
              onUpdateUnitRemark={updateUnitRemark}
              onSaveScore={saveDailyScore}
            />
          )}

          {activeTab === 'individual_emulation' && (
            <IndividualEmulationBoard
              soldiers={soldiers}
              dailyScores={dailyScores}
              criteria={criteria}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
              lockStatus={lockStatus}
              onViewSoldierProfile={(s) => {
                setSelectedSoldierForProfile(s);
                handleTabChange('soldier_profile');
              }}
              onNavigateToCollective={() => handleTabChange('platoon_summary')}
              units={units}
              canManage={isAdmin}
              onUpdateUnit={updateUnit}
              onSaveScore={saveDailyScore}
              currentSoldierId={currentUser?.soldierId}
              onOpenAppeal={() => handleTabChange('appeals')}
            />
          )}

          {activeTab === 'daily_scoring' && (
            <DailyScoringSheet
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              soldiers={soldiers}
              units={units}
              platoons={platoons}
              criteria={criteria}
              dailyScores={dailyScores}
              lockStatus={lockStatus}
              canLock={isAdmin}
              onSaveScore={saveDailyScore}
              onOpenCommendationModal={handleOpenAddCommendationForSoldier}
              evaluatorName={currentUser ? `${currentUser.rank || ''} ${currentUser.name}`.trim() : 'Trực ban'}
              onLockDate={(date, note) => lockDate(date, 'CHỦ NHIỆM / TRỰC BAN', note)}
              onUnlockDate={(date, reason) => unlockDate(date, 'CHỦ NHIỆM / TRỰC BAN', reason)}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
              allowedRootId={scorerAllowedRootId}
            />
          )}

          {activeTab === 'commendations' && (
            <CommendationSection
              commendations={commendations}
              onOpenAddModal={() => {
                setTargetSoldierForCommendation(null);
                setIsCommendationModalOpen(true);
              }}
              canAdd={isAdmin || isScorer}
              canManage={isAdmin}
              onUpdateCommendation={updateCommendation}
              onDeleteCommendation={deleteCommendation}
            />
          )}

          {activeTab === 'soldiers' && (
            <SoldierList
              soldiers={soldiers}
              platoons={platoons}
              units={units}
              onViewSoldierProfile={(s) => {
                setSelectedSoldierForProfile(s);
                handleTabChange('soldier_profile');
              }}
              canManage={isAdmin}
              onAddSoldier={addSoldier}
              onUpdateSoldier={updateSoldier}
              onDeleteSoldier={deleteSoldier}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
            />
          )}

          {activeTab === 'soldier_profile' && (
            displaySoldier ? (
              <SoldierProfile
                soldier={displaySoldier}
                scores={dailyScores}
                commendations={commendations}
                canManage={isAdmin}
                onUpdateSoldier={(updated) => {
                  updateSoldier(updated);
                  setSelectedSoldierForProfile(updated);
                }}
              />
            ) : (
              <div className="bg-white rounded-md border border-zinc-200 p-8 text-center max-w-xl mx-auto my-8 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-800">Chưa có thông tin quân nhân</h3>
                <p className="text-xs text-zinc-500">
                  Hệ thống chưa ghi nhận hồ sơ quân nhân nào hoặc đồng chí chưa chọn quân nhân để xem lý lịch.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleTabChange('soldiers')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-md transition-colors shadow-xs cursor-pointer"
                  >
                    Xem danh sách quân nhân
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'reports' && (
            <PlatoonAnalysis
              aggregates={platoonAggregates}
              commendations={commendations}
              selectedDate={selectedDate}
            />
          )}

          {activeTab === 'units' && (
            <UnitManagement
              units={units}
              soldiers={soldiers}
              users={users}
              onAddUnit={addUnit}
              onUpdateUnit={updateUnit}
              onDeleteUnit={deleteUnit}
              onAssignLeader={assignUnitLeader}
              onAssignScorers={assignScorersToUnit}
              onImportExcel={importUnitsExcel}
              onRecalculateHeadcounts={recalculateHeadcounts}
            />
          )}

          {activeTab === 'criteria' && (
            <CriteriaHandbook
              criteria={criteria}
              canManage={isAdmin}
              onAddCriterion={addCriterion}
              onUpdateCriterion={updateCriterion}
              onDeleteCriterion={deleteCriterion}
              onToggleCriterion={toggleCriterion}
            />
          )}

          {activeTab === 'appeals' && (
            <AppealManagement
              appeals={appeals}
              currentUser={currentUser}
              units={units}
              soldiers={soldiers}
              onCreateAppeal={createAppeal}
              onResolveAppeal={resolveAppeal}
            />
          )}
        </main>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <AddCommendationDialog
        isOpen={isCommendationModalOpen}
        onClose={() => setIsCommendationModalOpen(false)}
        onAdd={(item) => {
          addCommendation(item);
        }}
        soldiers={soldiers}
        platoons={platoons}
        units={units}
        preselectedSoldier={targetSoldierForCommendation}
        authorName={
          currentUser ? `${currentUser.rank || ''} ${currentUser.name}`.trim() : 'Trực ban'
        }
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="animate-spin h-8 w-8 border-3 border-red-700 border-t-transparent rounded-full mx-auto" />
            <p className="text-xs font-semibold text-zinc-600">Đang tải dữ liệu thi đua quân nhân...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
