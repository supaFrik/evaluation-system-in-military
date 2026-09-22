import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import React from 'react';

/**
 * Wrapper around Sonner toast with 3 semantic states:
 *  - success: xanh lá — thao tác thành công
 *  - error:   đỏ     — thao tác thất bại
 *  - pending: vàng   — đang chờ xử lý / cần xác nhận
 */
export const notify = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, {
      description,
      style: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#15803d',
      },
      icon: React.createElement(CheckCircle2, { className: 'h-4 w-4 text-emerald-600' }),
    }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, {
      description,
      style: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#b91c1c',
      },
      icon: React.createElement(XCircle, { className: 'h-4 w-4 text-red-700' }),
    }),

  pending: (message: string, description?: string) =>
    sonnerToast.warning(message, {
      description,
      style: {
        backgroundColor: '#fefce8',
        border: '1px solid #fde68a',
        color: '#92400e',
      },
      icon: React.createElement(Clock, { className: 'h-4 w-4 text-amber-600' }),
    }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
};
