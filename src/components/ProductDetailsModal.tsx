import React, { useEffect, useState } from 'react';
import { X, Heart, ShoppingBag, Star, ChevronLeft, Truck, ShieldCheck } from 'lucide-react';
import type { Product } from '../types';
import { formatCurrencyPrice } from '../utils/pricing';

interface ProductDetailsModalProps {
  product: Product | null;
  currency: 'YER' | 'SAR';
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onToggleWishlist: (productId: string) => void;
  onOpenTrendHashtag?: (hashtag: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  currency,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
  onOpenTrendHashtag,
  onShowToast,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) {
      setSelectedColor(undefined);
      setSelectedSize(undefined);
      setQuantity(1);
      return;
    }
    setSelectedColor(product.colors?.[0]?.name);
    setSelectedSize(product.sizes?.[0]);
    setQuantity(1);
  }, [product?.id]);

  if (!product) return null;

  const productPrice = typeof product.price === 'number'
    ? product.price
    : typeof product.discountPrice === 'number'
      ? product.discountPrice
      : typeof product.originalPrice === 'number'
        ? product.originalPrice
        : 0;
  const productOriginalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : productPrice;

  const getProductHashtag = (p: Product): string => {
    if (p.trendTag?.trim() && p.trendTag !== 'ترندات') {
      const t = p.trendTag.trim();
      return t.startsWith('#') ? t : `#${t.replace(/\s+/g, '_')}`;
    }
    if (p.trends?.length) {
      const t = String(p.trends[0]).trim();
      if (t && t !== 'ترندات') return t.startsWith('#') ? t : `#${t.replace(/\s+/g, '_')}`;
    }
    if (p.brand?.trim()) return `#${p.brand.replace(/🏪/g, '').replace(/عرض براند/g, '').trim().replace(/\s+/g, '_')}`;
    if (p.subCategory?.trim()) return `#${p.subCategory.trim().replace(/\s+/g, '_')}`;
    if (p.category === 'women') return '#أزياء_الموضة';
    if (p.category === 'men') return '#أناقة_صيفية';
    if (p.category === 'electronics') return '#موديلات_2026';
    if (p.category === 'accessories') return '#رائع_وأنيق';
    return '#ترندات_الموسم';
  };

  const trendTag = getProductHashtag(product);
  const handleTrendClick = () => {
    onClose();
    onOpenTrendHashtag?.(trendTag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">تفاصيل المنتج</span>
            <button type="button" onClick={handleTrendClick} className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] px-2 py-0.5 rounded-full border border-purple-200/80 text-[11px] font-bold cursor-pointer transition-all">
              <span className="bg-[#7C3AED] text-white text-[9px] font-bold px-1 rounded-xs">ترندات</span>
              <span>{trendTag}</span>
              <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
            {product.discount && product.discount > 0 && <span className="absolute top-3 right-3 bg-rose-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">خصم {product.discount}%</span>}
            <button onClick={() => onToggleWishlist(product.id)} className="absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-rose-500 transition-all shadow-md active:scale-90" aria-label="المفضلة"><Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} /></button>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{product.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl sm:text-2xl font-black text-purple-700">{formatCurrencyPrice(productPrice, currency)}</span>
              {productOriginalPrice > productPrice && <span className="text-sm text-slate-400 line-through">{formatCurrencyPrice(productOriginalPrice, currency)}</span>}
            </div>
            {product.rating && <div className="flex items-center gap-1 mt-2 text-xs text-slate-500"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{product.rating}{product.reviewsCount ? ` (${product.reviewsCount})` : ''}</div>}
          </div>

          {product.colors?.length ? <div><span className="text-xs font-bold text-slate-700 block mb-2">الألوان المتاحة:</span><div className="flex items-center gap-2 flex-wrap">{product.colors.map((c) => <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${selectedColor === c.name ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}><span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.colorCode || c.hex }} /><span>{c.name}</span></button>)}</div></div> : null}

          {product.sizes?.length ? <div><span className="text-xs font-bold text-slate-700 block mb-2">المقاس:</span><div className="flex items-center gap-2 flex-wrap">{product.sizes.map((s) => <button key={s} onClick={() => setSelectedSize(s)} className={`min-w-10 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${selectedSize === s ? 'border-purple-600 bg-purple-600 text-white shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>{s}</button>)}</div></div> : null}

          <div className="flex items-center justify-between pt-2"><span className="text-xs font-bold text-slate-700">الكمية:</span><div className="flex items-center gap-3 bg-slate-100 px-3 py-1 rounded-xl"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center shadow-xs">-</button><span className="font-extrabold text-sm text-slate-800 min-w-6 text-center">{quantity}</span><button onClick={() => setQuantity((value) => value + 1)} className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center shadow-xs">+</button></div></div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-slate-600 text-[11px] font-medium"><div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl"><Truck className="w-4 h-4 text-purple-600 shrink-0" /><span>توصيل سريع لكافة المحافظات</span></div><div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /><span>ضمان الجودة والدفع عند الاستلام</span></div></div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3"><button onClick={() => { onAddToCart(product, quantity, selectedColor, selectedSize); onClose(); onShowToast('تمت إضافة المنتج إلى السلة بنجاح ✨', 'success'); }} className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"><ShoppingBag className="w-5 h-5" /><span>إضافة إلى السلة ({formatCurrencyPrice(productPrice * quantity, currency)})</span></button></div>
      </div>
    </div>
  );
};
