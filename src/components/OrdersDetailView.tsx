import React, { useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  Phone,
  MapPin,
  Edit2,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  RotateCw,
  ShoppingBag,
  Star,
  Info,
  ShieldCheck,
  Send
} from "lucide-react";
import { StoreOrder } from "../types";

interface Props {
  order: StoreOrder;
  onBack: () => void;
  onOpenProduct?: (productName: string) => void;
  onReorder?: (item: any) => void;
}

export const OrdersDetailView: React.FC<Props> = ({
  order,
  onBack,
  onOpenProduct,
  onReorder,
}) => {
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "vendor"; text: string; time: string }>>([
    {
      sender: "vendor",
      text: `أهلاً بك! طلبك (${order.orderNumber}) مؤكد من المتجر وجاري تجهيزه وتوصيله.`,
      time: "10:30 ص",
    },
  ]);

  const steps = [
    { title: "تم استلام الطلب وتأكيد الدفع", desc: "تم خصم المبلغ من المحفظة وتأكيده", step: 1 },
    { title: "قيد التجهيز والتغليف بالمتجر", desc: "المتجر يقوم بفحص وتجهيز الأصناف", step: 2 },
    { title: "في الطريق مع مندوب التوصيل", desc: "الكابتن استلم الشحنة وفي طريقه إليك", step: 3 },
    { title: "تم تسليم الطلب بنجاح", desc: "تم الاستلام وتأكيد الفاتورة المعتمدة", step: 4 },
  ];

  // Active step index (default to step 1 active, or step 4 if delivered)
  const currentStep = order.status === "delivered" ? 4 : order.status === "shipped" ? 3 : 1;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: chatMessage, time: "الآن" },
    ]);
    setChatMessage("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "vendor",
          text: "شكراً لتواصلك، نحن في خدمتك وسنرد عليك في أقرب لحظة.",
          time: "الآن",
        },
      ]);
    }, 800);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto" dir="rtl">
      {/* Top App Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <div className="text-sm font-black text-slate-900">
              تفاصيل الطلب: {order.orderNumber}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {order.vendorName || "متجر زيزو"} • {order.date}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-black hover:bg-blue-100 transition shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>محادثة فورية</span>
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* 1. Order Tracking Timeline Card (Matches Screenshot 10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>حالة وتتبع الطلب</span>
            </h3>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {order.statusText}
            </span>
          </div>

          <div className="space-y-4 relative pr-2">
            {steps.map((st, idx) => {
              const isDoneOrCurrent = st.step <= currentStep;
              const isLast = idx === steps.length - 1;

              return (
                <div key={`track-step-${st.step}-${idx}`} className="flex items-start gap-3 relative">
                  {/* Step circle indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${
                        isDoneOrCurrent
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {st.step}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          st.step < currentStep ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <div
                      className={`text-xs font-black ${
                        isDoneOrCurrent ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {st.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {st.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Delivery & Courier Details (Matches Screenshot 10 & 13) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>معلومات التوصيل والمندوب</span>
          </h3>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>صنعاء - العنوان المسجل (حدة - الحي الدبلوماسي)</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => alert("يمكنك تعديل العنوان من دفتر العناوين")}
                className="flex-1 py-1.5 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-blue-100 transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>تعديل العنوان</span>
              </button>

              <button
                onClick={() => alert("طلب إلغاء الطلب قيد المراجعة لدى المتجر")}
                className="flex-1 py-1.5 px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-rose-100 transition"
              >
                <XCircle className="w-3 h-3" />
                <span>إلغاء الطلب</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">مندوب التوصيل المعتمد</div>
                <div className="text-[11px] text-slate-500 font-mono">771234567</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>محادثة فورية</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Items Breakdown and Invoice (Matches Screenshot 10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>تفاصيل الأصناف والفاتورة</span>
          </h3>

          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={item.id ? `ord-item-${item.id}-${idx}` : `ord-item-${idx}`}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-black text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      الكمية: {item.quantity} × {item.price.toLocaleString()} ر.ي
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#1E3A8A]">
                    {(item.price * item.quantity).toLocaleString()} ر.ي
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <button
                    onClick={() => onOpenProduct && onOpenProduct(item.productName)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 text-[11px] font-bold hover:bg-slate-100 flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>تفاصيل المنتج</span>
                  </button>
                  <button
                    onClick={() => onReorder && onReorder(item)}
                    className="px-2.5 py-1 rounded-lg bg-[#1E3A8A] text-white text-[11px] font-bold hover:bg-blue-900 flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>إعادة طلب</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 text-emerald-800 text-xs font-black p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>طريقة الدفع: wallet (المحفظة)</span>
            </span>
            <span>الإجمالي المدفوع: YER {order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* 4. Financial Summary Card (Matches Screenshot 10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <h3 className="text-sm font-black text-slate-900 mb-2">الملخص المالي</h3>

          <div className="flex justify-between text-xs text-slate-600">
            <span>المجموع الفرعي</span>
            <span className="font-bold">{order.total.toLocaleString()} ر.ي</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-600">
            <span>الخصم</span>
            <span className="font-bold">- 0 ر.ي</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>الشحن والتوصيل</span>
            <span className="font-bold">0 ر.ي (مجاني)</span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
            <span>الإجمالي النهائي</span>
            <span className="text-rose-700 text-base">{order.total.toLocaleString()} ر.ي</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900 font-medium mt-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              المبلغ المحجوز: YER {order.total.toFixed(2)} • المتاح للتاجر لا يطلق حتى انتهاء المراجعة واستلامك للطلب بنجاح.
            </span>
          </div>
        </div>

        {/* 5. Rating & Comments on Order (Matches Screenshot 10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>التقييمات والتعليقات على الطلب</span>
          </h3>

          <div className="text-xs text-slate-600 font-medium">
            قيم تجربتك مع المتجر ومندوب التوصيل:
          </div>

          <div className="flex items-center gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`rating-star-${star}`}
                type="button"
                onClick={() => setUserRating(star)}
                className="p-1 hover:scale-110 transition"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= userRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-100"
                  }`}
                />
              </button>
            ))}
            <span className="mr-2 text-sm font-black text-slate-800">
              {userRating} من 5
            </span>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب رأيك وتعليقك حول جودة وسرعة الطلب..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />

            <button
              type="submit"
              disabled={reviewSubmitted}
              className={`w-full py-2.5 rounded-xl text-xs font-black text-white transition shadow-xs ${
                reviewSubmitted
                  ? "bg-emerald-600"
                  : "bg-[#1E3A8A] hover:bg-blue-900 active:scale-98"
              }`}
            >
              {reviewSubmitted ? "تم إرسال التقييم والتعليق بنجاح ✓" : "إرسال التقييم والتعليق"}
            </button>
          </form>
        </div>
      </div>

      {/* Instant Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-4 shadow-2xl border border-slate-200 flex flex-col h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  ز
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">محادثة المتجر ومندوب التوصيل</div>
                  <div className="text-[10px] text-emerald-600 font-bold">متصل الآن • رد فوري</div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={`chat-msg-${msg.time}-${i}`}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs font-medium ${
                      msg.sender === "user"
                        ? "bg-[#1E3A8A] text-white rounded-tr-xs"
                        : "bg-slate-100 text-slate-800 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 px-1 mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-blue-900 shrink-0"
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
