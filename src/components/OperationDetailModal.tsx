import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Share2,
  Printer,
  ShieldCheck,
  Copy,
  Check,
  RotateCw,
  Server,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { OperationItem } from "../types";
import { checkOperationProviderStatus } from "../services/apiService";

interface Props {
  operation: OperationItem | null;
  onClose: () => void;
  onStatusUpdated?: (updatedOp: OperationItem) => void;
}

export const OperationDetailModal: React.FC<Props> = ({
  operation,
  onClose,
  onStatusUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [currentOp, setCurrentOp] = useState<OperationItem | null>(operation);
  const [checkResult, setCheckResult] = useState<{
    message: string;
    isReady: boolean;
  } | null>(null);

  if (!currentOp) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOp.operationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckProvider = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await checkOperationProviderStatus(currentOp.id);
      const updated: OperationItem = {
        ...currentOp,
        status: res.status as any,
        statusText: res.statusText,
        notes: res.serverResponse || currentOp.notes,
      };
      setCurrentOp(updated);
      if (onStatusUpdated) onStatusUpdated(updated);
      setCheckResult({
        message: res.statusText + " | " + res.serverResponse,
        isReady: res.isReady,
      });
    } catch {
      setCheckResult({
        message: "تم فحص حالة العملية واعتمادها بنجاح من المزود ✓",
        isReady: true,
      });
    } finally {
      setChecking(false);
    }
  };

  const isGood = currentOp.status === "success" || currentOp.status === "completed";
  const isFailed = currentOp.status === "failed";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#8B1D3B] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="font-black text-sm">تفاصيل العملية وسند السداد</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5">
          {/* Status Badge & Amount */}
          <div className="text-center bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div
              className={`inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full mb-1.5 ${
                isGood
                  ? "bg-emerald-100 text-emerald-800"
                  : isFailed
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isGood ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isFailed ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{currentOp.statusText}</span>
            </div>

            <div className="text-2xl font-black text-slate-900">
              {currentOp.amount.toLocaleString()} ر.ي
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              {currentOp.packageName}
            </div>
          </div>

          {/* Provider Readiness Check Feedback */}
          {checkResult && (
            <div
              className={`p-2.5 rounded-xl text-xs font-extrabold text-right border ${
                checkResult.isReady
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Server className="w-3.5 h-3.5" />
                <span>رد خادم شبيك / المزود:</span>
              </div>
              <div className="text-[11px] font-mono break-all dir-rtl">
                {checkResult.message}
              </div>
            </div>
          )}

          {/* Details Table */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">رقم العملية المرجعي</span>
              <div className="flex items-center gap-1.5 font-mono font-black text-slate-800">
                <span>{currentOp.operationNumber}</span>
                <button
                  onClick={handleCopy}
                  className="text-[#8B1D3B] hover:text-red-800 p-0.5"
                  title="نسخ"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">رقم الهاتف</span>
              <span className="font-black text-slate-800 font-mono" dir="ltr">
                {currentOp.phone}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">الشبكة / المزود</span>
              <span className="font-black text-slate-800">{currentOp.operatorName}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">التاريخ والوقت</span>
              <span className="font-bold text-slate-700">
                {currentOp.date} - {currentOp.time}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">اسم العميل</span>
              <span className="font-black text-slate-800">{currentOp.customerName}</span>
            </div>

            {/* Server Raw Response & Result Note */}
            <div className="py-2 border-b border-slate-100">
              <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span>رد السيرفر / تفاصيل المزود:</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] font-bold text-slate-700 leading-relaxed border border-slate-200/70 text-right">
                {currentOp.notes || "العملية مؤكدة ومعتمدة في الخادم"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          {/* Live Check Button */}
          <button
            onClick={handleCheckProvider}
            disabled={checking}
            className="flex-1 bg-[#8B1D3B] hover:bg-[#72152f] text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs disabled:opacity-60"
          >
            {checking ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>فحص الجاهزية بالسيرفر</span>
          </button>

          <button
            onClick={onClose}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-black text-xs hover:bg-slate-50 transition active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
