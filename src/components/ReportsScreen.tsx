import React from "react";
import {
  ArrowRight,
  RotateCw,
  Receipt,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
} from "lucide-react";
import { OperationItem } from "../types";

interface Props {
  onBack: () => void;
  operations: OperationItem[];
  walletBalance: number;
  onRefresh?: () => void;
  onSelectOperation?: (op: OperationItem) => void;
}

export const ReportsScreen: React.FC<Props> = ({
  onBack,
  operations,
  walletBalance,
  onRefresh,
  onSelectOperation,
}) => {
  const successOps = operations.filter(
    (o) => o.status === "success" || (o.status as string) === "completed"
  );
  const failedOps = operations.filter(
    (o) => o.status === "failed" || (o.status as string) === "rejected"
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9FC] overflow-hidden">
      {/* ScreenFrame Header - Indigo theme matching Flutter AppColors.indigo */}
      <div className="bg-[#4F46E5] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="font-black text-base">التقارير والإحصائيات</div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition active:scale-95"
            title="تحديث البيانات"
          >
            <RotateCw className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 max-w-lg mx-auto w-full">
        {/* 3 Metric Cards matching RefMetric in Flutter */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-[18px] p-3 border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="text-[10px] text-slate-400 font-bold">كل العمليات</div>
            <div className="text-base font-black text-blue-600">{operations.length}</div>
          </div>

          <div className="bg-white rounded-[18px] p-3 border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-[10px] text-slate-400 font-bold">ناجحة</div>
            <div className="text-base font-black text-emerald-600">{successOps.length}</div>
          </div>

          <div className="bg-white rounded-[18px] p-3 border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1.5">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-[10px] text-slate-400 font-bold">فاشلة</div>
            <div className="text-base font-black text-rose-600">{failedOps.length}</div>
          </div>
        </div>

        {/* Live Server Summary Card matching PageCard in Flutter */}
        <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs text-right space-y-1.5">
          <div className="text-xs font-black text-slate-900">ملخص مباشر من الخادم</div>
          <div className="text-sm font-black text-[#8B1D3B]">
            الرصيد: {walletBalance.toLocaleString()} ر.ي
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            المنتجات: 30 • المتاجر: 3 • الطلبات: 0 • الخادم متصل ونشط
          </div>
        </div>

        {/* Section: آخر العمليات الناجحة */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 mb-2 text-right">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>آخر العمليات الناجحة</span>
          </div>

          <div className="space-y-2">
            {successOps.length === 0 ? (
              <div className="bg-white rounded-[18px] p-6 text-center border border-slate-200 text-slate-400 font-bold text-xs">
                لا توجد عمليات ناجحة مسجلة حتى الآن.
              </div>
            ) : (
              successOps.slice(0, 8).map((row, idx) => (
                <div
                  key={row.id ? `report-op-${row.id}-${idx}` : `report-op-${idx}`}
                  onClick={() => onSelectOperation && onSelectOperation(row)}
                  className="bg-white rounded-[16px] p-3 border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-indigo-400/40 transition active:scale-[0.99]"
                >
                  <div>
                    <div className="text-[11px] font-black text-slate-800">
                      {row.packageName}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-bold mt-0.5" dir="ltr">
                      {row.phone} • {row.date} {row.time}
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <div className="text-xs font-black text-emerald-600">
                      {row.amount.toLocaleString()} ر.ي
                    </div>
                    <div className="text-[9px] text-slate-400">
                      #{row.operationNumber}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
