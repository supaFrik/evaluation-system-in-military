import { toast } from '@/components/ui/toast';

/**
 * Semantic notify utility based on Base UI toast (@/components/ui/toast):
 * - success: xanh lá — thao tác thành công
 * - error:   đỏ     — thao tác thất bại
 * - pending: vàng/loading — đang chờ xử lý
 * - warning: vàng cam — cảnh báo
 * - info:    xanh dương/trung tính — thông tin
 */
export const notify = {
  success: (title: string, description?: string) =>
    toast.add({
      type: 'success',
      title,
      description,
    }),

  error: (title: string, description?: string) =>
    toast.add({
      type: 'error',
      title,
      description,
    }),

  pending: (title: string, description?: string) =>
    toast.add({
      type: 'loading',
      title,
      description,
    }),

  warning: (title: string, description?: string) =>
    toast.add({
      type: 'warning',
      title,
      description,
    }),

  info: (title: string, description?: string) =>
    toast.add({
      type: 'info',
      title,
      description,
    }),
};

export { toast };
