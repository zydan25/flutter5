import React, { useEffect, useState } from 'react';
import { X, Trash2, ShoppingBag, Truck, CreditCard, ArrowRight } from 'lucide-react';
import type { CartItem, Order } from '../types';
import { ALL_GOVERNORATES } from '../data/governorates';
import { createFlaskOrder, getAccessToken, getFlaskPricing } from '../api';
import { formatCurrencyPrice } from '../utils/pricing';

interface CartModalProps { isOpen: boolean; cartItems: CartItem[]; currency: 'YER' | 'SAR'; onClose: () => void; onUpdateQuantity: (productId: string, quantity: number) => void; onRemoveItem: (productId: string) => void; onClearCart: () => void; onOrderPlaced: (order: Order) => void; onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void; }

export const CartModal: React.FC<CartModalProps> = ({ isOpen, cartItems, currency, onClose, onUpdateQuantity, onRemoveItem, onClearCart, onOrderPlaced, onShowToast }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [governorate, setGovernorate] = useState('أمانة العاصمة');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('cash_on_delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverPricing, setServerPricing] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isOpen) return;
    getFlaskPricing().then(setServerPricing).catch((error) => console.warn('Flask pricing preview failed:', error));
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = typeof item.price === 'number' ? item.price : (typeof item.product?.price === 'number' ? item.product.price : (typeof item.product?.discountPrice === 'number' ? item.product.discountPrice : 0));
    return sum + itemPrice * (item.quantity || 1);
  }, 0);

  const rate = serverPricing[governorate];
  const shippingFeeBase = Number(rate?.deliveryFee ?? 0);
  const shippingFee = currency === 'SAR' && Number(rate?.sarToYerRate) ? Math.round(shippingFeeBase / Number(rate.sarToYerRate)) : shippingFeeBase;
  const total = subtotal + (cartItems.length > 0 ? shippingFee : 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getAccessToken()) {
      onShowToast('سجل دخولك برقم الهاتف أولاً لإتمام الطلب', 'error');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      onShowToast('يرجى كتابة الاسم ورقم الهاتف لإتمام الطلب', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createFlaskOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        governorate,
        address: address.trim(),
        paymentMethod,
        currency,
        items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity, color: item.selectedColor, size: item.selectedSize })),
      });
      const order = result.order as Order;
      onOrderPlaced(order);
      onClearCart();
      onClose();
      onShowToast(`تم تأكيد طلبك بنجاح برقم ${order.orderNumber} 🎉`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast(err?.message || 'حدث خطأ أثناء حفظ الطلب على خادم Flask', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-purple-700" /><h2 className="font-extrabold text-slate-800 text-base">سلة التسوق</h2><span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">{cartItems.reduce((s, i) => s + i.quantity, 0)} أصناف</span></div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-3"><ShoppingBag className="w-8 h-8" /></div><h3 className="text-base font-bold text-slate-800">السلة فارغة حالياً</h3><p className="text-xs text-slate-500 mt-1">تصفح أقوى العروض وأضف ما يعجبك إلى السلة!</p></div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/80">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0"><h4 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h4><div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">{item.selectedColor && <span>اللون: {item.selectedColor}</span>}{item.selectedSize && <span>المقاس: {item.selectedSize}</span>}</div><span className="text-xs font-black text-purple-700 block mt-1">{formatCurrencyPrice((item.price || item.product?.price || 0) * (item.quantity || 1), currency)}</span></div>
                  <div className="flex flex-col items-end gap-2"><button onClick={() => onRemoveItem(item.product.id)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button><div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200"><button onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))} className="text-xs font-bold text-slate-600 w-4 h-4 flex items-center justify-center">-</button><span className="text-xs font-bold text-slate-800">{item.quantity}</span><button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="text-xs font-bold text-slate-600 w-4 h-4 flex items-center justify-center">+</button></div></div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">بيانات التوصيل والاستلام</h3>
                <input type="text" placeholder="الاسم الكامل *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-600" required />
                <input type="tel" placeholder="رقم الهاتف (واتساب) *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-600" required />
                <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-600">{ALL_GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}</select>
                <input type="text" placeholder="العنوان التفصيلي / الشارع / المعلم البارز" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-600" />
              </div>
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="space-y-1 text-xs text-slate-600"><div className="flex justify-between"><span>قيمة المنتجات:</span><span className="font-bold text-slate-800">{formatCurrencyPrice(subtotal, currency)}</span></div><div className="flex justify-between"><span>رسوم التوصيل من الخادم:</span><span className="font-bold text-slate-800">{formatCurrencyPrice(shippingFee, currency)}</span></div><div className="flex justify-between text-sm font-black text-purple-700 pt-1 border-t border-slate-200"><span>الإجمالي التقديري:</span><span>{formatCurrencyPrice(total, currency)}</span></div></div>
            <button onClick={handleCheckout} disabled={isSubmitting} className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"><ArrowRight className="w-4 h-4 ml-1" /><span>{isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب الآن'}</span></button>
          </div>
        )}
      </div>
    </div>
  );
};
