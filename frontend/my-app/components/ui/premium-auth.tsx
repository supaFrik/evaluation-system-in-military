'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, Shield, AlertTriangle, KeyRound, Phone, Loader2,
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';
type RegistrationStep = 'details' | 'verification' | 'complete';

interface AuthFormProps {
  onSuccess?: (userData: { email: string; name?: string; role?: string }) => void;
  onClose?: () => void;
  initialMode?: AuthMode;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeToTerms: boolean;
  rememberMe: boolean;
  verificationCode: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  agreeToTerms?: string;
  general?: string;
  verificationCode?: string;
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface PasswordStrength {
  score: number;
  feedback: string[];
}

const calcStrength = (pw: string): PasswordStrength => {
  const req = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    num: /\d/.test(pw),
    special: /[!@#$%^&*]/.test(pw),
  };
  const score = Object.values(req).filter(Boolean).length;
  const feedback: string[] = [];
  if (!req.length) feedback.push('Ít nhất 8 ký tự');
  if (!req.upper) feedback.push('Có chữ hoa');
  if (!req.lower) feedback.push('Có chữ thường');
  if (!req.num) feedback.push('Có chữ số');
  if (!req.special) feedback.push('Có ký tự đặc biệt');
  return { score, feedback };
};

const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const { score, feedback } = calcStrength(password);
  if (!password) return null;
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-blue-500', 'bg-emerald-500'];
  const labels = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? colors[score] : 'bg-zinc-200'}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-zinc-500 w-16 text-right">{labels[score]}</span>
      </div>
      {feedback.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {feedback.map((f) => (
            <span key={f} className="flex items-center gap-1 text-[11px] text-amber-600">
              <AlertTriangle className="h-2.5 w-2.5" /> {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export function AuthForm({ onSuccess, onClose, initialMode = 'login', className }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<RegistrationStep>('details');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState<FormData>({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', agreeToTerms: false, rememberMe: false, verificationCode: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: keyof FormData, value: string | boolean): string => {
    switch (field) {
      case 'name': return mode === 'signup' && !String(value).trim() ? 'Họ tên là bắt buộc' : '';
      case 'email':
        if (!value) return 'Email là bắt buộc';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) return 'Email không hợp lệ';
        return '';
      case 'password':
        if (!value) return 'Mật khẩu là bắt buộc';
        if (String(value).length < 8) return 'Mật khẩu ít nhất 8 ký tự';
        return '';
      case 'confirmPassword':
        return mode === 'signup' && value !== form.password ? 'Mật khẩu xác nhận không khớp' : '';
      case 'agreeToTerms':
        return mode === 'signup' && !value ? 'Phải đồng ý điều khoản' : '';
      default: return '';
    }
  }, [mode, form.password]);

  const handleChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err || undefined }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  }, [form, validateField]);

  const validateAll = useCallback(() => {
    const loginFields = ['email', 'password'] as const;
    const signupExtra = ['name', 'confirmPassword', 'agreeToTerms'] as const;
    const errs: FormErrors = {};

    loginFields.forEach((f) => {
      const e = validateField(f, form[f]);
      if (e) errs[f] = e;
    });

    if (mode === 'signup') {
      signupExtra.forEach((f) => {
        const e = validateField(f, form[f]);
        if (e) errs[f] = e;
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [mode, form, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 900));
      if (mode === 'login') {
        setSuccessMsg('Đăng nhập thành công!');
        if (form.rememberMe) localStorage.setItem('userEmail', form.email);
        onSuccess?.({ email: form.email });
      } else if (mode === 'signup') {
        if (step === 'details') { setStep('verification'); setSuccessMsg('Vui lòng xác thực email!'); }
        else if (step === 'verification') { setStep('complete'); onSuccess?.({ email: form.email, name: form.name }); }
      } else {
        setSuccessMsg('Đã gửi email đặt lại mật khẩu!');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch {
      setErrors({ general: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    'w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#b91c1c] focus:ring-2 focus:ring-[#b91c1c]/10 transition-all';

  const renderForm = () => {
    if (mode === 'reset') return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <KeyRound className="h-10 w-10 text-[#b91c1c] mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Nhập email để nhận liên kết đặt lại mật khẩu</p>
        </div>
        <FieldWrap icon={<Mail />} error={errors.email}>
          <input type="email" placeholder="Địa chỉ Email" value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')} className={inputBase} />
        </FieldWrap>
        <SubmitButton loading={loading} label="Gửi liên kết đặt lại" />
        <BackLink label="Quay lại Đăng nhập" onClick={() => setMode('login')} />
      </div>
    );

    if (mode === 'signup' && step === 'verification') return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <Mail className="h-10 w-10 text-[#b91c1c] mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Nhập mã 6 chữ số đã gửi đến <strong>{form.email}</strong></p>
        </div>
        <input type="text" placeholder="000000" value={form.verificationCode}
          onChange={(e) => handleChange('verificationCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          className="w-full text-center py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-2xl font-mono tracking-[1rem] focus:outline-none focus:border-[#b91c1c]"
        />
        <SubmitButton loading={loading} label="Xác thực Email" disabled={form.verificationCode.length !== 6} />
        <BackLink label="Quay lại điền thông tin" onClick={() => setStep('details')} />
      </div>
    );

    if (mode === 'signup' && step === 'complete') return (
      <div className="text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Đăng ký thành công!</h3>
          <p className="text-sm text-zinc-500 mt-1">Tài khoản của đồng chí đã được tạo thành công.</p>
        </div>
        <button onClick={onClose}
          className="w-full rounded-lg bg-[#b91c1c] py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors">
          Bắt đầu sử dụng
        </button>
      </div>
    );

    return (
      <div className="space-y-3.5">
        {mode === 'signup' && (
          <FieldWrap icon={<User />} error={errors.name}>
            <input type="text" placeholder="Họ và tên" value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')} className={inputBase} />
          </FieldWrap>
        )}
        <FieldWrap icon={<Mail />} error={errors.email}>
          <input type="email" placeholder="Địa chỉ Email / Tên đăng nhập" value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')} className={inputBase} />
        </FieldWrap>
        <div>
          <FieldWrap icon={<Lock />} error={errors.password}
            suffix={
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }>
            <input type={showPw ? 'text' : 'password'} placeholder="Mật khẩu" value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')} className={cn(inputBase, 'pr-10')} />
          </FieldWrap>
          {mode === 'signup' && <StrengthBar password={form.password} />}
        </div>
        {mode === 'signup' && (
          <>
            <FieldWrap icon={<Shield />} error={errors.confirmPassword}
              suffix={
                <button type="button" onClick={() => setShowPw2(!showPw2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }>
              <input type={showPw2 ? 'text' : 'password'} placeholder="Xác nhận mật khẩu" value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')} className={cn(inputBase, 'pr-10')} />
            </FieldWrap>
            <FieldWrap icon={<Phone />} error={errors.phone}>
              <input type="tel" placeholder="Số điện thoại (tuỳ chọn)" value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)} className={inputBase} />
            </FieldWrap>
          </>
        )}
        <div className="flex items-center justify-between pt-0.5">
          {mode === 'login' ? (
            <>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
                <input type="checkbox" checked={form.rememberMe}
                  onChange={(e) => handleChange('rememberMe', e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#b91c1c]" />
                Ghi nhớ đăng nhập
              </label>
              <button type="button" onClick={() => setMode('reset')}
                className="text-xs text-[#b91c1c] hover:underline">
                Quên mật khẩu?
              </button>
            </>
          ) : (
            <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-600">
              <input type="checkbox" checked={form.agreeToTerms}
                onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-[#b91c1c]" />
              <span>Tôi đồng ý với <a href="#" className="text-[#b91c1c] hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-[#b91c1c] hover:underline">Chính sách bảo mật</a></span>
            </label>
          )}
        </div>
        {errors.agreeToTerms && (
          <p className="text-[11px] text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />{errors.agreeToTerms}
          </p>
        )}
        <SubmitButton loading={loading} label={mode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản'} />
      </div>
    );
  };

  return (
    <div className={cn('w-full p-6', className)}>
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}
      {errors.general && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {errors.general}
        </div>
      )}

      {/* Tab Toggle */}
      {mode !== 'reset' && (
        <div className="mb-6 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
          {(['login', 'signup'] as const).map((m) => (
            <button key={m} type="button"
              onClick={() => { setMode(m); setStep('details'); setErrors({}); setSuccessMsg(''); }}
              className={cn(
                'flex-1 rounded-md py-2 text-xs font-semibold transition-colors',
                mode === m ? 'bg-white text-[#b91c1c] shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              )}>
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>{renderForm()}</form>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FieldWrap({
  icon, error, children, suffix,
}: { icon: React.ReactNode; error?: string; children: React.ReactNode; suffix?: React.ReactNode }) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
        {children}
        {suffix}
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
          <AlertTriangle className="h-2.5 w-2.5" />{error}
        </p>
      )}
    </div>
  );
}

function SubmitButton({ loading, label, disabled }: { loading: boolean; label: string; disabled?: boolean }) {
  return (
    <button type="submit" disabled={loading || disabled}
      className="mt-1 w-full rounded-lg bg-[#b91c1c] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
    </button>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="text-center">
      <button type="button" onClick={onClick} className="text-xs text-[#b91c1c] hover:underline">{label}</button>
    </div>
  );
}
