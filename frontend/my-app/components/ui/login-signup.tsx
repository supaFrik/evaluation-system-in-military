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
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Code,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import React, { JSX, SVGProps, useState } from "react";

const GoogleIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
  </svg>
);

const Logo = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    fill="currentColor"
    height="48"
    viewBox="0 0 40 48"
    width="40"
    {...props}
  >
    <clipPath id="a">
      <path d="m0 0h40v48h-40z" />
    </clipPath>
    <g clipPath="url(#a)">
      <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
      <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
      <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
      <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
      <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
      <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
    </g>
  </svg>
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
      email: email || "user@blocks.so",
      name: `${lastName} ${firstName}`.trim() || "Quân nhân",
      role,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[550px] w-full py-4">
      <div className="w-full max-w-md">
        <Card className="border shadow-lg pb-0 bg-white">
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-4 pt-6">
            <Logo className="w-12 h-12 text-[#b91c1c]" />
            <div className="space-y-0.5 flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Đăng ký tài khoản
              </h2>
              <p className="text-sm text-muted-foreground">
                Tạo tài khoản quản lý và theo dõi thi đua quân nhân.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role">Vai trò / Chức vụ</Label>
                <Select defaultValue="COMMANDER" onValueChange={(val) => val && setRole(val)}>
                  <SelectTrigger
                    id="role"
                    className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
                  >
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
                    <SelectItem value="COMMANDER">
                      <BarChart size={16} aria-hidden="true" />
                      <span className="truncate">Chỉ huy (Đại đội trưởng / Phó)</span>
                    </SelectItem>
                    <SelectItem value="SCORER">
                      <User size={16} aria-hidden="true" />
                      <span className="truncate">Người chấm điểm (Trực ban / Tiểu đội trưởng)</span>
                    </SelectItem>
                    <SelectItem value="SOLDIER">
                      <Code size={16} aria-hidden="true" />
                      <span className="truncate">Quân nhân (Chiến sĩ)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Họ và đệm</Label>
                  <Input
                    id="lastName"
                    placeholder="Nguyễn Văn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Tên</Label>
                  <Input
                    id="firstName"
                    placeholder="Bình"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email / Tên đăng nhập</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="chamdiem hoặc email@donvi.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
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
                <Checkbox id="terms" defaultChecked />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  Tôi đồng ý với{" "}
                  <a href="#" className="text-primary hover:underline">
                    Quy chế thi đua
                  </a>{" "}
                  và{" "}
                  <a href="#" className="text-primary hover:underline">
                    Kỷ luật quân đội
                  </a>
                </label>
              </div>

              <Button type="submit" className="w-full bg-[#b91c1c] text-white hover:bg-red-800 font-medium">
                Tạo tài khoản mới
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t !py-4">
            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-primary hover:underline font-medium text-[#b91c1c]"
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

export function Login07({
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
    <div className="flex items-center justify-center min-h-[550px] w-full py-4">
      <div className="mx-auto w-full max-w-sm space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <Logo className="mx-auto h-12 w-12 text-[#b91c1c]" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Đăng nhập Hệ thống</h1>
          <p className="text-xs text-muted-foreground">
            Hệ thống Quản lý và Theo dõi Thi đua Quân nhân
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="signin-email" className="text-xs font-medium">
              Tên đăng nhập / Email
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="signin-email"
                className="peer ps-9 text-xs"
                placeholder="chihuy / chamdiem / quannhan"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <Mail size={15} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="signin-password" className="text-xs font-medium">
                Mật khẩu
              </Label>
              <a href="#" className="text-xs text-[#b91c1c] hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative mt-1.5">
              <Input
                id="signin-password"
                className="ps-9 pe-9 text-xs"
                placeholder="Nhập mật khẩu (vd: 123456)"
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <Lock size={15} aria-hidden="true" />
              </div>
              <button
                className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
              >
                {isVisible ? (
                  <EyeOff size={15} aria-hidden="true" />
                ) : (
                  <Eye size={15} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <Checkbox id="remember-me" defaultChecked />
            <Label htmlFor="remember-me" className="text-xs font-normal text-muted-foreground">
              Ghi nhớ đăng nhập 30 ngày
            </Label>
          </div>

          <Button type="submit" className="w-full bg-[#b91c1c] text-white hover:bg-red-800 font-medium">
            Đăng nhập hệ thống
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-1">
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-[#b91c1c] font-medium hover:underline"
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
    <Login07
      onSuccess={onSuccess}
      onSwitchToSignUp={() => setMode("signup")}
    />
  );
}
