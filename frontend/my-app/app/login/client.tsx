'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import Image from 'next/image';
import LoginSignupComponent from '@/components/ui/login-signup';
import { authService, AUTH_TOKEN_KEY } from '@/lib/api';
import { notify } from '@/lib/notify';

function checkIsAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem('thi_dua_user');
    if (token && userStr) {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser && (parsedUser.id || parsedUser.username || parsedUser.email)) {
        return true;
      }
    }
  } catch (e) {
    console.warn('Invalid user session in localStorage, clearing...', e);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('thi_dua_user');
  }
  return false;
}

export default function LoginClientPage() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isAuthenticated = isClient ? checkIsAuthenticated() : false;

  useEffect(() => {
    if (isAuthenticated) {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      window.location.replace('/' + search);
    }
  }, [isAuthenticated]);

  const handleSuccess = async (userData: { email: string; name?: string; role?: string; password?: string }) => {
    try {
      const loginIdentifier = userData.email;
      const password = userData.password || 'Password@123';
      const authData = await authService.login(loginIdentifier, password);

      notify.success(
        'Đăng nhập thành công!',
        `Xin chào ${authData.user.name} — ${authData.user.roleTitle || authData.user.role}`
      );
      setTimeout(() => {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        window.location.replace('/' + search);
      }, 400);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Tài khoản hoặc mật khẩu không chính xác';
      notify.error('Đăng nhập thất bại', message);
    }
  };

  if (!isClient || isAuthenticated) {
    return (
      <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 bg-white">
        <div className="text-center space-y-3 z-10">
          <div className="animate-spin h-8 w-8 border-3 border-red-700 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-semibold text-zinc-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-white">
      {/* 1. Ảnh nền nằm sau: Họa tiết Trống đồng Đông Sơn */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center sm:bg-top bg-no-repeat opacity-90"
        style={{
          backgroundImage: 'url(/bg-trong.png)',
        }}
      />

      {/* 2. Ảnh nằm trước: Dải cờ đỏ quân đội căn đáy màn hình */}
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
        {/* Header với Cờ Đảng & Tổ Quốc và Tiêu đề Đơn vị */}
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
      </div>
    </div>
  );
}
