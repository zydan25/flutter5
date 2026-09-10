import React, { useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Zap,
  CheckCircle2,
  RotateCw,
  Search
} from "lucide-react";

interface Props {
  onBack: () => void;
  walletBalance: number;
  onRechargeGame: (amount: number, gameName: string, playerId: string) => void;
}

export const GamesServicesScreen: React.FC<Props> = ({
  onBack,
  walletBalance,
  onRechargeGame,
}) => {
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const games = [
    {
      id: "pubg",
      name: "ببجي موبايل (PUBG UC)",
      icon: "🎯",
      packages: [
        { id: 1, name: "60 شدة UC", price: 350 },
        { id: 2, name: "325 شدة UC", price: 1750 },
        { id: 3, name: "660 شدة UC (الرويال باس)", price: 3400 },
        { id: 4, name: "1800 شدة UC", price: 8500 },
      ],
    },
    {
      id: "freefire",
      name: "فري فاير (Free Fire Diamonds)",
      icon: "🔥",
      packages: [
        { id: 11, name: "100 + 10 جوهرة", price: 400 },
        { id: 12, name: "310 + 31 جوهرة", price: 1200 },
        { id: 13, name: "520 + 52 جوهرة", price: 1950 },
        { id: 14, name: "1060 + 106 جوهرة", price: 3900 },
      ],
    },
    {
      id: "playstation",
      name: "بطاقات بلايستيشن (PlayStation)",
      icon: "🎮",
      packages: [
        { id: 21, name: "بطاقة 10$ سعودي/أمريكي", price: 2950 },
        { id: 22, name: "بطاقة 20$ سعودي/أمريكي", price: 5800 },
        { id: 23, name: "اشتراك بلس شهر", price: 3400 },
      ],
    },
    {
      id: "googleplay",
      name: "بطاقات جوجل بلاي (Google Play)",
      icon: "💳",
      packages: [
        { id: 31, name: "بطاقة 5$ رقمية", price: 1500 },
        { id: 32, name: "بطاقة 10$ رقمية", price: 2950 },
        { id: 33, name: "بطاقة 25$ رقمية", price: 7200 },
      ],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId.trim()) {
      alert("يرجى إدخال الآيدي (Player ID) الخاص بالحساب");
      return;
    }
    if (!selectedPackage) {
      alert("يرجى اختيار فئة الشحن");
      return;
    }
    if (walletBalance < selectedPackage.price) {
      alert("رصيدك لا يكفي لإتمام هذه العملية");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onRechargeGame(selectedPackage.price, selectedGame.name, playerId);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
      {/* Top Header */}
      <div className="bg-[#8B1D3B] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
            title="العودة إلى واجهة حسابي الرئيسية"
          >
            <ArrowRight className="w-4 h-4" />
            <span>حسابي</span>
          </button>
          <div className="font-black text-base">شحن الألعاب والبطائق</div>
        </div>

        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {success ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-base font-black text-slate-900">
              تم شحن الحساب بنجاح فوري!
            </div>
            <div className="text-xs text-slate-500 font-bold">
              تم إرسال {selectedPackage?.name} للحساب {playerId}
            </div>

            <button
              onClick={() => {
                setSuccess(false);
                setSelectedGame(null);
                setSelectedPackage(null);
                setPlayerId("");
              }}
              className="w-full bg-[#8B1D3B] text-white py-3 rounded-2xl text-xs font-black shadow-md mt-4"
            >
              شحن لعبة أخرى
            </button>
          </div>
        ) : selectedGame ? (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedGame.icon}</span>
                <div className="font-black text-xs text-slate-800">{selectedGame.name}</div>
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="text-xs text-[#8B1D3B] font-bold"
              >
                تغيير اللعبة
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  معرف اللاعب (Player ID)
                </label>
                <input
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="ادخل الآيدي الرقمي..."
                  className="w-full bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#8B1D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  اختر الباقة المطلوبة
                </label>
                <div className="space-y-1.5">
                  {selectedGame.packages.map((pkg: any, idx: number) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={`game-${selectedGame.id}-pkg-${pkg.id || idx}-${idx}`}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? "border-[#8B1D3B] bg-rose-50/50 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="text-xs font-black text-slate-800">{pkg.name}</div>
                        <div className="text-xs font-black text-[#8B1D3B]">{pkg.price} ر.ي</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#8B1D3B] hover:bg-[#70162f] text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] mt-2"
              >
                {isSubmitting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{isSubmitting ? "جاري الشحن..." : "تأكيد الشحن الفوري"}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="text-xs font-black text-slate-800 mb-1">
              اختر اللعبة أو المنصة
            </div>
            {games.map((g, idx) => (
              <div
                key={`game-platform-${g.id || idx}`}
                onClick={() => setSelectedGame(g)}
                className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <div className="font-black text-xs text-slate-800">{g.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {g.packages.length} فئات متوفرة فوري
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 rotate-180" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
