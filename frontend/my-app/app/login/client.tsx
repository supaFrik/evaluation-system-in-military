'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoginSignupComponent from '@/components/ui/login-signup';
import { MOCK_ACCOUNTS } from '@/lib/mock-data';
import { notify } from '@/lib/notify';

export default function LoginClientPage() {
  const router = useRouter();

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
    setTimeout(() => router.push('/'), 600);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Military header banner */}
      <div
        className="text-white py-3 px-6 flex items-center justify-between shadow-sm"
        style={{
          backgroundColor: '#b91c1c',
          backgroundImage: 'url(/header-image.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'multiply',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Cờ Đảng và Cờ Tổ quốc"
              width={64}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">
              Hệ thống Quản lý và Theo dõi Thi đua Quân nhân
            </p>
            <p className="text-[10px] text-red-100">Đại đội 1 — Trung đội 1, Trung đội 2, Trung đội 3</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="text-xs text-red-100 hover:text-white underline underline-offset-4"
        >
          Vào trang chủ
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Top Military Emblem Banner */}
          <div className="flex flex-col items-center mb-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Image
                src="/vn-emblem.png"
                alt="Quốc kỳ Việt Nam"
                width={52}
                height={36}
                className="object-contain drop-shadow"
              />
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-zinc-900">
              Hệ thống Thi đua Quyết thắng
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 italic">
              &ldquo;Kỷ luật là sức mạnh của Quân đội — Thi đua là gieo mầm thắng lợi&rdquo;
            </p>
          </div>

          {/* Login / Signup Component */}
          <LoginSignupComponent onSuccess={handleSuccess} defaultMode="signin" />

          {/* Quick test accounts hints */}
          <div className="mt-4 border border-zinc-200 rounded-lg bg-white p-3.5 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Tài khoản mẫu thử nghiệm (Mật khẩu: 123456)
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: 'Chỉ huy (Đại đội trưởng)', user: 'chihuy', name: 'Đại úy Nguyễn Thế Anh' },
                { label: 'Người chấm điểm (Trực ban)', user: 'chamdiem', name: 'Trung sĩ Trần Văn Bình' },
                { label: 'Quân nhân (Chiến sĩ)', user: 'quannhan', name: 'Binh nhất Trịnh Quốc Việt' },
              ].map((a) => (
                <div
                  key={a.user}
                  onClick={() => handleSuccess({ email: a.user })}
                  className="flex items-center justify-between text-xs text-zinc-700 bg-zinc-50 hover:bg-red-50 hover:border-red-200 border border-transparent px-2 py-1.5 rounded cursor-pointer transition-colors"
                >
                  <span className="font-medium">{a.label}</span>
                  <code className="font-mono text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-[#b91c1c]">
                    {a.user}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
