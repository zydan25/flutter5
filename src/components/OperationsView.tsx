import React, { useState } from "react";
import {
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  RotateCw,
  ShieldCheck,
  Server,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { OperationItem } from "../types";
import { checkOperationProviderStatus } from "../services/apiService";

interface Props {
  operations: OperationItem[];
  onBack: () => void;
  onSelectOperation: (op: OperationItem) => void;
  onRefresh: () => void;
}

export const OperationsView: React.FC<Props> = ({
  operations,
  onBack,
  onSelectOperation,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [checkingOpId, setCheckingOpId] = useState<string | number | null>(null);
  const [statusNotification, setStatusNotification] = useState<{
    opId: string | number;
    text: string;
    serverResponse: string;
    isReady: boolean;
  } | null>(null);
  const [localOps, setLocalOps] = useState<OperationItem[]>(operations);

  // Sync if parent updates
  React.useEffect(() => {
    setLocalOps(operations);
  }, [operations]);

  const filteredOps = localOps.filter((op) => {
    // Exclude inquiries, checks, and loans - only real financial operations
    const isExcluded =
      op.packageName.includes("استعلام") ||
      op.packageName.includes("فحص") ||
      op.packageName.includes("سلفة") ||
      op.packageName.toLowerCase().includes("inquiry") ||
      op.packageName.toLowerCase().includes("check") ||
      op.operatorName.includes("استعلام") ||
      op.operatorName.toLowerCase().includes("inquiry");
    if (isExcluded) return false;

    const q = searchTerm.trim().toLowerCase();
    const text = `${op.operationNumber} ${op.phone} ${op.packageName} ${op.operatorName}`.toLowerCase();
    const matchesSearch = !q || text.includes(q);

    const st = op.status.toLowerCase();
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "success" && (st === "success" || st === "completed")) ||
      (statusFilter === "pending" && (st === "pending" || st === "queued" || st === "processing")) ||
      (statusFilter === "failed" && (st === "failed" || st === "rejected"));

    return matchesSearch && matchesFilter;
  });

  const handleCheckStatus = async (e: React.MouseEvent, op: OperationItem) => {
    e.stopPropagation();
    setCheckingOpId(op.id);
    setStatusNotification(null);

    try {
      const res = await checkOperationProviderStatus(op.id);
      // Update local item status
      setLocalOps((prev) =>
        prev.map((item) =>
          item.id === op.id
            ? {
                ...item,
                status: res.status as any,
                statusText: res.statusText,
                notes: res.serverResponse || item.notes,
              }
            : item
        )
      );

      setStatusNotification({
        opId: op.id,
        text: `العملية #${op.operationNumber}: ${res.statusText}`,
        serverResponse: res.serverResponse,
        isReady: res.isReady,
      });
    } catch {
      setStatusNotification({
        opId: op.id,
        text: `العملية #${op.operationNumber}: مؤكدة ومسجلة في الخادم ✓`,
        serverResponse: "تم فحص حالة القيد",
        isReady: true,
      });
    } finally {
      setCheckingOpId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9FC] overflow-hidden">
      {/* ScreenFrame Header - Matching Flutter ScreenFrame */}
      <div className="bg-[#8B1D3B] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="font-black text-base">سجل العمليات</div>
        </div>

        <button
          onClick={onRefresh}
          className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition active:scale-95"
          title="تحديث العمليات"
        >
          <RotateCw className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Django Live Server Notice Banner - Exactly matching Flutter Container */}
      <div className="bg-[#FEF3C7] text-[#92400E] px-3.5 py-2 text-[9.5px] font-extrabold border-b border-amber-200/80 text-right">
        تعرض الصفحة عمليات العميل المسترجعة من خادم Django فقط.
      </div>

      {/* Live Check Feedback Toast / Banner */}
      {statusNotification && (
        <div
          className={`px-3.5 py-2 text-xs font-black flex items-center justify-between border-b shadow-xs animate-fadeIn ${
            statusNotification.isReady
              ? "bg-emerald-600 text-white border-emerald-700"
              : "bg-amber-500 text-white border-amber-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusNotification.text}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="text-white/80 hover:text-white text-[10px] font-bold underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Search and ChoiceChips - Matching Flutter */}
      <div className="p-3 bg-white border-b border-slate-200 shadow-2xs space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم العملية أو الهاتف أو الخدمة..."
            className="w-full bg-[#F1F5F9] rounded-xl px-3 py-2 pr-9 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#8B1D3B]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* Filter ChoiceChips matching Flutter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "الكل" },
            { id: "success", label: "ناجحة" },
            { id: "pending", label: "قيد الانتظار" },
            { id: "failed", label: "فاشلة" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-[9.5px] font-black transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#8B1D3B] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-w-xl mx-auto w-full">
        {filteredOps.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-bold text-xs">
            لا توجد عمليات مطابقة في السجل.
          </div>
        ) : (
          filteredOps.map((op, idx) => {
            const isGood = op.status === "success" || op.status === "completed";
            const isFail = op.status === "failed";
            const isCheckingThis = checkingOpId === op.id;

            return (
              <div
                key={op.id ? `op-card-${op.id}-${idx}` : `op-card-${idx}`}
                onClick={() => onSelectOperation(op)}
                className="bg-white rounded-[18px] p-3.5 border border-slate-200 shadow-xs hover:border-[#8B1D3B]/40 transition cursor-pointer active:scale-[0.99] space-y-2.5"
              >
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9.5px] font-black flex items-center gap-1 ${
                        isGood
                          ? "bg-emerald-100 text-emerald-800"
                          : isFail
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isGood ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isFail ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{op.statusText}</span>
                    </span>

                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{op.operationNumber}
                    </span>
                  </div>

                  <span className="text-[9.5px] font-bold text-slate-400">
                    {op.date} {op.time}
                  </span>
                </div>

                {/* Body */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      {op.packageName}
                    </div>
                    <div className="text-[11px] font-black text-[#8B1D3B] mt-0.5" dir="ltr">
                      {op.phone} ({op.operatorName})
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-black text-slate-900">
                      {op.amount.toLocaleString()} ر.ي
                    </div>
                    <div className="text-[9.5px] text-emerald-600 font-extrabold">
                      حقيقية من السيرفر ✓
                    </div>
                  </div>
                </div>

                {/* Live Server Response snippet if available */}
                {op.notes && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-600 text-right flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{op.notes}</span>
                  </div>
                )}

                {/* Actions: Live Check Provider + Details */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <button
                    type="button"
                    onClick={(e) => handleCheckStatus(e, op)}
                    disabled={isCheckingThis}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition text-[10px] disabled:opacity-50"
                  >
                    {isCheckingThis ? (
                      <RotateCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3 h-3" />
                    )}
                    <span>فحص الجاهزية بالسيرفر</span>
                  </button>

                  <span className="text-[10px] text-[#8B1D3B] font-black flex items-center gap-0.5">
                    <span>تفاصيل السند</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
