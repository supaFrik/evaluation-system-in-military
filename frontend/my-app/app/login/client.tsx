'use client';

import React from 'react';
import Image from 'next/image';
import LoginSignupComponent from '@/components/ui/login-signup';
import { MOCK_ACCOUNTS } from '@/lib/mock-data';
import { notify } from '@/lib/notify';

export default function LoginClientPage() {
  const handleSuccess = (userData: { email: string; name?: string; role?: string }) => {
    // Find the matching mock account by email prefix or username or role
    const account =
      MOCK_ACCOUNTS.find(
        (a) =>
          a.username.toLowerCase() === userData.email.split('@')[0].toLowerCase() ||
          userData.email.toLowerCase().includes(a.username.toLowerCase()) ||
          (userData.role && a.role === userData.role)
      ) || MOCK_ACCOUNTS[0];

    localStorage.setItem('thi_dua_user', JSON.stringify(account));
    notify.success(`Đăng nhập thành công!`, `Xin chào ${account.name} — ${account.roleTitle}`);
    setTimeout(() => {
      window.location.href = '/';
    }, 400);
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-white">
      {/* 1. Ảnh nền nằm sau: Họa tiết Trống đồng Đông Sơn (bg-trong.png) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center sm:bg-top bg-no-repeat opacity-90"
        style={{
          backgroundImage: 'url(/bg-trong.png)',
        }}
      />

      {/* 2. Ảnh nằm trước: Dải cờ đỏ quân đội (back_gr_1.png) căn đáy màn hình với kích thước chuẩn */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none w-full max-w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/back_gr_1.png"
          alt="Dải cờ quân đội"
          className="w-full max-w-full h-44 sm:h-64 md:h-80 lg:h-96 object-cover object-bottom block"
        />
      </div>

      {/* 3. Thẻ Đăng nhập / Đăng ký & Tiêu đề đơn vị */}
      <div className="relative z-10 w-full max-w-sm space-y-3.5 my-auto">
        {/* Header với Cờ Đảng & Tổ Quốc và Tiêu đề Đơn vị theo đúng ảnh mẫu */}
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div className="flex h-12 w-20 items-center justify-center">
            <Image
              src="/logo.png"
              alt="Cờ Đảng và Cờ Tổ quốc"
              width={80}
              height={48}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#c00000] drop-shadow-xs leading-tight">
            SƯ ĐOÀN BỘ BINH 324 - TRUNG ĐOÀN BỘ BINH 335
          </h1>
        </div>

        <LoginSignupComponent onSuccess={handleSuccess} defaultMode="signin" />

        {/* Quick test accounts hints */}
        <div className="border border-zinc-200/90 rounded-[4px] bg-white p-3.5 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-800">
              Đăng nhập nhanh theo phân quyền
            </p>
            <span className="text-[10px] text-zinc-400 font-mono">Bấm để vào ngay</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { label: 'Trung đoàn trưởng (e335)', user: 'trungdoan', name: 'Thượng tá Nguyễn Quang Huy', tier: 'Cấp Trung đoàn' },
              { label: 'Tiểu đoàn trưởng (dBB4)', user: 'tieudoan', name: 'Thiếu tá Trần Đại Nghĩa', tier: 'Cấp Tiểu đoàn' },
              { label: 'Đại đội trưởng (C1)', user: 'chihuy', name: 'Đại úy Nguyễn Thế Anh', tier: 'Cấp Đại đội' },
              { label: 'Trực ban chấm điểm', user: 'chamdiem', name: 'Trung sĩ Trần Văn Bình', tier: 'Cán bộ chấm' },
              { label: 'Chiến sĩ (Quân nhân)', user: 'quannhan', name: 'Binh nhất Trịnh Quốc Việt', tier: 'Chiến sĩ' },
            ].map((a) => (
              <button
                key={a.user}
                type="button"
                onClick={() => handleSuccess({ email: a.user })}
                className="w-full min-h-[44px] flex items-center justify-between text-left text-xs text-zinc-700 bg-zinc-50 hover:bg-red-50 hover:border-red-300 border border-zinc-200 px-3 py-2 rounded-[3px] cursor-pointer transition-colors group"
              >
                <div>
                  <div className="font-semibold text-zinc-900 group-hover:text-[#b91c1c] text-xs">
                    {a.name}
                  </div>
                  <div className="text-[10.5px] text-zinc-500">
                    {a.label}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block font-mono text-[10.5px] font-bold bg-white border border-zinc-200 group-hover:border-red-300 px-1.5 py-0.5 rounded-[2px] text-[#b91c1c]">
                    {a.user}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
