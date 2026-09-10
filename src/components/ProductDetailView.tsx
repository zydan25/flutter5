import React, { useState } from "react";
import {
  ArrowRight,
  Heart,
  Share2,
  ShoppingBag,
  Star,
  Copy,
  Check,
  Store,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  Info,
  MessageCircle,
  Phone
} from "lucide-react";
import { StoreProduct } from "../types";

interface Props {
  product: StoreProduct;
  onBack: () => void;
  onAddToCart: (product: StoreProduct, quantity: number) => void;
  onOpenStore: (storeName: string) => void;
  onBuyNow?: (product: StoreProduct, quantity: number) => void;
}

export const ProductDetailView: React.FC<Props> = ({
  product,
  onBack,
  onAddToCart,
  onOpenStore,
  onBuyNow,
}) => {
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("أحمر");
  const [selectedSize, setSelectedSize] = useState("M");
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);

  const images = [
    product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
  ];

  const colors = ["أحمر", "أخضر", "برتقالي"];
  const sizes = ["S", "XS", "M", "L"];

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.sku || "1234");
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto" dir="rtl">
      {/* Top App Bar matching Screenshot 3 & 14 */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-base font-black text-slate-900">تفاصيل المنتج</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "text-rose-600 fill-rose-600" : ""}`} />
          </button>
          <button
            onClick={() => alert("تم نسخ رابط مشاركة المنتج")}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
              1
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4 pb-28">
        {/* Gallery Slider with "الأكثر طلباً" and numbered indicators */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="relative aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden">
            <img
              src={images[selectedImgIndex]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-xs">
              الأكثر طلباً
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            {images.map((_, idx) => (
              <button
                key={`pdetail-img-${idx}`}
                onClick={() => setSelectedImgIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-black transition border ${
                  selectedImgIndex === idx
                    ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info & Pricing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="text-xs text-slate-400 font-medium">
            الرئيسية &gt; المنتجات والتصنيفات &gt; {product.brand || "Apple"}
          </div>

          <h1 className="text-lg font-black text-slate-900">{product.name}</h1>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="font-bold text-slate-700">{product.rating}</span>
            <span>(0 تقييم من العملاء)</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">متوفر في المخزون</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-2xl font-black text-rose-700 font-mono">
              {product.price.toLocaleString()} ر.ي
            </span>
            {product.salePrice && (
              <span className="text-sm text-slate-400 line-through font-mono">
                {product.salePrice.toLocaleString()} ر.ي
              </span>
            )}
            <span className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black px-2.5 py-0.5 rounded-lg">
              وفر 5%
            </span>
          </div>

          {/* SKU / رقم الصنف with copy button */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              رقم الصنف: {product.sku || "1234"}
            </span>
            <button
              onClick={handleCopySku}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
            >
              {copiedSku ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>اضغط لنسخ رقم الصنف</span>
                </>
              )}
            </button>
          </div>

          {/* Colors Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="text-xs font-black text-slate-800">
              الألوان المتاحة : ({selectedColor})
            </div>
            <div className="flex gap-2">
              {colors.map((c, idx) => (
                <button
                  key={`pdetail-color-${c}-${idx}`}
                  onClick={() => setSelectedColor(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    selectedColor === c
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="text-xs font-black text-slate-800">
              المقاسات والخيارات المتاحة :
            </div>
            <div className="flex gap-2">
              {sizes.map((s, idx) => (
                <button
                  key={`pdetail-size-${s}-${idx}`}
                  onClick={() => setSelectedSize(s)}
                  className={`w-9 h-9 rounded-lg text-xs font-black transition border flex items-center justify-center ${
                    selectedSize === s
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warranty & Return Policy Card matching Screenshot 4 & 14 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>الضمان وسياسة الاستبدال :</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            ضمان فحص واستلام • مدة الضمان: ضمان فحص واستبدال معتمد • استبدال فوري أو استرجاع خلال 7 أيام في حال وجود أي عيب مصنعي.
          </p>
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="text-sm font-black text-slate-900">
            وصف المنتج والمواصفات :
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {product.description ||
              "منتج أصلي معتمد متوفر من زيزو بضمان وجودة عالية وتوصيل سريع ومناسب لجميع المناسبات."}
          </p>
        </div>

        {/* Technical Specifications Table matching Screenshot 4 & 14 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
          <div className="text-sm font-black text-slate-900 mb-2">
            المواصفات الفنية المعتمدة للقسم :
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">الماركة</span>
              <span className="font-bold text-slate-800">{product.brand || "Apple"}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">الخامة</span>
              <span className="font-bold text-slate-800">جلد</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">حالة المنتج</span>
              <span className="font-bold text-slate-800">جديد</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">الضمان</span>
              <span className="font-bold text-slate-800">لا</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">custom_category_name</span>
              <span className="font-bold text-slate-800">رجالي</span>
            </div>
          </div>
        </div>

        {/* Vendor Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">
                {product.storeName} - تاجر معتمد في سوق بلس
              </div>
              <div className="text-[11px] text-slate-500">تقييم 4.8 ★ من العملاء</div>
            </div>
          </div>

          <button
            onClick={() => onOpenStore(product.storeName)}
            className="px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-white text-xs font-black hover:bg-blue-900 transition"
          >
            زيارة المتجر
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3 shadow-lg z-30 flex items-center gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-200 rounded-xl px-2 py-1 bg-slate-50">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-rose-600"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center text-xs font-black text-slate-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-emerald-600"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => {
            onAddToCart(product, quantity);
            alert(`تمت إضافة ${quantity} من ${product.name} إلى السلة!`);
          }}
          className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>أضف للسلة</span>
        </button>

        {/* Buy Now */}
        <button
          onClick={() => {
            if (onBuyNow) {
              onBuyNow(product, quantity);
            } else {
              onAddToCart(product, quantity);
              alert("جاري الانتقال للدفع المباشر...");
            }
          }}
          className="flex-1 py-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-black shadow-xs transition"
        >
          شراء الآن
        </button>
      </div>
    </div>
  );
};
