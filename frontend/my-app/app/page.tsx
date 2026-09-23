'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmulationStore } from '@/lib/store';
import { NavTabId, Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { EmulationDashboard } from '@/components/dashboard/emulation-dashboard';
import { DailyScoringSheet } from '@/components/scoring/daily-scoring-sheet';
import { CommendationSection } from '@/components/commendation/commendation-section';
import { AddCommendationDialog } from '@/components/commendation/add-commendation-dialog';
import { SoldierList } from '@/components/soldiers/soldier-list';
import { SoldierProfile } from '@/components/profile/soldier-profile';
import { PlatoonAnalysis } from '@/components/reports/platoon-analysis';
import { CriteriaHandbook } from '@/components/criteria/criteria-handbook';
import { MOCK_PLATOONS } from '@/lib/mock-data';
import { Soldier } from '@/lib/types';
import { notify } from '@/lib/notify';

export default function HomePage() {
  const router = useRouter();
  const {
    currentUser,
    isLoaded,
    soldiers,
    dailyScores,
    commendations,
    criteria,
    selectedDate,
    setSelectedDate,
    units,
    updateUnit,
    updateUnitRemark,
    selectedUnitId,
    selectedTier,
    selectUnit,
    getUnitAggregates,
    login,
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
  } = useEmulationStore();

  const [activeTab, setActiveTab] = useState<NavTabId>('platoon_summary');
  const [selectedSoldierForProfile, setSelectedSoldierForProfile] = useState<Soldier | null>(null);
  const [isCommendationModalOpen, setIsCommendationModalOpen] = useState(false);
  const [targetSoldierForCommendation, setTargetSoldierForCommendation] = useState<Soldier | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Responsive sidebar: default to collapsed on tablet/medium screens (< 1200px) to maximize table space
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
      router.replace('/login');
    }
  }, [isLoaded, currentUser, router]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'SOLDIER') {
        setActiveTab('soldier_profile');
        const s = soldiers.find((x) => x.id === currentUser.soldierId) || soldiers[0];
        setSelectedSoldierForProfile(s);
      } else if (currentUser.role === 'SCORER') {
        setActiveTab('daily_scoring');
      } else {
        setActiveTab('platoon_summary');
      }
    }
  }, [currentUser, soldiers]);

  if (!isLoaded || !currentUser) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 text-zinc-500 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#b91c1c] border-t-transparent" />
          <p>Đang tải dữ liệu hệ thống thi đua...</p>
        </div>
      </div>
    );
  }

  const handleViewSoldier = (soldier: Soldier) => {
    setSelectedSoldierForProfile(soldier);
    setActiveTab('soldier_profile');
  };

  const handleOpenCommendationForSoldier = (soldier: Soldier) => {
    setTargetSoldierForCommendation(soldier);
    setIsCommendationModalOpen(true);
  };

  const handleUpdateSoldierPhone = (newPhone: string) => {
    if (selectedSoldierForProfile) {
      const updated = { ...selectedSoldierForProfile, phone: newPhone };
      updateSoldier(updated);
      setSelectedSoldierForProfile(updated);
      notify.success('Cập nhật thành công', 'Số điện thoại quân nhân đã được cập nhật.');
    }
  };

  const platoonAggregates = getPlatoonAggregates(selectedDate);
  const currentLockStatus = getDailyLockStatus(selectedDate);

  const displaySoldier =
    selectedSoldierForProfile ||
    (currentUser?.soldierId ? soldiers.find((s) => s.id === currentUser.soldierId) : soldiers[0]) ||
    soldiers[0];

  return (
    <div className="min-h-[100dvh] bg-white text-zinc-900 flex flex-col font-sans">
      {/* ── Header (fixed) ───────────────────────────────────────────── */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => router.push('/login')}
        onToggleSidebar={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsMobileDrawerOpen((p) => !p);
          } else {
            setIsSidebarExpanded((p) => !p);
          }
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'soldier_profile') {
            const targetSoldier = currentUser.soldierId
              ? soldiers.find((s) => s.id === currentUser.soldierId)
              : soldiers[0];
            if (targetSoldier) {
              setSelectedSoldierForProfile(targetSoldier);
            }
          }
        }}
      />

      {/* ── Fixed Sidebar / Mobile Drawer ────────────────────────────── */}
      {currentUser && (
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded((p) => !p)}
          isMobileOpen={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
          onLogout={handleLogout}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileDrawerOpen(false);
            if (tab === 'soldier_profile' && currentUser.role === 'SOLDIER') {
              const s = soldiers.find((x) => x.id === currentUser.soldierId);
              if (s) setSelectedSoldierForProfile(s);
            }
          }}
        />
      )}

      {/* ── Content Area with padding for fixed Header & Sidebar ─────── */}
      <div
        className={`pt-14 min-h-[100dvh] transition-[padding-left] duration-200 ${
          currentUser ? (isSidebarExpanded ? 'pl-0 md:pl-64' : 'pl-0 md:pl-[68px]') : 'pl-0'
        }`}
      >
        <main className="px-3 py-3.5 sm:px-6 sm:py-6 lg:px-10 max-w-full">
          {activeTab === 'platoon_summary' && (
            <EmulationDashboard
              aggregates={platoonAggregates}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
              getUnitAggregates={getUnitAggregates}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onSelectPlatoon={() => setActiveTab('soldiers')}
              criteria={criteria}
              lockStatus={currentLockStatus}
              allowedRootId={currentUser?.assignedUnitId}
              soldiers={soldiers}
              dailyScores={dailyScores}
              onViewSoldierProfile={handleViewSoldier}
              units={units}
              canManage={currentUser?.role === 'COMMANDER'}
              onUpdateUnit={updateUnit}
              onUpdateUnitRemark={updateUnitRemark}
              onSaveScore={saveDailyScore}
            />
          )}

          {activeTab === 'daily_scoring' && (
            <DailyScoringSheet
              platoons={MOCK_PLATOONS}
              soldiers={soldiers}
              dailyScores={dailyScores}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
              allowedRootId={currentUser?.assignedUnitId}
              onSaveScore={(score) => {
                saveDailyScore(score);
              }}
              onOpenCommendationModal={handleOpenCommendationForSoldier}
              evaluatorName={
                currentUser
                  ? `${currentUser.rank} ${currentUser.name}`
                  : 'Trực ban đơn vị'
              }
              criteria={criteria}
              lockStatus={currentLockStatus}
              canLock={currentUser?.role === 'COMMANDER'}
              onLockDate={(date, note) => {
                const officer = currentUser ? `${currentUser.rank} ${currentUser.name}` : 'Chỉ huy đơn vị';
                lockDate(date, officer, note);
              }}
              onUnlockDate={(date, reason) => {
                const officer = currentUser ? `${currentUser.rank} ${currentUser.name}` : 'Chỉ huy đơn vị';
                unlockDate(date, officer, reason);
              }}
              onNavigateToCriteria={() => setActiveTab('criteria')}
            />
          )}

          {activeTab === 'commendations' && (
            <CommendationSection
              commendations={commendations}
              canAdd={currentUser?.role !== 'SOLDIER'}
              canManage={currentUser?.role === 'COMMANDER'}
              onOpenAddModal={() => {
                setTargetSoldierForCommendation(null);
                setIsCommendationModalOpen(true);
              }}
              onUpdateCommendation={updateCommendation}
              onDeleteCommendation={deleteCommendation}
            />
          )}

          {activeTab === 'soldiers' && (
            <SoldierList
              soldiers={soldiers}
              platoons={MOCK_PLATOONS}
              onViewSoldierProfile={handleViewSoldier}
              canManage={currentUser?.role === 'COMMANDER'}
              onAddSoldier={addSoldier}
              onUpdateSoldier={updateSoldier}
              onDeleteSoldier={deleteSoldier}
              selectedUnitId={selectedUnitId}
              selectedTier={selectedTier}
              onSelectUnit={selectUnit}
              allowedRootId={currentUser?.assignedUnitId}
            />
          )}

          {activeTab === 'soldier_profile' && displaySoldier && (
            <SoldierProfile
              soldier={displaySoldier}
              scores={dailyScores}
              commendations={commendations}
              onUpdatePhone={handleUpdateSoldierPhone}
              canManage={currentUser?.role === 'COMMANDER'}
              onUpdateSoldier={(updated) => {
                updateSoldier(updated);
                setSelectedSoldierForProfile(updated);
              }}
            />
          )}

          {activeTab === 'reports' && (
            <PlatoonAnalysis
              aggregates={platoonAggregates}
              commendations={commendations}
              selectedDate={selectedDate}
            />
          )}

          {activeTab === 'criteria' && (
            <CriteriaHandbook
              criteria={criteria}
              canManage={currentUser?.role === 'COMMANDER'}
              onAddCriterion={addCriterion}
              onUpdateCriterion={updateCriterion}
              onDeleteCriterion={deleteCriterion}
              onToggleCriterion={toggleCriterion}
            />
          )}
        </main>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <AddCommendationDialog
        isOpen={isCommendationModalOpen}
        onClose={() => setIsCommendationModalOpen(false)}
        onAdd={(item) => {
          notify.pending('Đang ghi nhận...', 'Đang lưu vào sổ theo dõi thi đua');
          addCommendation(item);
          setTimeout(() => {
            notify.success('Ghi nhận thành công', `Đã thêm ${item.type === 'COMMENDATION' ? 'biểu dương' : 'nhắc nhở'} cho ${item.targetName}`);
          }, 600);
        }}
        soldiers={soldiers}
        platoons={MOCK_PLATOONS}
        preselectedSoldier={targetSoldierForCommendation}
        authorName={
          currentUser ? `${currentUser.rank} ${currentUser.name}` : 'Trực ban'
        }
      />
    </div>
  );
}
