'use client';

import React from 'react';
import Image from 'next/image';
import { UserAccount } from '@/lib/types';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onToggleSidebar?: () => void;
}

export function Header({ currentUser, onLogout, onOpenLogin, onToggleSidebar }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-40 w-full text-white shadow-sm"
      style={{
        backgroundColor: '#b91c1c',
        backgroundImage: 'url(/header-image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply',
      }}
    >
      <div className="flex h-14 items-center justify-between px-3 sm:px-6">
        {/* Left: Burger + Logo + System Title */}
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title="Đóng / Mở menu điều hướng"
              className="p-1.5 rounded hover:bg-black/20 text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Party + National flag logo */}
          <div className="flex h-10 items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Cờ Đảng và Cờ Tổ quốc"
              width={72}
              height={44}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          <div className="border-l border-red-400/40 pl-3">
            <h1 className="text-sm font-semibold tracking-wide uppercase sm:text-base leading-tight">
              Hệ thống Quản lý và Theo dõi Thi đua Quân nhân
            </h1>
            <p className="text-xs text-red-100 font-normal hidden sm:block">
              Đơn vị: Đại đội 1 — Trung đội 1, Trung đội 2, Trung đội 3
            </p>
          </div>
        </div>

        {/* Right: User Info & Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-300">
                  {currentUser.rank} {currentUser.name.replace(/^(Đại úy|Trung sĩ|Binh nhất|Binh nhì|Hạ sĩ)\s+/i, '')}
                </span>
                <span className="text-[11px] text-red-100">
                  {currentUser.roleTitle}
                </span>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-800 text-yellow-300 font-bold border border-yellow-400/50 text-xs">
                {currentUser.name.slice(-1)}
              </div>

              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="flex items-center gap-1.5 rounded border border-red-400/40 bg-red-800/60 px-2.5 py-1 text-xs text-white hover:bg-red-800 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Đổi tài khoản</span>
              </button>
            </div>
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
