import React, { useState } from "react";
import {
  ArrowRight,
  Store,
  Star,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Truck,
  Heart,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  X,
  Send,
  Check
} from "lucide-react";
import { StoreProduct } from "../types";

interface Props {
  storeName?: string;
  onBack: () => void;
  onSelectProduct: (product: StoreProduct) => void;
  onAddToCart: (product: StoreProduct) => void;
}

export const StoreProfileView: React.FC<Props> = ({
  storeName = "زيزو",
  onBack,
  onSelectProduct,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "store"; text: string; time: string }[]>([
    { sender: "store", text: `أهلاً بك في متجر ${storeName}! يسعدنا خدمتك والرد على استفساراتك حول المنتجات والتوصيل.`, time: "الآن" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [showCallToast, setShowCallToast] = useState(false);

  const tabs = ["الكل", "العروض والتخفيضات", "جديدنا", "الأكثر طلباً"];

  const storeProducts: StoreProduct[] = [
    {
      id: 2,
      name: "بنطلون جينز كلاسيك",
      price: 1900,
      salePrice: 2000,
      storeName: storeName,
      category: "الملابس",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      rating: 4.8,
      stock: 40,
      sku: "1234",
      brand: "Apple",
      description: "منتج أصلي معتمد متوفر من زيزو بضمان وجودة عالية.",
      isTrending: true,
    },
    {
      id: 3,
      name: "قميص شبابي فاخر",
      price: 4500,
      salePrice: 5000,
      storeName: storeName,
      category: "الملابس",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
      rating: 4.9,
      stock: 15,
      sku: "SH-09",
      brand: "Zara",
      description: "خامة قطن 100% مريحة وأنيقة.",
    },
    {
      id: 1,
      name: "ساعة ذكية ألترا",
      price: 18000,
      salePrice: 22000,
      storeName: storeName,
      category: "الإلكترونيات",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      rating: 4.7,
      stock: 9,
      sku: "SW-01",
      brand: "Apple",
      description: "ساعة متعددة الوظائف مع قياس نبضات القلب والأنشطة الرياضية.",
      isTrending: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto" dir="rtl">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-base font-black text-slate-900">
            الملف التعريفي للمتجر
          </div>
        </div>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-1.5 bg-[#1E3A8A] text-white px-3 py-1.5 rounded-full text-xs font-black shadow-xs hover:bg-blue-900 transition"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>محادثة المتجر</span>
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Store Card Header matching Screenshot 6 & 11 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md">
                {storeName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{storeName}</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    تاجر موثق
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                    <span>4.9</span>
                  </div>
                  <span>•</span>
                  <span>أكثر من 280 طلب مكتمل</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => setShowCallToast(true)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition"
                title="اتصال هاتفي"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center active:scale-95 transition"
                title="محادثة المتجر"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-xl">
              <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="text-[11px] text-slate-500">الموقع</div>
              <div className="font-bold text-slate-800">صنعاء - شارع الزبيري</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[11px] text-slate-500">أوقات العمل</div>
              <div className="font-bold text-slate-800">9:00 ص - 10:00 م</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <Truck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="text-[11px] text-slate-500">التوصيل</div>
              <div className="font-bold text-slate-800">خلال 24 ساعة</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab, idx) => {
            const isSel = activeTab === tab;
            return (
              <button
                key={`store-tab-${tab}-${idx}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition ${
                  isSel
                    ? "bg-[#1E3A8A] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span>منتجات المتجر المتاحة ({storeProducts.length})</span>
            <span className="text-slate-400 font-normal">توصيل مباشر من المحل</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {storeProducts.map((p, idx) => (
              <div
                key={p.id ? `store-prof-prod-${p.id}-${idx}` : `store-prof-prod-${idx}`}
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer"
              >
                <div className="relative aspect-square bg-slate-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {p.salePrice && (
                    <span className="absolute bottom-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      خصم {Math.round(((p.salePrice - p.price) / p.salePrice) * 100)}%
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">{p.name}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.category}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-[#1E3A8A]">
                      {p.price.toLocaleString()} ر.ي
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(p);
                      }}
                      className="w-7 h-7 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-blue-900 transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call Dialog / Toast */}
      {showCallToast && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">الاتصال بإدارة متجر {storeName}</h3>
              <p className="text-xs text-slate-500 mt-1">الرقم المباشر المعتمد للتواصل وخدمة العملاء</p>
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-black text-slate-800">
                771642093
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("771642093");
                  setShowCallToast(false);
                }}
                className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2 rounded-xl text-xs font-black transition active:scale-95"
              >
                نسخ الرقم
              </button>
              <button
                onClick={() => setShowCallToast(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Interactive Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="bg-[#1E3A8A] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-sm">
                  {storeName[0]}
                </div>
                <div>
                  <div className="text-sm font-black flex items-center gap-1.5">
                    <span>محادثة: {storeName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <div className="text-[11px] text-blue-200">متصل الآن • الرد فوري</div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-medium shadow-xs ${
                      msg.sender === "user"
                        ? "bg-[#1E3A8A] text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick suggested chips */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {["هل المنتج متوفر؟", "متى موعد التوصيل؟", "هل يوجد خصم للكميات؟"].map((quick) => (
                <button
                  key={quick}
                  onClick={() => {
                    setChatMessages((prev) => [
                      ...prev,
                      { sender: "user", text: quick, time: "الآن" },
                      { sender: "store", text: "أهلاً بك! نعم بالتأكيد متوفر ويتم تجهيز طلبك فوراً.", time: "الآن" },
                    ]);
                  }}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold shrink-0 border border-blue-100 transition"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inputMessage.trim()) return;
                const userText = inputMessage.trim();
                setInputMessage("");
                setChatMessages((prev) => [
                  ...prev,
                  { sender: "user", text: userText, time: "الآن" },
                ]);
                setTimeout(() => {
                  setChatMessages((prev) => [
                    ...prev,
                    { sender: "store", text: "شكراً لرسالتك! سنقوم بالرد عليك خلال دقائق وتأكيد طلبك.", time: "الآن" },
                  ]);
                }, 800);
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب رسالتك لمتجر التاجر..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white flex items-center justify-center shadow-xs transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
