import React, { useEffect, useState } from 'react';
import { X, User, Phone, MapPin, ShieldCheck, ArrowRight, LogOut, RefreshCw } from 'lucide-react';
import type { User as UserType } from '../types';
import { ALL_GOVERNORATES } from '../data/governorates';
import { completeProfileApi, loginVerifyApi, sendOtpApi, logoutApi } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  user: UserType | null;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

function toAsciiDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

function normalizePhone(value: string): string {
  let digits = toAsciiDigits(value).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `967${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('7')) digits = `967${digits}`;
  return digits;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  user,
  onClose,
  onLogin,
  onLogout,
  onShowToast,
}) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [thirdName, setThirdName] = useState('');
  const [lastName, setLastName] = useState('');
  const [governorate, setGovernorate] = useState('أمانة العاصمة');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isOpen) return;
    setStep('phone');
    setOtp('');
    setFirstName('');
    setSecondName('');
    setThirdName('');
    setLastName('');
    setGovernorate('أمانة العاصمة');
    setCooldown(0);
    setBusy(false);
  }, [isOpen]);

  const requestOtp = async () => {
    const normalized = normalizePhone(phone);
    if (!/^\d{8,15}$/.test(normalized)) {
      onShowToast('رقم الهاتف غير صالح. استخدم الرقم الدولي أو الرقم اليمني المحلي.', 'error');
      return;
    }

    setBusy(true);
    try {
      const result = await sendOtpApi(normalized);
      setPhone(normalized);
      setOtp('');
      setStep('otp');
      setCooldown(result.retryAfterSeconds || 60);
      onShowToast('تم إرسال رمز التحقق عبر واتساب ✅', 'success');
    } catch (error: any) {
      console.error('OTP send failed:', error);
      onShowToast(error?.message || 'تعذر إرسال رمز التحقق عبر واتساب', 'error');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedOtp = toAsciiDigits(otp).replace(/\D/g, '').slice(0, 6);
    setOtp(normalizedOtp);

    if (!/^\d{6}$/.test(normalizedOtp)) {
      onShowToast('رمز التحقق يجب أن يتكون من 6 أرقام', 'error');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!/^\d{8,15}$/.test(normalizedPhone)) {
      onShowToast('رقم الهاتف غير صالح، أعد إدخاله ثم اطلب رمزًا جديدًا.', 'error');
      setStep('phone');
      return;
    }

    setBusy(true);
    try {
      const result = await loginVerifyApi(normalizedPhone, normalizedOtp);
      if (result.needsProfile) {
        setStep('profile');
        onShowToast('تم التحقق من الرمز. أكمل بياناتك مرة واحدة.', 'info');
        return;
      }

      onLogin(result.user as UserType);
      onClose();
      onShowToast(
        result.user.isAdmin || result.user.role === 'admin'
          ? 'تم تسجيل الدخول كمدير بنجاح 👑'
          : `أهلًا بك يا ${result.user.firstName || 'عزيزي العميل'}!`,
        'success',
      );
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      onShowToast(error?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية', 'error');
    } finally {
      setBusy(false);
    }
  };

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName.trim()) {
      onShowToast('أدخل الاسم الأول', 'error');
      return;
    }
    if (!governorate) {
      onShowToast('اختر المحافظة', 'error');
      return;
    }

    setBusy(true);
    try {
      const result = await completeProfileApi({
        firstName: firstName.trim(),
        secondName: secondName.trim() || undefined,
        thirdName: thirdName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        governorate,
      });
      onLogin(result as UserType);
      onClose();
      onShowToast(`أهلًا بك يا ${result.firstName}! تم إنشاء حسابك على الخادم ✅`, 'success');
    } catch (error: any) {
      console.error('Profile completion failed:', error);
      onShowToast(error?.message || 'تعذر حفظ بيانات الحساب على الخادم', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  if (user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 bg-purple-700 text-white">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <h3 className="font-extrabold">الملف الشخصي</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-purple-800"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-lg">
                {user.firstName?.[0] || 'ع'}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{user.firstName} {user.secondName || ''} {user.lastName || ''}</h4>
                <span className="text-xs text-slate-500 font-mono">{user.phone}</span>
                {(user.isAdmin || user.role === 'admin') && (
                  <div className="inline-flex items-center gap-1 text-[10px] text-amber-800 mt-1">
                    <ShieldCheck className="w-3 h-3" /> مدير المتجر
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await logoutApi();
                } finally {
                  onLogout();
                  onClose();
                  onShowToast('تم تسجيل الخروج بنجاح', 'info');
                }
              }}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profileFields = (
    <>
      <div className="grid grid-cols-2 gap-2">
        <input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="الاسم الأول *" className="p-2.5 rounded-xl border border-slate-200 text-xs" />
        <input value={secondName} onChange={(event) => setSecondName(event.target.value)} placeholder="اسم الأب" className="p-2.5 rounded-xl border border-slate-200 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={thirdName} onChange={(event) => setThirdName(event.target.value)} placeholder="اسم الجد" className="p-2.5 rounded-xl border border-slate-200 text-xs" />
        <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="العائلة" className="p-2.5 rounded-xl border border-slate-200 text-xs" />
      </div>
      <div className="relative">
        <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
        <select value={governorate} onChange={(event) => setGovernorate(event.target.value)} className="w-full p-2.5 pr-9 rounded-xl border border-slate-200 text-xs bg-white">
          {ALL_GOVERNORATES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-purple-700 text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h3 className="font-extrabold">{step === 'profile' ? 'إكمال بيانات الحساب' : step === 'otp' ? 'التحقق من رمز واتساب' : 'الدخول برقم الهاتف'}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-purple-800"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          {step === 'phone' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">أدخل رقم الهاتف فقط، وسيصلك رمز التحقق من خادم المتجر عبر واتساب.</p>
              <div className="relative">
                <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="رقم الهاتف"
                  className="w-full p-3 pr-9 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <button disabled={busy} onClick={requestOtp} className="w-full py-3 rounded-xl bg-purple-600 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2">
                {busy ? 'جاري إرسال الرمز...' : 'إرسال رمز واتساب'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : step === 'otp' ? (
            <form onSubmit={verify} className="space-y-3">
              <div className="rounded-xl bg-purple-50 border border-purple-100 px-3 py-2 text-xs text-slate-600">
                أدخل الرمز الذي وصل إلى <b dir="ltr">{phone}</b>.
              </div>
              <input
                required
                autoFocus
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(toAsciiDigits(event.target.value).replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center tracking-[0.4em] text-2xl font-black p-4 rounded-xl border border-purple-200 bg-purple-50 focus:outline-hidden focus:border-purple-600"
                placeholder="000000"
                aria-label="رمز التحقق"
              />
              <button disabled={busy} type="submit" className="w-full py-3 rounded-xl bg-purple-600 disabled:opacity-50 text-white font-bold text-sm">
                {busy ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </button>
              <button type="button" disabled={cooldown > 0 || busy} onClick={requestOtp} className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown}ث` : 'إعادة إرسال الرمز'}
              </button>
              <button type="button" disabled={busy} onClick={() => { setStep('phone'); setOtp(''); }} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700">
                تغيير رقم الهاتف
              </button>
            </form>
          ) : (
            <form onSubmit={submitProfile} className="space-y-3">
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">تم التحقق من رقمك. أكمل البيانات مرة واحدة للحساب الجديد.</div>
              {profileFields}
              <button disabled={busy} className="w-full py-3 rounded-xl bg-purple-600 disabled:opacity-50 text-white font-bold text-sm">
                {busy ? 'جاري حفظ البيانات...' : 'حفظ البيانات وإنشاء الحساب'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
