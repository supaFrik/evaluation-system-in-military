"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api";
import { notify } from "@/lib/notify";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import React, { useState } from "react";

const MilitaryStarEmblem = ({ className = "h-12 w-12" }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-[#b91c1c] text-yellow-300 font-black shadow-xs border border-yellow-400/40 select-none ${className}`}>
    ★
  </div>
);

export interface LoginSignupProps {
  onSuccess?: (userData: { email: string; name?: string; role?: string; password?: string }) => void;
  onToggleMode?: () => void;
  defaultMode?: "signin" | "signup";
}

export function SignupForm({
  onSuccess,
  onSwitchToSignIn,
}: {
  onSuccess?: (userData: { email: string; name?: string; role?: string; password?: string }) => void;
  onSwitchToSignIn?: () => void;
}) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify.error("Lỗi", "Vui lòng nhập Họ và tên");
      return;
    }
    if (password.length < 6) {
      notify.error("Lỗi", "Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      notify.error("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (method === "email" && !email.trim()) {
      notify.error("Lỗi", "Vui lòng nhập địa chỉ Gmail");
      return;
    }
    if (method === "phone" && !phone.trim()) {
      notify.error("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: method === "email" ? email.trim() : undefined,
        phone: method === "phone" ? phone.trim() : undefined,
        password,
      };

      await authService.register(payload);

      if (method === "email") {
        setRegisteredEmail(email.trim());
        setIsOtpStep(true);
        notify.success(
          "Đăng ký bước 1 thành công!",
          "Mã OTP đã được gửi đến Gmail của bạn. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản."
        );
      } else {
        notify.success("Đăng ký thành công!", "Tài khoản của bạn đã được khởi tạo.");
        // Đăng nhập tự động với SĐT
        if (onSuccess) {
          onSuccess({ email: phone.trim(), password });
        } else {
          onSwitchToSignIn?.();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể đăng ký tài khoản";
      notify.error("Đăng ký thất bại", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      notify.error("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    setIsVerifying(true);
    try {
      const authData = await authService.verifyOtp({
        identifier: registeredEmail,
        otpCode: otpCode.trim(),
      });

      notify.success(
        "Kích hoạt thành công!",
        `Xin chào ${authData.user.name}. Tài khoản của bạn đã sẵn sàng.`
      );

      setTimeout(() => {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        window.location.replace('/' + search);
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Mã OTP không đúng hoặc đã hết hạn";
      notify.error("Xác thực OTP thất bại", message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await authService.resendOtp({ identifier: registeredEmail });
      notify.success("Đã gửi lại OTP", "Mã xác thực mới đã được gửi tới Gmail của bạn.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể gửi lại mã OTP";
      notify.error("Lỗi gửi lại OTP", message);
    } finally {
      setIsResending(false);
    }
  };

  // ── Màn hình nhập OTP khi đăng ký qua Gmail ──
  if (isOtpStep) {
    return (
      <div className="flex items-center justify-center w-full py-1">
        <div className="mx-auto w-full max-w-sm space-y-4 rounded-[4px] border border-zinc-300 bg-white p-6 shadow-xs">
          <div className="text-center space-y-1">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#b91c1c] mb-1">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">
              Xác thực mã OTP
            </h2>
            <p className="text-xs text-zinc-500">
              Nhập mã gồm 6 chữ số đã gửi về Gmail: <br />
              <strong className="text-zinc-800">{registeredEmail}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-xs">
            <div>
              <Label htmlFor="otp-input" className="font-semibold text-zinc-700">
                Mã xác thực OTP <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input
                id="otp-input"
                className="mt-1 text-center font-mono tracking-widest text-lg font-bold rounded-[3px] border-zinc-300 min-h-[44px]"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isVerifying}
              className="w-full min-h-[44px] bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold text-xs py-2.5 rounded-[3px] shadow-xs transition-colors cursor-pointer"
            >
              {isVerifying ? "Đang xác thực..." : "Kích hoạt tài khoản & Đăng nhập"}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="inline-flex items-center gap-1 text-[#b91c1c] hover:underline cursor-pointer"
              >
                <RefreshCw size={13} className={isResending ? "animate-spin" : ""} />
                <span>Gửi lại mã OTP</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOtpStep(false)}
                className="text-zinc-500 hover:text-zinc-800"
              >
                Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-1">
      <div className="mx-auto w-full max-w-sm space-y-4 rounded-[4px] border border-zinc-300 bg-white p-6 shadow-xs">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">
            Đăng ký tài khoản quân nhân
          </h2>
          <p className="text-xs text-zinc-500">Quyền USER: Đăng ký qua Gmail hoặc Số điện thoại</p>
        </div>

        {/* Tab chuyển đổi hình thức đăng ký */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-[4px]">
          <button
            type="button"
            onClick={() => setMethod("email")}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-[3px] transition-all ${
              method === "email"
                ? "bg-white text-[#b91c1c] shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Mail size={14} />
            <span>Qua Gmail</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod("phone")}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-[3px] transition-all ${
              method === "phone"
                ? "bg-white text-[#b91c1c] shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Phone size={14} />
            <span>Qua Số ĐT</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <Label htmlFor="signup-name" className="font-semibold text-zinc-700">
              Họ và tên quân nhân <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input
              id="signup-name"
              placeholder="Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 rounded-[3px] border-zinc-300 min-h-[40px] text-xs"
              required
            />
          </div>

          {method === "email" ? (
            <div>
              <Label htmlFor="signup-email" className="font-semibold text-zinc-700">
                Địa chỉ Gmail <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="nguyenvanan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 rounded-[3px] border-zinc-300 min-h-[40px] text-xs"
                required
              />
              <span className="text-[10.5px] text-zinc-400 mt-0.5 block">
                Mỗi tài khoản gắn với 1 Gmail duy nhất (có xác thực OTP).
              </span>
            </div>
          ) : (
            <div>
              <Label htmlFor="signup-phone" className="font-semibold text-zinc-700">
                Số điện thoại di động <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 rounded-[3px] border-zinc-300 min-h-[40px] text-xs"
                required
              />
              <span className="text-[10.5px] text-zinc-400 mt-0.5 block">
                Mỗi tài khoản gắn với 1 Số điện thoại duy nhất.
              </span>
            </div>
          )}

          <div>
            <Label htmlFor="signup-password" className="font-semibold text-zinc-700">
              Mật khẩu <span className="text-[#b91c1c]">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-[3px] border-zinc-300 min-h-[40px] pr-10 text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-700 flex items-center"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="signup-confirm-password" className="font-semibold text-zinc-700">
              Xác nhận mật khẩu <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input
              id="signup-confirm-password"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 rounded-[3px] border-zinc-300 min-h-[40px] text-xs"
              required
            />
          </div>

          <div className="rounded-[3px] bg-zinc-50 border border-zinc-200 p-2 text-[11px] text-zinc-600 space-y-0.5">
            <div className="font-semibold text-zinc-800">Lưu ý phân quyền:</div>
            <div>• Tài khoản tự đăng ký có quyền <strong className="text-zinc-900">USER</strong> (Xem điểm, xếp hạng).</div>
            <div>• Quyền <strong className="text-[#b91c1c]">ADMIN</strong> do cấp trên cấp trực tiếp trong hệ thống.</div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold text-xs py-2.5 rounded-[3px] shadow-xs transition-colors cursor-pointer mt-2"
          >
            {isLoading ? "Đang xử lý..." : method === "email" ? "Tiếp tục & Nhận mã OTP" : "Đăng ký tài khoản"}
          </Button>

          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-[#b91c1c] font-semibold hover:underline cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LoginForm({
  onSuccess,
  onSwitchToSignUp,
}: {
  onSuccess?: (userData: { email: string; name?: string; role?: string; password?: string }) => void;
  onSwitchToSignUp?: () => void;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      notify.error("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      if (onSuccess) {
        onSuccess({
          email: identifier.trim(),
          password,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-1">
      <div className="mx-auto w-full max-w-sm space-y-4 rounded-[4px] border border-zinc-300 bg-white p-6 shadow-xs">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">
            Đăng nhập hệ thống
          </h2>
          <p className="text-xs text-zinc-500">Đăng nhập bằng Tên người dùng, Gmail hoặc Số điện thoại</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <Label htmlFor="signin-email" className="font-semibold text-zinc-700">
              Tên đăng nhập / Gmail / Số điện thoại <span className="text-[#b91c1c]">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="signin-email"
                className="rounded-[3px] border-zinc-300 min-h-[44px] text-xs text-zinc-900"
                placeholder="admin / user_demo / email@gmail.com"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="signin-password" className="font-semibold text-zinc-700">
              Mật khẩu <span className="text-[#b91c1c]">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="signin-password"
                className="rounded-[3px] border-zinc-300 min-h-[44px] pr-11 text-xs text-zinc-900"
                placeholder="Nhập mật khẩu"
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="text-zinc-400 hover:text-zinc-700 absolute inset-y-0 right-0 flex h-full w-11 min-h-[44px] items-center justify-center transition-colors cursor-pointer"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {isVisible ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-2 min-h-[36px]">
              <Checkbox id="remember-me" defaultChecked className="rounded-[2px] border-zinc-300 cursor-pointer h-4 w-4" />
              <Label htmlFor="remember-me" className="text-xs font-normal text-zinc-600 cursor-pointer flex items-center gap-1 select-none">
                <span>Ghi nhớ đăng nhập</span>
              </Label>
            </div>
            <button
              type="button"
              onClick={() => alert("Vui lòng liên hệ Quản trị viên hệ thống để được cấp lại mật khẩu.")}
              className="text-xs text-[#b91c1c] font-medium hover:underline transition-colors cursor-pointer min-h-[36px] inline-flex items-center"
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold text-xs py-2.5 rounded-[3px] shadow-xs transition-colors cursor-pointer"
          >
            {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
          </Button>

          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-zinc-100">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-[#b91c1c] font-semibold hover:underline cursor-pointer"
            >
              Đăng ký tài khoản USER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginSignupComponent({
  onSuccess,
  defaultMode = "signin",
}: LoginSignupProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);

  if (mode === "signup") {
    return (
      <SignupForm
        onSuccess={onSuccess}
        onSwitchToSignIn={() => setMode("signin")}
      />
    );
  }

  return (
    <LoginForm
      onSuccess={onSuccess}
      onSwitchToSignUp={() => setMode("signup")}
    />
  );
}
