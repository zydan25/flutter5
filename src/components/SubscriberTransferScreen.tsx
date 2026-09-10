import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Send,
  Search,
  User,
  CheckCircle2,
  Wallet,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  lookupRecipient,
  submitSubscriberTransfer,
  fetchRecentSubscribers,
} from "../services/apiService";

interface Props {
  onBack: () => void;
  walletBalance: number;
  onTransferSuccess: (amount: number, recipientPhone: string, recipientName: string) => void;
}

export const SubscriberTransferScreen: React.FC<Props> = ({
  onBack,
  walletBalance,
  onTransferSuccess,
}) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [lookup, setLookup] = useState<{ name: string; phone: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSubscribers, setRecentSubscribers] = useState<Array<{ name: string; phone: string }>>([]);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<{
    amount: number;
    receiverName: string;
    journal: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetchRecentSubscribers().then((list) => {
      if (active && list.length > 0) {
        setRecentSubscribers(list);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleLookupRecipient = async (targetPhone?: string) => {
    const phone = (targetPhone || receiver).trim();
    if (!phone) {
      setError("يرجى إدخال رقم المستلم أولاً.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const res = await lookupRecipient(phone);
      if (res.success && res.name) {
        setLookup({
          name: res.name,
          phone: res.phone || phone,
        });
        if (targetPhone) {
          setReceiver(phone);
        }
      } else {
        setLookup(null);
        setError(res.message || "المشترك غير مسجل في نظام شبيك.");
      }
    } catch (err: any) {
      setLookup(null);
      setError("تعذر التحقق من المستلم: " + (err.message || ""));
    } finally {
      setBusy(false);
    }
  };

  const handleRequestConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const value = parseFloat(amount.trim());
    if (isNaN(value) || value <= 0) {
      setError("يرجى إدخال مبلغ تحويل صحيح أكبر من الصفر.");
      return;
    }
    if (!lookup) {
      setError("يرجى فحص المستلم والتحقق من حسابه أولاً.");
      return;
    }
    if (value > walletBalance) {
      setError(`رصيدك الحالي (${walletBalance.toLocaleString()} ر.ي) لا يكفي لإتمام هذا التحويل.`);
      return;
    }
    setError(null);
    setConfirmModal(true);
  };

  const executeTransfer = async () => {
    setConfirmModal(false);
    const value = parseFloat(amount.trim());
    if (!lookup) return;

    setBusy(true);
    setError(null);
    try {
      const res = await submitSubscriberTransfer(receiver.trim(), value, note.trim());
      if (res.success) {
        onTransferSuccess(value, receiver.trim(), res.recipientName || lookup.name);
        setSuccessModal({
          amount: value,
          receiverName: res.recipientName || lookup.name,
          journal: res.transferId || "TR-" + Math.floor(100000 + Math.random() * 900000),
        });
      } else {
        setError(res.message || "فشلت عملية التحويل من الخادم.");
      }
    } catch (err: any) {
      setError("حدث خطأ أثناء التحويل: " + (err.message || ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9FC] overflow-y-auto">
      {/* ScreenFrame Header - Amber theme matching Flutter AppColors.amber */}
      <div className="bg-[#D97706] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="font-black text-base">تحويل لمشترك</div>
        </div>

        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="p-3.5 space-y-3 max-w-lg mx-auto w-full">
        {/* Wallet balance banner */}
        <div className="bg-white rounded-[20px] p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold">الرصيد المتاح للتحويل</div>
              <div className="text-sm font-black text-slate-900">
                {walletBalance.toLocaleString()} ر.ي
              </div>
            </div>
          </div>
          <span className="text-[9.5px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-md">
            تحويل فوري
          </span>
        </div>

        {/* Recent Subscribers from Server */}
        {recentSubscribers.length > 0 && (
          <div className="bg-white rounded-[20px] p-3 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 mb-2 text-right">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>مشتركون سابقون ومسجلون</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSubscribers.map((sub, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setReceiver(sub.phone);
                    handleLookupRecipient(sub.phone);
                  }}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[10px] font-black transition active:scale-95 flex items-center gap-1"
                >
                  <User className="w-3 h-3 text-amber-700" />
                  <span>{sub.name}</span>
                  <span className="text-[9px] text-amber-700/70 font-mono" dir="ltr">({sub.phone})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-[#FFF1F2] border border-[#FECACA] rounded-[14px] text-[10px] font-extrabold text-[#BE123C] text-right">
            {error}
          </div>
        )}

        {/* Card 1: Receiver input + Lookup button (Identical to Flutter PageCard) */}
        <div className="bg-white rounded-[20px] p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">
              رقم المستلم
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                inputMode="numeric"
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value.replace(/\D/g, ""));
                  setLookup(null);
                  setError(null);
                }}
                placeholder="77XXXXXXX"
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-right"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleLookupRecipient()}
            disabled={busy || !receiver.trim()}
            className="w-full h-10 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-[14px] font-black text-[11px] shadow-2xs active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {busy && !lookup ? (
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 text-amber-600" />
                <span>فحص المستلم من السيرفر</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Found recipient profile card (Flutter lookup result card) */}
        {lookup && (
          <div className="bg-white rounded-[20px] p-3 border border-slate-200 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center text-amber-600">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 text-right">
                <div className="text-[11px] font-black text-slate-900">{lookup.name}</div>
                <div className="text-[9.5px] font-bold text-slate-400 font-mono" dir="ltr">
                  {lookup.phone}
                </div>
              </div>
              <div className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-md">
                معتمد ✓
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Amount + Note + Transfer Button (Flutter PageCard) */}
        <div className="bg-white rounded-[20px] p-3.5 border border-slate-200 shadow-xs space-y-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">
              المبلغ (ر.ي)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ بالريال اليمني"
                className="w-full pl-12 pr-3 py-2 text-xs font-black bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-right"
              />
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-black text-slate-400">
                ر.ي
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">
              ملاحظة اختيارية
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: دفعة رصيد / تحويل سداد"
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-right resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleRequestConfirm}
            disabled={busy || !lookup || !amount.trim()}
            className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-[15px] font-black text-xs shadow-xs active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>متابعة التحويل</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && lookup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-5 w-full max-w-sm text-center shadow-xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-slate-900 mb-1">تأكيد عملية التحويل</h2>
            <p className="text-xs text-slate-500 font-bold mb-4">
              هل أنت متأكد من تحويل المبلغ التالي للمشترك؟
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-right mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">المستلم</span>
                <span className="font-black text-slate-900">{lookup.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">رقم الهاتف</span>
                <span className="font-bold text-slate-700 font-mono" dir="ltr">{lookup.phone}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">المبلغ المطلوب</span>
                <span className="font-black text-amber-600 font-mono">{parseFloat(amount).toLocaleString()} ر.ي</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={executeTransfer}
                className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs shadow-xs active:scale-95 transition"
              >
                تأكيد وإرسال
              </button>
              <button
                type="button"
                onClick={() => setConfirmModal(false)}
                className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog - Exactly matching Flutter AlertDialog */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-5 w-full max-w-sm text-center shadow-xl border border-slate-200 animate-scaleUp">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-base font-black text-slate-900 mb-2">نجح التحويل</h2>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-right mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">المبلغ</span>
                <span className="font-black text-amber-600 font-mono">
                  {successModal.amount.toLocaleString()} ر.ي
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">المستلم</span>
                <span className="font-black text-slate-800">{successModal.receiverName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">المرجع</span>
                <span className="font-bold text-slate-700 font-mono">{successModal.journal}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessModal(null);
                onBack();
              }}
              className="w-full h-10 bg-[#8B1D3B] hover:bg-[#72152f] text-white rounded-xl font-black text-xs shadow-xs active:scale-95 transition"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
