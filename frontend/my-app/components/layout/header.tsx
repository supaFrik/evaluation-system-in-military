'use client';

import React from 'react';
import Image from 'next/image';
import { UserAccount } from '@/lib/types';
import { LogOut, Menu, ChevronDown, User, BookOpen, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavTabId } from '@/components/layout/sidebar';
import { ALL_UNITS } from '@/lib/mock-data';

interface HeaderProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onToggleSidebar?: () => void;
  onNavigateTab?: (tab: NavTabId) => void;
}

export function Header({
  currentUser,
  onLogout,
  onOpenLogin,
  onToggleSidebar,
  onNavigateTab,
}: HeaderProps) {
  const userUnitName = React.useMemo(() => {
    if (!currentUser?.assignedUnitId) return 'Trung đoàn Bộ Binh 335';
    const match = ALL_UNITS.find((u) => u.id === currentUser.assignedUnitId);
    if (match) return match.name;
    if (currentUser.platoonId) {
      const pMatch = ALL_UNITS.find((u) => u.id === currentUser.platoonId);
      if (pMatch) return pMatch.name;
    }
    return 'Trung đoàn Bộ Binh 335';
  }, [currentUser]);

  const displayName = currentUser
    ? currentUser.rank && !currentUser.name.toLowerCase().startsWith(currentUser.rank.toLowerCase())
      ? `${currentUser.rank} ${currentUser.name}`
      : currentUser.name
    : '';
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 w-full shadow-xs border-b-2 border-yellow-500/90 bg-white bg-[url('/header-image.png')] bg-cover bg-center bg-no-repeat">
      <div className="flex h-14 items-center justify-between px-3 sm:px-6">
        {/* Left: Burger + Logo + System Title */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Đóng / Mở menu điều hướng"
              aria-label="Đóng / Mở menu điều hướng"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[3px] bg-white/80 hover:bg-white text-[#991b1b] border border-red-200/90 shadow-2xs transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 stroke-[2.2]" />
            </button>
          )}

          {/* Party + National flag logo */}
          <div className="flex h-10 items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Cờ Đảng và Cờ Tổ quốc"
              width={72}
              height={44}
              className="object-contain drop-shadow-sm h-7 w-auto sm:h-9"
              priority
            />
          </div>

          <div className="border-l border-red-300/80 pl-2.5 sm:pl-3 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-extrabold tracking-wider uppercase leading-tight text-[#991b1b] whitespace-nowrap">
              Sổ tay Thi đua
            </h1>
            <p className="text-xs text-zinc-700 font-semibold hidden sm:block whitespace-nowrap">
              Sư đoàn Bộ Binh 324 — Trung đoàn Bộ Binh 335
            </p>
          </div>
        </div>

        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="min-h-[44px] px-2.5 sm:px-3 text-white hover:bg-black/20 data-[state=open]:bg-black/35 aria-expanded:bg-black/35 flex items-center gap-2 sm:gap-2.5 rounded-[4px] border border-transparent transition-all btn-tactile cursor-pointer select-none shrink-0"
                  >
                    <div className="hidden sm:flex flex-col text-right shrink-0 whitespace-nowrap leading-tight">
                      <span className="text-xs font-bold text-yellow-300 tracking-tight drop-shadow-xs whitespace-nowrap leading-none">
                        {currentUser.rank && !currentUser.name.toLowerCase().startsWith(currentUser.rank.toLowerCase())
                          ? `${currentUser.rank} ${currentUser.name}`
                          : currentUser.name}
                      </span>
                      <span className="text-[11px] text-red-100 font-medium whitespace-nowrap leading-none mt-1">
                        {currentUser.roleTitle}
                      </span>
                    </div>

                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] overflow-hidden border border-white/20 bg-white shadow-xs">
                      <Image
                        src={currentUser.avatarUrl || '/default-avatar.png'}
                        alt={currentUser.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-red-100 opacity-90 transition-transform duration-200 shrink-0" />
                  </button>
                }
              />
              <DropdownMenuContent
                align="end"
                className="w-72 bg-white border border-zinc-200/90 shadow-lg rounded-md p-1.5 text-xs select-none focus:outline-none"
              >
                {/* User Identity Header */}
                <div className="flex items-center gap-3 p-2 rounded-sm bg-zinc-50/80 border border-zinc-100">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] overflow-hidden border border-zinc-200 bg-white shadow-2xs">
                    <Image
                      src={currentUser.avatarUrl || '/default-avatar.png'}
                      alt={currentUser.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-zinc-900 text-xs leading-snug truncate" title={displayName}>
                      {displayName}
                    </div>
                    <div className="text-[11px] text-zinc-600 font-medium leading-tight truncate mt-0.5">
                      {currentUser.roleTitle}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-normal leading-tight truncate mt-0.5" title={userUnitName}>
                      {userUnitName}
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1.5 bg-zinc-100" />

                {/* Quick Navigation Shortcuts */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => onNavigateTab?.('soldier_profile')}
                    className="cursor-pointer gap-2.5 py-2 px-2.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-sm font-medium transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onNavigateTab?.('criteria')}
                    className="cursor-pointer gap-2.5 py-2 px-2.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-sm font-medium transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>Quy chế thi đua</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 bg-zinc-100" />

                {/* Account & Session Actions */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={onOpenLogin}
                    className="cursor-pointer gap-2.5 py-2 px-2.5 text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 rounded-sm font-medium transition-colors"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span>Đổi tài khoản / Chuyển vai trò</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={onLogout}
                    className="cursor-pointer gap-2.5 py-2 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-red-600 shrink-0" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1 rounded bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-red-900 hover:bg-yellow-300 transition-colors"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
