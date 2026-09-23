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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  UserCheck,
  User,
  Eye,
  EyeOff,
  Lock,
  Info,
  Shield,
} from "lucide-react";
import React, { useState } from "react";

const MilitaryStarEmblem = ({ className = "h-12 w-12" }: { className?: string }) => (
  <div className={`flex items-center justify-center rounded-full bg-[#b91c1c] text-yellow-300 font-black shadow-xs border border-yellow-400/40 select-none ${className}`}>
    ★
  </div>
);

export interface LoginSignupProps {
  onSuccess?: (userData: { email: string; name?: string; role?: string }) => void;
  onToggleMode?: () => void;
  defaultMode?: "signin" | "signup";
}

export function SignupForm({
  onSuccess,
  onSwitchToSignIn,
}: {
  onSuccess?: (userData: { email: string; name?: string; role?: string }) => void;
  onSwitchToSignIn?: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("COMMANDER");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess?.({
      email: email || "quannhan@donvi.vn",
      name: `${lastName} ${firstName}`.trim() || "Quân nhân",
      role,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[550px] w-full py-4">
      <div className="w-full max-w-md">
        <Card className="border border-zinc-300 shadow-xs rounded-[4px] pb-0 bg-white">
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-4 pt-6">
            <MilitaryStarEmblem className="h-12 w-12 text-2xl" />
            <div className="space-y-0.5 flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">
                Đăng ký tài khoản
              </h2>
              <p className="text-xs text-zinc-500">Hệ thống quản lý và theo dõi thi đua</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="font-semibold text-zinc-700">Vai trò / Nhiệm vụ quân sự</Label>
                <Select defaultValue="COMMANDER" onValueChange={(val) => val && setRole(val)}>
                  <SelectTrigger
                    id="role"
                    className="rounded-[3px] border-zinc-300 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                  >
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[3px] border-zinc-300">
                    <SelectItem value="COMMANDER">
                      <Award size={15} className="text-[#b91c1c]" aria-hidden="true" />
                      <span className="truncate">Chỉ huy (Đại đội trưởng / Phó)</span>
                    </SelectItem>
                    <SelectItem value="SCORER">
                      <UserCheck size={15} className="text-zinc-600" aria-hidden="true" />
                      <span className="truncate">Người chấm điểm (Trực ban / Tiểu đội trưởng)</span>
                    </SelectItem>
                    <SelectItem value="SOLDIER">
                      <User size={15} className="text-zinc-600" aria-hidden="true" />
                      <span className="truncate">Quân nhân (Chiến sĩ)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="font-semibold text-zinc-700">Họ và đệm</Label>
                  <Input
                    id="lastName"
                    placeholder="Nguyễn Văn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-[3px] border-zinc-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="font-semibold text-zinc-700">Tên</Label>
                  <Input
                    id="firstName"
                    placeholder="Bình"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-[3px] border-zinc-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-semibold text-zinc-700">Tên đăng nhập / Số thẻ QN</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="chamdiem hoặc số thẻ quân nhân"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-[3px] border-zinc-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-semibold text-zinc-700">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10 rounded-[3px] border-zinc-300"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-zinc-400 hover:text-zinc-700 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="terms" defaultChecked className="rounded-[2px] border-zinc-300" />
                <label htmlFor="terms" className="text-xs text-zinc-600">
                  Tôi cam kết chấp hành nghiêm{" "}
                  <span className="font-semibold text-zinc-900">
                    Quy chế thi đua
                  </span>{" "}
                  và{" "}
                  <span className="font-semibold text-zinc-900">
                    Kỷ luật quân đội
                  </span>
                </label>
              </div>

              <Button type="submit" className="w-full bg-[#b91c1c] text-white hover:bg-[#991b1b] font-semibold text-xs py-2 rounded-[3px] transition-colors shadow-xs">
                Tạo tài khoản mới
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-zinc-100 !py-3.5">
            <p className="text-center text-xs text-zinc-600">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="hover:underline font-semibold text-[#b91c1c]"
              >
                Đăng nhập ngay
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function LoginForm({
  onSuccess,
  onSwitchToSignUp,
}: {
  onSuccess?: (userData: { email: string; name?: string; role?: string }) => void;
  onSwitchToSignUp?: () => void;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [email, setEmail] = useState("chihuy");
  const [password, setPassword] = useState("123456");

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess?.({
      email: email || "chihuy",
      name: email === "chihuy" ? "Đại úy Nguyễn Thế Anh" : "Quân nhân",
    });
  };

  return (
    <div className="flex items-center justify-center w-full py-1">
      <div className="mx-auto w-full max-w-sm space-y-4 rounded-[4px] border border-zinc-300 bg-white p-6 shadow-xs">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">
            Đăng nhập hệ thống
          </h2>
          <p className="text-xs text-zinc-500">Nhập thông tin xác thực quân nhân</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <Label htmlFor="signin-email" className="font-semibold text-zinc-700">
              Tên đăng nhập / Số thẻ quân nhân <span className="text-[#b91c1c]">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="signin-email"
                className="rounded-[3px] border-zinc-300 min-h-[44px] text-xs text-zinc-900"
                placeholder="chihuy / chamdiem / quannhan"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="text-zinc-400 hover:text-zinc-700 absolute inset-y-0 right-0 flex h-full w-11 min-h-[44px] items-center justify-center transition-colors btn-tactile cursor-pointer"
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
                <span>Ghi nhớ phiên đăng nhập</span>
              </Label>
            </div>
            <button
              type="button"
              onClick={() => alert('Vui lòng liên hệ Trực ban hoặc Cán bộ Đại đội để được cấp lại mật khẩu.')}
              className="text-xs text-[#b91c1c] font-medium hover:underline transition-colors btn-tactile cursor-pointer min-h-[44px] inline-flex items-center"
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold text-xs py-2.5 rounded-[3px] shadow-xs transition-colors btn-tactile cursor-pointer"
          >
            Đăng nhập hệ thống
          </Button>

          <div className="relative my-3 flex items-center justify-center">
            <div className="w-full border-t border-zinc-200" />
            <span className="bg-white px-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest absolute">
              HOẶC
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSuccess?.({ email: "chihuy", name: "Đại úy Nguyễn Thế Anh" })}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-[3px] border border-zinc-300 bg-white py-2 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors shadow-2xs btn-tactile cursor-pointer"
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#b91c1c] text-yellow-300 text-xs font-bold shadow-2xs">
              ★
            </div>
            <span>Đăng nhập định danh VNeID</span>
          </button>

          <div className="text-center text-xs text-zinc-500 pt-1.5 border-t border-zinc-100">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-[#b91c1c] font-semibold hover:underline btn-tactile cursor-pointer"
            >
              Đăng ký tài khoản
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
