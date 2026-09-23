'use client';

import React, { useState } from 'react';
import {
  PlatoonAggregate,
  UnitAggregate,
  EmulationCriterion,
  DailyLockStatus,
  UnitTier,
  Soldier,
  DailyScore,
  MilitaryUnit,
} from '@/lib/types';
import { PlatoonSummaryTable } from './platoon-summary-table';
import { IndividualEmulationBoard } from './individual-emulation-board';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, UserCheck, BarChart3, Shield } from 'lucide-react';

interface EmulationDashboardProps {
  aggregates?: PlatoonAggregate[];
  selectedUnitId?: string;
  selectedTier?: UnitTier;
  onSelectUnit?: (unitId: string, tier: UnitTier) => void;
  getUnitAggregates?: (parentUnitId: string, date?: string) => UnitAggregate[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSelectPlatoon?: () => void;
  criteria?: EmulationCriterion[];
  lockStatus?: DailyLockStatus;
  allowedRootId?: string;
  soldiers?: Soldier[];
  dailyScores?: DailyScore[];
  onViewSoldierProfile?: (soldier: Soldier) => void;
  initialViewMode?: 'COLLECTIVE' | 'INDIVIDUAL';
  units?: MilitaryUnit[];
  canManage?: boolean;
  onUpdateUnit?: (unit: MilitaryUnit) => void;
  onUpdateUnitRemark?: (unitId: string, date: string, remark: string) => void;
  onSaveScore?: (score: DailyScore) => void;
}

export function EmulationDashboard({
  aggregates = [],
  selectedUnitId,
  selectedTier,
  onSelectUnit,
  getUnitAggregates,
  selectedDate,
  onChangeDate,
  onSelectPlatoon,
  criteria = [],
  lockStatus,
  allowedRootId,
  soldiers = [],
  dailyScores = [],
  onViewSoldierProfile,
  initialViewMode = 'COLLECTIVE',
  units,
  canManage = false,
  onUpdateUnit,
  onUpdateUnitRemark,
  onSaveScore,
}: EmulationDashboardProps) {
  const [viewMode, setViewMode] = useState<'COLLECTIVE' | 'INDIVIDUAL'>(initialViewMode);

  return (
    <div className="w-full max-w-6xl space-y-4">
      {/* ── TABS LINE (SIMPLE) ─────────────────────────────────────────── */}
      <Tabs
        value={viewMode}
        onValueChange={(val) => setViewMode(val as 'COLLECTIVE' | 'INDIVIDUAL')}
        className="w-full"
      >
        <TabsList variant="line">
          <TabsTrigger value="COLLECTIVE">
            <Trophy className="w-3.5 h-3.5" />
            <span>Thi đua tập thể</span>
          </TabsTrigger>
          <TabsTrigger value="INDIVIDUAL">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Bình xét cá nhân</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── NỘI DUNG CHẾ ĐỘ XEM ────────────────────────────────────────── */}
      {viewMode === 'COLLECTIVE' ? (
        <PlatoonSummaryTable
          aggregates={aggregates}
          selectedUnitId={selectedUnitId}
          selectedTier={selectedTier}
          onSelectUnit={onSelectUnit}
          getUnitAggregates={getUnitAggregates}
          selectedDate={selectedDate}
          onChangeDate={onChangeDate}
          onSelectPlatoon={onSelectPlatoon}
          criteria={criteria}
          lockStatus={lockStatus}
          allowedRootId={allowedRootId}
          soldiers={soldiers}
          dailyScores={dailyScores}
          onViewSoldierProfile={onViewSoldierProfile}
          onNavigateToIndividual={(unitId, tier) => {
            onSelectUnit?.(unitId, tier);
            setViewMode('INDIVIDUAL');
          }}
          units={units}
          canManage={canManage}
          onUpdateUnit={onUpdateUnit}
          onUpdateUnitRemark={onUpdateUnitRemark}
        />
      ) : (
        <IndividualEmulationBoard
          soldiers={soldiers}
          dailyScores={dailyScores}
          criteria={criteria}
          selectedDate={selectedDate}
          onChangeDate={onChangeDate}
          selectedUnitId={selectedUnitId}
          selectedTier={selectedTier}
          onSelectUnit={onSelectUnit}
          allowedRootId={allowedRootId}
          lockStatus={lockStatus}
          onViewSoldierProfile={onViewSoldierProfile}
          onNavigateToCollective={() => setViewMode('COLLECTIVE')}
          units={units}
          canManage={canManage}
          onUpdateUnit={onUpdateUnit}
          onSaveScore={onSaveScore}
        />
      )}
    </div>
  );
}

export default EmulationDashboard;
