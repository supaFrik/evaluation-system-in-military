'use client';

import React, { useState } from 'react';
import { UserAccount } from '@/lib/types';
import { MOCK_ACCOUNTS } from '@/lib/mock-data';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

interface LoginDialogProps {
  isOpen: boolean;
  onLogin: (account: UserAccount) => void;
}

export function LoginDialog({ isOpen, onLogin }: LoginDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'COMMANDER' | 'SCORER' | 'SOLDIER'>('COMMANDER');
  const [username, setUsername] = useState('chihuy');
  const [password, setPassword] = useState('123456');

  if (!isOpen) return null;

  const handleSelectRolePreset = (acc: UserAccount) => {
    onLogin(acc);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_ACCOUNTS.find((a) => a.username === username.trim().toLowerCase());
    if (found) {
      onLogin(found);
    } else {
      // Default to commander if unknown
      onLogin(MOCK_ACCOUNTS[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-2xl space-y-6">
        {/* Header with National Star Emblem */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#b91c1c] text-yellow-300 font-black text-2xl shadow-md">
            ★
          </div>
          <h2 className="text-base font-bold uppercase tracking-wider text-zinc-900">
            Hệ thống Quản lý và Theo dõi Thi đua Quân nhân
          </h2>
          <p className="text-xs text-zinc-500">
            Đăng nhập vào hệ thống quản lý nội bộ đơn vị
          </p>
        </div>

        {/* Quick Role Selection for Testing (Convenient & Instant) */}
        <div className="space-y-2 border-y border-zinc-100 py-4">
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
            Chọn nhanh tài khoản mẫu:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {MOCK_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectRolePreset(acc)}
                className="flex items-center justify-between rounded border border-zinc-200 p-2.5 text-left hover:border-[#b91c1c] hover:bg-red-50/40 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">
                    {acc.name}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {acc.roleTitle} — {acc.role === 'COMMANDER' ? 'Vai trò Chỉ huy' : acc.role === 'SCORER' ? 'Vai trò Người chấm điểm' : 'Vai trò Quân nhân'}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-zinc-700">Tên đăng nhập / Số thẻ quân nhân:</label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="chihuy / chamdiem / quannhan"
                className="w-full rounded border border-zinc-300 py-2 pl-8 pr-3 text-xs text-zinc-900 focus:border-[#b91c1c] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700">Mật khẩu:</label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-zinc-300 py-2 pl-8 pr-3 text-xs text-zinc-900 focus:border-[#b91c1c] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-[#b91c1c] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-800 transition-colors shadow-sm"
          >
            Đăng nhập hệ thống
          </button>
        </form>
      </div>
    </div>
  );
}
