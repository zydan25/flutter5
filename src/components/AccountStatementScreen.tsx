import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  RotateCw,
  ArrowUpDown,
  Search,
  Wallet,
} from "lucide-react";
import { fetchLiveWalletStatement, LiveStatementItem } from "../services/apiService";

interface Props {
  onBack: () => void;
  walletBalance: number;
  onRefreshWallet?: () => void;
}

export const AccountStatementScreen: React.FC<Props> = ({
  onBack,
  walletBalance,
  onRefreshWallet,
}) => {
  const [statement, setStatement] = useState<LiveStatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadStatement = async () => {
    setLoading(true);
    try {
      const data = await fetchLiveWalletStatement("YER");
      setStatement(data);
    } catch {
      setStatement([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatement();
  }, []);

  const handleRefresh = async () => {
    if (onRefreshWallet) onRefreshWallet();
    await loadStatement();
  };

  const filtered = statement.filter((row) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(row.description).toLowerCase().includes(q) ||
      String(row.reference || "").toLowerCase().includes(q) ||
      String(row.date).toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F7F9FC] overflow-hidden">
      {/* ScreenFrame Header - Teal theme matching Flutter AppColors.teal */}
      <div className="bg-[#0D9488] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="font-black text-base">كشف الحساب</div>
        </div>

        <button
          onClick={handleRefresh}
          className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition active:scale-95"
          title="تحديث كشف الحساب"
        >
          <RotateCw className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 max-w-lg mx-auto w-full">
        {/* Balance Card - Exactly matching Flutter PageCard in AccountStatementScreen */}
        <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs text-center space-y-1">
          <div className="text-[10px] text-slate-400 font-bold">الرصيد الحالي</div>
          <div className="text-3xl font-black text-[#8B1D3B] tracking-tight">
            {walletBalance.toLocaleString()} ر.ي
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            {statement.length} قيداً محاسبياً مسجلاً في الخادم
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في قيود الحساب..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 pr-9 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0D9488]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* Ledger List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs font-bold gap-2">
            <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
            <span>جاري استرجاع القيود المحاسبية من الخادم...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 text-center border border-slate-200 text-slate-400 font-bold text-xs space-y-2">
            <Wallet className="w-8 h-8 mx-auto text-slate-300" />
            <div>لا توجد قيود محاسبية مسجلة في كشف الحساب.</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((row, idx) => {
              const isNegative = row.amount < 0 || row.type === "debit";
              return (
                <div
                  key={row.id ? `stmt-${row.id}-${idx}` : `stmt-${idx}`}
                  className="bg-white rounded-[16px] p-3 border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-800">
                        {row.description}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                        {row.date}
                        {row.reference ? ` • مرجع: ${row.reference}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-left font-mono">
                    <div
                      className={`text-xs font-black ${
                        isNegative ? "text-[#8B1D3B]" : "text-emerald-600"
                      }`}
                    >
                      {row.amount > 0 ? `+${row.amount.toLocaleString()}` : row.amount.toLocaleString()}{" "}
                      <span className="text-[9px]">{row.currency}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
