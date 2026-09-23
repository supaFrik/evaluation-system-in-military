'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import {
  Trophy,
  ClipboardCheck,
  Megaphone,
  Users,
  BarChart3,
  BookOpen,
  User,
  CalendarCheck,
  UserCheck,
  X,
  Shield,
} from 'lucide-react';

export type NavTabId =
  | 'platoon_summary'
  | 'individual_emulation'
  | 'daily_scoring'
  | 'commendations'
  | 'soldiers'
  | 'soldier_profile'
  | 'reports'
  | 'criteria';

interface SidebarProps {
  role: UserRole;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onLogout?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  role,
  activeTab,
  onSelectTab,
  onLogout,
  isExpanded: controlledExpanded,
  onToggleExpand: controlledToggle,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpand = controlledToggle || (() => setInternalExpanded((prev) => !prev));

  let menuItems: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];

  if (role === 'COMMANDER') {
    menuItems = [
      { id: 'platoon_summary', label: 'Bảng theo dõi thi đua', icon: Trophy },
      { id: 'daily_scoring', label: 'Nhập điểm thi đua', icon: ClipboardCheck },
      { id: 'commendations', label: 'Biểu dương & Nhắc nhở', icon: Megaphone },
      { id: 'soldiers', label: 'Danh sách quân nhân', icon: Users },
      { id: 'reports', label: 'Báo cáo & Đánh giá', icon: BarChart3 },
      { id: 'criteria', label: 'Quy chế chấm điểm', icon: BookOpen },
    ];
  } else if (role === 'SCORER') {
    menuItems = [
      { id: 'daily_scoring', label: 'Nhập điểm thi đua', icon: ClipboardCheck },
      { id: 'platoon_summary', label: 'Bảng theo dõi thi đua', icon: Trophy },
      { id: 'commendations', label: 'Biểu dương & Nhắc nhở', icon: Megaphone },
      { id: 'soldiers', label: 'Danh sách quân nhân', icon: Users },
      { id: 'criteria', label: 'Quy chế chấm điểm', icon: BookOpen },
    ];
  } else {
    // SOLDIER
    menuItems = [
      { id: 'soldier_profile', label: 'Sơ lược quân nhân', icon: User },
      { id: 'daily_scoring', label: 'Điểm thi đua cá nhân', icon: CalendarCheck },
      { id: 'platoon_summary', label: 'Bảng theo dõi thi đua', icon: Trophy },
      { id: 'commendations', label: 'Biểu dương & Nhắc nhở', icon: Megaphone },
      { id: 'criteria', label: 'Quy chế thi đua', icon: BookOpen },
    ];
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed bottom-0 left-0 z-50 md:z-30 border-r border-zinc-200 bg-white flex flex-col justify-between transition-all duration-200 select-none overflow-y-auto ${
          isMobileOpen ? 'translate-x-0 top-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          'md:top-14 md:shadow-none ' + (isExpanded ? 'w-64 md:w-64' : 'w-64 md:w-[68px]')
        }`}
      >
        <div>
          {/* Mobile Drawer Header */}
          <div className="flex md:hidden items-center justify-between px-4 py-3.5 bg-[#b91c1c] text-white border-b-2 border-yellow-400">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-300" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Hệ thống Thi đua</span>
                <span className="text-xs text-red-100/90 block font-medium">Sư đoàn 324 — Trung đoàn 335</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-white hover:bg-black/20 cursor-pointer"
              title="Đóng menu"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 px-2 py-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-tab-id={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  title={!isExpanded ? item.label : undefined}
                  className={`flex w-full items-center rounded-md text-xs font-semibold transition-colors text-left btn-tactile cursor-pointer min-h-[44px] md:min-h-0 ${
                    isExpanded
                      ? 'gap-3 px-3 py-2.5'
                      : 'md:justify-center p-2.5 gap-3 md:gap-0 md:w-11 md:h-11 md:mx-auto'
                  } ${
                    isActive
                      ? 'bg-[#b91c1c] text-white shadow-xs font-bold'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-zinc-500'
                    }`}
                  />
                  <span className={`truncate ${!isExpanded ? 'md:hidden' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer with Slogan */}
        <div className={`px-3 py-2.5 border-t border-zinc-100 pb-5 md:pb-3 ${!isExpanded ? 'hidden md:hidden' : 'block'}`}>
          <p className="font-bold text-zinc-600 uppercase tracking-wider text-xs mb-0.5">
            Khẩu hiệu hành động
          </p>
          <p className="italic text-zinc-600 leading-relaxed text-xs">
            &ldquo;Kỷ luật là sức mạnh của Quân đội&rdquo;
          </p>
        </div>
      </aside>
    </>
  );
}
