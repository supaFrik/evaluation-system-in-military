'use client';

import React, { useState, useEffect } from 'react';
import { useEmulationStore } from '@/lib/store';
import { NavTabId, Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { PlatoonSummaryTable } from '@/components/dashboard/platoon-summary-table';
import { DailyScoringSheet } from '@/components/scoring/daily-scoring-sheet';
import { CommendationSection } from '@/components/commendation/commendation-section';
import { AddCommendationDialog } from '@/components/commendation/add-commendation-dialog';
import { SoldierList } from '@/components/soldiers/soldier-list';
import { SoldierProfile } from '@/components/profile/soldier-profile';
import { PlatoonAnalysis } from '@/components/reports/platoon-analysis';
import { CriteriaHandbook } from '@/components/criteria/criteria-handbook';
import { LoginDialog } from '@/components/auth/login-dialog';
import { MOCK_PLATOONS } from '@/lib/mock-data';
import { Soldier } from '@/lib/types';
import { notify } from '@/lib/notify';

export default function HomePage() {
  const {
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
  } = useEmulationStore();

  const [activeTab, setActiveTab] = useState<NavTabId>('platoon_summary');
  const [selectedSoldierForProfile, setSelectedSoldierForProfile] = useState<Soldier | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCommendationModalOpen, setIsCommendationModalOpen] = useState(false);
  const [targetSoldierForCommendation, setTargetSoldierForCommendation] = useState<Soldier | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    setIsLoginModalOpen(true);
    notify.info('Đã đăng xuất', 'Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống');
  };

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

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-500 text-sm">
        Đang khởi động hệ thống quản lý thi đua...
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

  const displaySoldier =
    selectedSoldierForProfile ||
    (currentUser?.soldierId ? soldiers.find((s) => s.id === currentUser.soldierId) : soldiers[0]) ||
    soldiers[0];

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      {/* ── Header (fixed) ───────────────────────────────────────────── */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onToggleSidebar={() => setIsSidebarExpanded((p) => !p)}
      />

      {/* ── Fixed Sidebar ────────────────────────────────────────────── */}
      {currentUser && (
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded((p) => !p)}
          onLogout={handleLogout}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'soldier_profile' && currentUser.role === 'SOLDIER') {
              const s = soldiers.find((x) => x.id === currentUser.soldierId);
              if (s) setSelectedSoldierForProfile(s);
            }
          }}
        />
      )}

      {/* ── Content Area with padding for fixed Header & Sidebar ─────── */}
      <div
        className={`pt-14 min-h-screen transition-[padding-left] duration-200 ${
          currentUser ? (isSidebarExpanded ? 'pl-64' : 'pl-[68px]') : 'pl-0'
        }`}
      >
        <main className="px-6 py-6 sm:px-10 lg:px-14">
          {activeTab === 'platoon_summary' && (
            <PlatoonSummaryTable
              aggregates={platoonAggregates}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onSelectPlatoon={() => setActiveTab('soldiers')}
            />
          )}

          {activeTab === 'daily_scoring' && (
            <DailyScoringSheet
              platoons={MOCK_PLATOONS}
              soldiers={soldiers}
              dailyScores={dailyScores}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onSaveScore={(score) => {
                saveDailyScore(score);
              }}
              onOpenCommendationModal={handleOpenCommendationForSoldier}
              evaluatorName={
                currentUser
                  ? `${currentUser.rank} ${currentUser.name}`
                  : 'Trực ban đơn vị'
              }
            />
          )}

          {activeTab === 'commendations' && (
            <CommendationSection
              commendations={commendations}
              canAdd={currentUser?.role !== 'SOLDIER'}
              onOpenAddModal={() => {
                setTargetSoldierForCommendation(null);
                setIsCommendationModalOpen(true);
              }}
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
            />
          )}

          {activeTab === 'soldier_profile' && displaySoldier && (
            <SoldierProfile
              soldier={displaySoldier}
              scores={dailyScores}
              commendations={commendations}
              onUpdatePhone={handleUpdateSoldierPhone}
            />
          )}

          {activeTab === 'reports' && (
            <PlatoonAnalysis
              aggregates={platoonAggregates}
              commendations={commendations}
              selectedDate={selectedDate}
            />
          )}

          {activeTab === 'criteria' && <CriteriaHandbook />}
        </main>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <LoginDialog
        isOpen={isLoginModalOpen}
        onLogin={(account) => {
          login(account);
          setIsLoginModalOpen(false);
          notify.success('Đăng nhập thành công', `Xin chào ${account.name} — ${account.roleTitle}`);
        }}
      />

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
