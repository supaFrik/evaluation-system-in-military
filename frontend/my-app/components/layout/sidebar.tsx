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
  Menu,
  PanelLeftClose,
  LogOut,
} from 'lucide-react';

export type NavTabId =
  | 'platoon_summary'
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
}

export function Sidebar({
  role,
  activeTab,
  onSelectTab,
  onLogout,
  isExpanded: controlledExpanded,
  onToggleExpand: controlledToggle,
}: SidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpand = controlledToggle || (() => setInternalExpanded((prev) => !prev));

  let menuItems: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [];

  if (role === 'COMMANDER') {
    menuItems = [
      { id: 'platoon_summary', label: 'Bảng tổng hợp thi đua', icon: Trophy },
      { id: 'daily_scoring', label: 'Nhập điểm thi đua', icon: ClipboardCheck },
      { id: 'commendations', label: 'Biểu dương & Nhắc nhở', icon: Megaphone },
      { id: 'soldiers', label: 'Danh sách quân nhân', icon: Users },
      { id: 'reports', label: 'Báo cáo & Đánh giá', icon: BarChart3 },
      { id: 'criteria', label: 'Quy chế chấm điểm', icon: BookOpen },
    ];
  } else if (role === 'SCORER') {
    menuItems = [
      { id: 'daily_scoring', label: 'Nhập điểm thi đua', icon: ClipboardCheck },
      { id: 'commendations', label: 'Biểu dương & Nhắc nhở', icon: Megaphone },
      { id: 'platoon_summary', label: 'Bảng tổng hợp thi đua', icon: Trophy },
      { id: 'soldiers', label: 'Danh sách quân nhân', icon: Users },
      { id: 'criteria', label: 'Quy chế chấm điểm', icon: BookOpen },
    ];
  } else {
    // SOLDIER
    menuItems = [
      { id: 'soldier_profile', label: 'Sơ lược quân nhân', icon: User },
      { id: 'daily_scoring', label: 'Điểm thi đua cá nhân', icon: CalendarCheck },
      { id: 'platoon_summary', label: 'Thứ hạng trung đội', icon: Trophy },
      { id: 'commendations', label: 'Biểu dương & Nhắc nhở', icon: Megaphone },
      { id: 'criteria', label: 'Quy chế thi đua', icon: BookOpen },
    ];
  }

  return (
    <aside
      className={`fixed top-14 bottom-0 left-0 z-30 border-r border-zinc-200 bg-white py-3 pb-6 flex flex-col justify-between transition-[width] duration-200 select-none overflow-y-auto ${
        isExpanded ? 'w-64' : 'w-[68px]'
      }`}
    >
      <div>
        {/* Burger Expand/Collapse Header */}
        <div className="flex items-center justify-between px-3.5 pb-3 border-b border-zinc-100 mb-2">
          {isExpanded ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Menu Quản lý
              </span>
              <button
                type="button"
                onClick={toggleExpand}
                className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
                title="Thu gọn menu"
                aria-label="Thu gọn menu"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <button
                type="button"
                onClick={toggleExpand}
                className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
                title="Mở rộng menu"
                aria-label="Mở rộng menu"
              >
                <Menu className="h-5 w-5 text-zinc-700" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={!isExpanded ? item.label : undefined}
                className={`flex w-full items-center rounded-md text-sm font-medium transition-colors text-left ${
                  isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
                } ${
                  isActive
                    ? 'bg-[#b91c1c] text-white shadow-sm'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-500'
                  }`}
                />
                {isExpanded && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer with Slogan & Logout */}
      <div className="px-2 pt-3 border-t border-zinc-100 space-y-2">
        {/* Logout Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Đăng xuất khỏi hệ thống"
            className={`flex w-full items-center rounded-md text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors ${
              isExpanded ? 'gap-2.5 px-3 py-2' : 'justify-center p-2'
            }`}
          >
            <LogOut className="h-4 w-4 text-red-600 shrink-0" />
            {isExpanded && <span>Đăng xuất</span>}
          </button>
        )}

        {/* Slogan */}
        {isExpanded && (
          <div className="px-2 pb-1 text-xs text-zinc-500">
            <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px] mb-0.5">
              Khẩu hiệu hành động
            </p>
            <p className="italic text-zinc-600 leading-relaxed text-[10px]">
              &ldquo;Kỷ luật là sức mạnh của Quân đội&rdquo;
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
