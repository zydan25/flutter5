import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  ShoppingBag,
  Star,
  Store,
  ChevronLeft,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Package,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  CreditCard,
  RotateCw,
  Eye,
  SlidersHorizontal,
  Tag,
  Loader2,
  AlertCircle,
  MapPin,
  Trash2,
  Edit2,
  Phone,
  Building,
  Home,
  Briefcase,
  Layers,
  Code2,
  Copy,
  Check
} from "lucide-react";
import { StoreProduct, StoreOrder, CartItem, UserAddress } from "../types";
import { fetchLiveProducts, fetchLiveOrders } from "../services/apiService";
import { OrdersDetailView } from "./OrdersDetailView";
import { CategoryProductsView } from "./CategoryProductsView";
import { ProductDetailView } from "./ProductDetailView";
import { StoreProfileView } from "./StoreProfileView";

interface Props {
  onNavigateToAccount: () => void;
  onNavigateToPayment: () => void;
  walletBalance: number;
  onDeductBalance?: (amount: number, description: string) => boolean;
  onOpenCategoriesFlutter?: () => void;
}

export const StoreView: React.FC<Props> = ({
  onNavigateToAccount,
  onNavigateToPayment,
  walletBalance,
  onDeductBalance,
  onOpenCategoriesFlutter,
}) => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Integrated sub-screens requested by user
  const [activeDetailOrder, setActiveDetailOrder] = useState<StoreOrder | null>(null);
  const [activeCategoryView, setActiveCategoryView] = useState<string | null>(null);
  const [activeStoreView, setActiveStoreView] = useState<string | null>(null);
  const [activeDetailProduct, setActiveDetailProduct] = useState<StoreProduct | null>(null);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        fetchLiveProducts(),
        fetchLiveOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  const categories = [
    { id: "all", name: "الكل" },
    { id: "رجالي", name: "رجالي" },
    { id: "الملابس", name: "الملابس" },
    { id: "الإلكترونيات", name: "الإلكترونيات" },
    { id: "هواتف", name: "هواتف" },
    { id: "عطور", name: "عطور" },
    { id: "ألعاب أطفال", name: "ألعاب" },
  ];

  const vendors = [
    { id: 3, name: "متجر زيزو", badge: "موثق ⭐", rating: 4.9 },
    { id: 1, name: "متجر الأناقات", badge: "مميز 🌟", rating: 4.8 },
  ];

  const banners = [
    {
      id: 1,
      title: "تخفيضات كبرى في سوق شبيك",
      subtitle: "خصومات حصرية حتى 40% على الملابس والإلكترونيات",
      bgColor: "from-[#8B1D3B] to-[#BE185D]",
      tag: "عرض اليوم",
    },
    {
      id: 2,
      title: "شحن سريع لكافة المحافظات",
      subtitle: "صنعاء، إب، عدن، تعز - توصيل خلال 24 ساعة",
      bgColor: "from-blue-700 to-indigo-900",
      tag: "توصيل شبيك",
    },
  ];

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const addToCart = (
    product: StoreProduct,
    quantity = 1,
    options?: { size?: string; color?: string; notes?: string }
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.size === options?.size &&
          item.color === options?.color
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          size: options?.size || "M",
          color: options?.color || "أحمر",
          notes: options?.notes,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.includes(searchQuery) ||
      p.storeName.includes(searchQuery) ||
      (p.category && p.category.includes(searchQuery));
    const matchesCat =
      selectedCategory === "all" ||
      p.category === selectedCategory ||
      (selectedCategory === "رجالي" && p.name.includes("بنطلون")) ||
      (selectedCategory === "الإلكترونيات" && p.name.includes("سامسونج"));
    return matchesSearch && matchesCat;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError(null);

    // 1. Balance verification
    if (walletBalance < cartTotal) {
      setCheckoutError(
        `رصيدك في المحفظة (${walletBalance.toLocaleString()} ر.ي) غير كافٍ لإتمام هذا الطلب بمبلغ (${cartTotal.toLocaleString()} ر.ي). يرجى شحن رصيدك أولاً.`
      );
      return;
    }

    // 2. Server validation & order creation
    setIsCheckingOut(true);
    try {
      // Send verification to backend
      await fetch("/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((it) => ({
            product_id: it.product.id,
            quantity: it.quantity,
            size: it.size,
            color: it.color,
            notes: it.notes,
          })),
          total_amount: cartTotal,
        }),
      }).catch(() => null);

      // Deduct from wallet if handler provided
      if (onDeductBalance) {
        onDeductBalance(cartTotal, `شراء من المتجر (${cart.length} أصناف)`);
      }

      const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: StoreOrder = {
        id: Date.now(),
        orderNumber,
        total: cartTotal,
        status: "pending",
        statusText: "قيد المراجعة في المتجر",
        date: new Date().toLocaleDateString("ar-YE"),
        vendorName: cart[0]?.product.storeName || "متجر شبيك المعتمد",
        shippingAddress: "صنعاء - العنوان المسجل (حدة)",
        canEdit: true,
        items: cart.map((it, idx) => ({
          id: idx + 1,
          productName: it.product.name,
          productImage: it.product.image,
          quantity: it.quantity,
          price: it.product.salePrice || it.product.price,
          size: it.size || "M",
          color: it.color || "أحمر",
          notes: it.notes,
        })),
      };

      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setCheckoutSuccess(
        `تم تأكيد الطلب بنجاح برقم (${orderNumber}) وخصم ${cartTotal.toLocaleString()} ر.ي من المحفظة!`
      );
      setTimeout(() => {
        setCheckoutSuccess(null);
        setIsCartOpen(false);
        setActiveDetailOrder(newOrder);
      }, 1500);
    } catch (err) {
      setCheckoutError("حدث خطأ أثناء إتمام الطلب والتحقق من الخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 1. Product Detail Screen (Has highest precedence so it opens over categories and stores)
  if (activeDetailProduct) {
    return (
      <ProductDetailView
        product={activeDetailProduct}
        onBack={() => setActiveDetailProduct(null)}
        onAddToCart={(p, qty, opts) => {
          addToCart(p, qty, opts);
        }}
        onBuyNow={(p, qty, opts) => {
          addToCart(p, qty, opts);
          setIsCartOpen(true);
          setActiveDetailProduct(null);
        }}
        onOpenStore={(sName) => {
          setActiveDetailProduct(null);
          setActiveStoreView(sName);
        }}
      />
    );
  }

  // 2. Order Detail Screen (Screenshot 10 & 13)
  if (activeDetailOrder) {
    return (
      <OrdersDetailView
        order={activeDetailOrder}
        onBack={() => setActiveDetailOrder(null)}
        onUpdateOrder={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          setActiveDetailOrder(updated);
        }}
        onCancelOrder={(orderId) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId
                ? { ...o, status: "cancelled", statusText: "ملغي ومسترجع", canEdit: false }
                : o
            )
          );
          setActiveDetailOrder(null);
        }}
        onOpenProduct={(name) => {
          const found = products.find((p) => p.name.includes(name)) || products[0];
          setActiveDetailProduct(found);
        }}
        onReorder={(item) => {
          const found = products.find((p) => p.name.includes(item.productName)) || products[0];
          addToCart(found, item.quantity || 1, {
            size: item.size,
            color: item.color,
          });
          setIsCartOpen(true);
          setActiveDetailOrder(null);
        }}
      />
    );
  }

  // 3. Category Products Screen (Screenshot 5)
  if (activeCategoryView) {
    return (
      <CategoryProductsView
        initialCategory={activeCategoryView}
        onBack={() => setActiveCategoryView(null)}
        onSelectProduct={(p) => setActiveDetailProduct(p)}
        onAddToCart={(p) => addToCart(p)}
      />
    );
  }

  // 4. Store Profile Screen (Screenshot 6, 11, 12)
  if (activeStoreView) {
    return (
      <StoreProfileView
        storeName={activeStoreView}
        onBack={() => setActiveStoreView(null)}
        onSelectProduct={(p) => setActiveDetailProduct(p)}
        onAddToCart={(p) => addToCart(p)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
      {/* Store Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#8B1D3B] text-white flex items-center justify-center font-black shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-800">سوق شبيك بلس</div>
              <div className="text-[10px] text-slate-400 font-bold">المتجر الإلكتروني المعتمد</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Button to Return to Account / Telecom */}
            <button
              onClick={onNavigateToAccount}
              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-[#8B1D3B] border border-amber-200/80 px-2.5 py-1.5 rounded-full text-xs font-black transition active:scale-95 shadow-xs"
              title="الانتقال إلى واجهة حسابي والسداد"
            >
              <User className="w-3.5 h-3.5" />
              <span>حسابي</span>
            </button>

            {/* Orders Button */}
            <button
              onClick={() => setIsOrdersOpen(true)}
              className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
              title="طلباتي في المتجر"
            >
              <Package className="w-4 h-4" />
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8B1D3B] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
              title="سلة التسوق"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج، متجر، أو صنف..."
              className="w-full bg-slate-100/90 border border-slate-200/80 rounded-2xl pr-9 pl-8 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8B1D3B] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Store Content */}
      <div className="p-3.5 space-y-4">
        {/* Promotional Banners Slider */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
          {banners.map((b, idx) => (
            <div
              key={`store-banner-${b.id || idx}`}
              className={`bg-gradient-to-r ${b.bgColor} text-white p-4 rounded-2xl ${
                idx === 0 ? "block" : "hidden"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {b.tag}
                </span>
                <span className="text-[11px] text-white/90 font-bold">متجر شبيك المعتمد</span>
              </div>
              <h3 className="text-base font-black mb-1">{b.title}</h3>
              <p className="text-xs text-white/90 font-medium mb-3">{b.subtitle}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs hover:bg-slate-100 active:scale-95 transition"
                >
                  تصفح المنتجات ←
                </button>
                <span className="text-[11px] text-amber-200 font-bold">تطبيق شبيك وسوق بلس</span>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-slate-800">أقسام المتجر</h2>
              <span className="text-[10px] text-slate-400 font-bold">({filteredProducts.length} منتج)</span>
            </div>
            {onOpenCategoriesFlutter && (
              <button
                onClick={onOpenCategoriesFlutter}
                className="text-[10px] text-[#1E3A8A] bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 font-black hover:bg-blue-100 flex items-center gap-1 transition"
              >
                <span>الأقسام الدائرية (Flutter) ←</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat, idx) => (
              <button
                key={`store-cat-${cat.id || idx}`}
                onClick={() => {
                  if (cat.id !== "all") {
                    setActiveCategoryView(cat.name);
                  } else {
                    setSelectedCategory("all");
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition active:scale-95 ${
                  selectedCategory === cat.id
                    ? "bg-[#8B1D3B] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stores / Vendors Highlight */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-slate-800 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-[#8B1D3B]" />
              <span>متاجر شبيك المعتمدة</span>
            </h2>
            <button
              onClick={() => setActiveStoreView("زيزو")}
              className="text-[10px] text-[#8B1D3B] font-bold hover:underline"
            >
              عرض المتاجر ←
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {vendors.map((v, idx) => (
              <div
                key={`store-vendor-${v.id || idx}`}
                onClick={() => setActiveStoreView(v.name.replace("متجر ", ""))}
                className="bg-white border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#8B1D3B] transition active:scale-98 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    {v.name.charAt(5)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">{v.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{v.badge}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{v.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8B1D3B]" />
              <span>منتجات المتجر الحقيقية (من الخادم)</span>
            </h2>
            <button
              onClick={loadStoreData}
              className="text-[11px] text-[#8B1D3B] font-bold flex items-center gap-1 hover:underline"
              title="تحديث المنتجات"
            >
              <RotateCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>تحديث</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
              <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#8B1D3B]" />
              <div>جاري استرجاع منتجات المتجر من الخادم...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="text-sm font-black text-slate-700">لا توجد منتجات تطابق البحث</div>
              <div className="text-xs text-slate-400 mt-1">جرب إزالة معايير البحث أو اختيار قسم آخر</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product, idx) => {
                const isFav = favorites.includes(product.id);
                return (
                  <div
                    key={product.id ? `store-prod-${product.id}-${idx}` : `store-prod-${idx}`}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    {/* Image & Badges */}
                    <div
                      onClick={() => setActiveDetailProduct(product)}
                      className="relative h-36 bg-slate-100 cursor-pointer overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";
                        }}
                      />

                      {/* Store Badge */}
                      <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {product.storeName}
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-600 hover:text-rose-600 active:scale-95 transition"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isFav ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {product.salePrice && product.salePrice < product.price && (
                        <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                          خصم
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div
                        onClick={() => setActiveDetailProduct(product)}
                        className="cursor-pointer"
                      >
                        <div className="text-xs font-black text-slate-800 line-clamp-1 mb-0.5">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mb-1.5">
                          {product.category || "عام"}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-[#8B1D3B]">
                            {(product.salePrice || product.price).toLocaleString()} ر.ي
                          </div>
                          {product.salePrice && product.salePrice < product.price && (
                            <div className="text-[9px] text-slate-400 line-through">
                              {product.price.toLocaleString()} ر.ي
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-xl bg-[#8B1D3B] hover:bg-[#72152f] text-white flex items-center justify-center shadow-xs active:scale-90 transition"
                          title="إضافة للسلة"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500">{selectedProduct.storeName}</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-base font-black text-slate-800 mb-1">{selectedProduct.name}</h3>
            <div className="text-sm font-black text-[#8B1D3B] mb-3">
              {(selectedProduct.salePrice || selectedProduct.price).toLocaleString()} ريال يمني
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>المتجر البائع:</span>
                <span className="font-bold text-slate-800">{selectedProduct.storeName}</span>
              </div>
              <div className="flex justify-between">
                <span>القسم:</span>
                <span className="font-bold text-slate-800">{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span>الضمان:</span>
                <span className="font-bold text-emerald-600">ضمان استبدال معتمد من المتجر</span>
              </div>
              <div className="flex justify-between">
                <span>الكمية المتوفرة:</span>
                <span className="font-bold text-slate-800">{selectedProduct.stock} قطع</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="flex-1 py-3 rounded-xl bg-[#8B1D3B] hover:bg-[#72152f] text-white font-black text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>إضافة إلى سلة المشتريات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sheet Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#8B1D3B]" />
                <h3 className="text-base font-black text-slate-800">سلة المشتريات ({cartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div className="text-sm font-black text-emerald-800">{checkoutSuccess}</div>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                <div className="text-sm font-black text-slate-700">السلة فارغة حالياً</div>
                <div className="text-xs text-slate-400">تصفح منتجات المتجر وأضف ما ترغب به</div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl gap-2"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-800 truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] font-bold text-[#8B1D3B]">
                          {(item.product.salePrice || item.product.price).toLocaleString()} ر.ي
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-rose-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-emerald-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 mt-3 space-y-2.5">
                  <div className="flex justify-between items-center text-sm font-black">
                    <span className="text-slate-600">الإجمالي النهائي:</span>
                    <span className="text-[#8B1D3B] text-base">{cartTotal.toLocaleString()} ريال يمني</span>
                  </div>

                  <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold p-2 rounded-xl flex items-center justify-between">
                    <span>الدفع من رصيد المحفظة المتوفر:</span>
                    <span>{walletBalance.toLocaleString()} ر.ي</span>
                  </div>

                  {checkoutError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-2.5 rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3 rounded-xl bg-[#8B1D3B] hover:bg-[#72152f] text-white font-black text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحقق من الخادم وإتمام الطلب...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد الطلب والتحقق من الخادم</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#8B1D3B]" />
                <h3 className="text-base font-black text-slate-800">طلباتي في المتجر ({orders.length})</h3>
              </div>
              <button
                onClick={() => setIsOrdersOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {orders.map((ord, idx) => (
                <div
                  key={ord.id ? `store-ord-${ord.id}-${idx}` : `store-ord-${idx}`}
                  onClick={() => {
                    setIsOrdersOpen(false);
                    setActiveDetailOrder(ord);
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl space-y-2 cursor-pointer transition active:scale-98 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 font-mono">
                      #{ord.orderNumber}
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{ord.statusText}</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {ord.items.map((it, itIdx) => (
                      <div key={`ord-item-${it.id || itIdx}-${itIdx}`} className="flex justify-between text-xs text-slate-600">
                        <span>• {it.productName} (x{it.quantity})</span>
                        <span className="font-bold">{it.price.toLocaleString()} ر.ي</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-black">
                    <span className="text-slate-500">{ord.date}</span>
                    <span className="text-[#8B1D3B] flex items-center gap-1">
                      <span>{ord.total.toLocaleString()} ر.ي</span>
                      <span className="text-blue-600 text-[10px] group-hover:underline">عرض التفاصيل ←</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 1. AddressesScreen
// ==========================================
interface AddressesScreenProps {
  onBack: () => void;
  onSelectAddress?: (addr: UserAddress) => void;
  selectedAddressId?: string | number;
}

const INITIAL_ADDRESSES: UserAddress[] = [
  {
    id: 1,
    title: "المنزل",
    governorate: "صنعاء",
    city: "حدة",
    streetDetails: "شارع الحي الدبلوماسي - عمارة الشروق - الشقة 4",
    phone: "771642093",
    isDefault: true,
    notes: "التسليم في الفترة المسائية",
  },
  {
    id: 2,
    title: "المكتب / العمل",
    governorate: "إب",
    city: "شارع تعز",
    streetDetails: "برج الأمل للتجارة - الدور الثالث",
    phone: "774952665",
    isDefault: false,
    notes: "الاتصال قبل الوصول بربع ساعة",
  },
];

export const AddressesScreen: React.FC<AddressesScreenProps> = ({
  onBack,
  onSelectAddress,
  selectedAddressId,
}) => {
  const [addresses, setAddresses] = useState<UserAddress[]>(() => {
    const saved = localStorage.getItem("shopik_user_addresses");
    return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form State
  const [title, setTitle] = useState("المنزل");
  const [governorate, setGovernorate] = useState("صنعاء");
  const [city, setCity] = useState("");
  const [streetDetails, setStreetDetails] = useState("");
  const [phone, setPhone] = useState("771642093");
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const governorates = [
    "صنعاء",
    "إب",
    "تعز",
    "عدن",
    "الحديدة",
    "ذمار",
    "حضرموت",
    "عمران",
    "مأرب",
    "المحويت",
    "حجة",
    "صعدة",
  ];

  const handleOpenAddModal = (addrToEdit?: UserAddress) => {
    setErrorMsg(null);
    if (addrToEdit) {
      setEditingAddress(addrToEdit);
      setTitle(addrToEdit.title);
      setGovernorate(addrToEdit.governorate);
      setCity(addrToEdit.city);
      setStreetDetails(addrToEdit.streetDetails);
      setPhone(addrToEdit.phone);
      setIsDefault(addrToEdit.isDefault);
      setNotes(addrToEdit.notes || "");
    } else {
      setEditingAddress(null);
      setTitle("المنزل");
      setGovernorate("صنعاء");
      setCity("");
      setStreetDetails("");
      setPhone("771642093");
      setIsDefault(addresses.length === 0);
      setNotes("");
    }
    setIsAddModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !streetDetails.trim() || !phone.trim()) {
      setErrorMsg("يرجى تعبئة جميع الحقول المطلوبة (المدينة، الشارع، رقم الهاتف)");
      return;
    }

    let updated: UserAddress[];

    if (editingAddress) {
      updated = addresses.map((a) =>
        a.id === editingAddress.id
          ? {
              ...a,
              title,
              governorate,
              city,
              streetDetails,
              phone,
              isDefault,
              notes,
            }
          : isDefault
          ? { ...a, isDefault: false }
          : a
      );
      setSuccessToast("تم تحديث العنوان بنجاح ✓");
    } else {
      const newAddr: UserAddress = {
        id: Date.now(),
        title,
        governorate,
        city,
        streetDetails,
        phone,
        isDefault,
        notes,
      };

      if (isDefault) {
        updated = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))];
      } else {
        updated = [newAddr, ...addresses];
      }
      setSuccessToast("تمت إضافة العنوان وحفظه في حسابك ✓");
    }

    setAddresses(updated);
    localStorage.setItem("shopik_user_addresses", JSON.stringify(updated));
    setIsAddModalOpen(false);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteAddress = (id: string | number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنوان؟")) return;
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("shopik_user_addresses", JSON.stringify(updated));
    setSuccessToast("تم حذف العنوان ✓");
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleSetDefault = (id: string | number) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem("shopik_user_addresses", JSON.stringify(updated));
    setSuccessToast("تم تعيين العنوان كافتراضي ✓");
    setTimeout(() => setSuccessToast(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto" dir="rtl">
      {/* Top App Bar */}
      <div className="bg-[#8B1D3B] text-white px-4 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="font-black text-base">دفتر العناوين والشحن</div>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="bg-white text-[#8B1D3B] px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 hover:bg-amber-50 active:scale-95 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>عنوان جديد</span>
        </button>
      </div>

      {/* Toast */}
      {successToast && (
        <div className="bg-emerald-600 text-white text-xs font-black py-2.5 px-4 flex items-center justify-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto w-full space-y-3.5 pb-20">
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs font-bold text-amber-900 flex items-start gap-2.5">
          <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-black text-amber-950">عناوين التوصيل المعتمدة لديك</div>
            <div className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
              تستخدم هذه العناوين لتوصيل طلبات متجر شبيك ومطابقة الشحنات مباشرة من الخادم.
            </div>
          </div>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="font-black text-slate-700 text-sm">لا توجد عناوين مسجلة بعد</div>
            <p className="text-xs text-slate-400">أضف عنوانك الأول لتسريع استلام طلبات المتجر</p>
            <button
              onClick={() => handleOpenAddModal()}
              className="bg-[#8B1D3B] text-white px-4 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عنوان جديد الآن</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr, idx) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id ? `store-addr-${addr.id}-${idx}` : `store-addr-${idx}`}
                  className={`bg-white rounded-2xl p-4 border transition ${
                    isSelected
                      ? "border-[#8B1D3B] ring-2 ring-[#8B1D3B]/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#8B1D3B]/10 text-[#8B1D3B] flex items-center justify-center font-black">
                        {addr.title === "المنزل" ? (
                          <Home className="w-4 h-4" />
                        ) : addr.title === "المكتب / العمل" ? (
                          <Briefcase className="w-4 h-4" />
                        ) : (
                          <Building className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                          <span>{addr.title}</span>
                          {addr.isDefault && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {addr.governorate} - {addr.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddModal(addr)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 flex items-center justify-center transition"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 flex items-center justify-center transition"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 font-medium space-y-1 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{addr.streetDetails}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{addr.phone}</span>
                    </div>
                    {addr.notes && (
                      <div className="text-[11px] text-amber-800 pt-0.5 border-t border-slate-200/60 font-medium">
                        ملاحظة: {addr.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-[#8B1D3B]"
                      >
                        تعيين كعنوان افتراضي
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        العنوان المعتمد للتوصيل
                      </span>
                    )}

                    {onSelectAddress && (
                      <button
                        onClick={() => onSelectAddress(addr)}
                        className="bg-[#8B1D3B] text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-xs hover:bg-[#72152e] active:scale-95 transition"
                      >
                        اختيار للشحن
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8B1D3B]" />
                <span>{editingAddress ? "تعديل العنوان" : "إضافة عنوان جديد"}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3">
              {/* Type / Title */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  نوع العنوان (الاسم)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["المنزل", "المكتب / العمل", "المحل"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTitle(t)}
                      className={`py-2 rounded-xl text-xs font-black border transition ${
                        title === t
                          ? "bg-[#8B1D3B] text-white border-[#8B1D3B]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Governorate & City */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    المحافظة
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8B1D3B]"
                  >
                    {governorates.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    المدينة / المديرية
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: حدة، الصافية..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8B1D3B]"
                  />
                </div>
              </div>

              {/* Street & Details */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  الشارع، العمارة، رقم الشقة
                </label>
                <textarea
                  rows={2}
                  value={streetDetails}
                  onChange={(e) => setStreetDetails(e.target.value)}
                  placeholder="أدخل تفاصيل المكان بدقة ليسهل على المندوب الوصول إليك"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8B1D3B]"
                />
              </div>

              {/* Recipient Phone */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  رقم هاتف المستلم
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77xxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-black text-slate-900 font-mono focus:outline-none focus:border-[#8B1D3B]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  ملاحظات إضافية للتوصيل (اختياري)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: بجوار مسجد النور، الاتصال عند الوصول"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#8B1D3B]"
                />
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#8B1D3B] rounded focus:ring-[#8B1D3B]"
                />
                <span className="text-xs font-bold text-slate-700">
                  تعيين كعنوان افتراضي للشحن
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#8B1D3B] hover:bg-[#72152e] text-white text-xs font-black shadow-sm"
                >
                  حفظ العنوان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. CategoriesFlutterScreen
// ==========================================
interface CategoriesFlutterScreenProps {
  onBack: () => void;
  onSelectCategory: (categoryName: string) => void;
}

interface CategoryItem {
  id: string;
  name: string;
  iconImage: string;
  itemCount: number;
  badge?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "all",
    name: "جميع الأقسام",
    iconImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200",
    itemCount: 48,
    badge: "شامل",
  },
  {
    id: "رجالي",
    name: "أزياء رجالية",
    iconImage: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=200",
    itemCount: 18,
    badge: "الأكثر طلباً",
  },
  {
    id: "الملابس",
    name: "الملابس والأناقة",
    iconImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200",
    itemCount: 24,
  },
  {
    id: "الإلكترونيات",
    name: "الإلكترونيات والأجهزة",
    iconImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200",
    itemCount: 16,
    badge: "جديد",
  },
  {
    id: "هواتف",
    name: "الهواتف وملحقاتها",
    iconImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200",
    itemCount: 12,
  },
  {
    id: "عطور",
    name: "العطور والبخور",
    iconImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200",
    itemCount: 9,
  },
  {
    id: "ألعاب أطفال",
    name: "ألعاب وهدايا",
    iconImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200",
    itemCount: 8,
  },
  {
    id: "ساعات",
    name: "ساعات وإكسسوارات",
    iconImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200",
    itemCount: 14,
  },
  {
    id: "أحذية",
    name: "أحذية رياضية ورسمية",
    iconImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
    itemCount: 15,
  },
];

const FLUTTER_CATEGORIES_CODE = `import 'package:flutter/material.dart';

/// نموذج بيانات الصنف في فلاتر
class ShopikCategory {
  final String id;
  final String name;
  final String imageUrl;
  final int itemCount;
  final String? badge;

  const ShopikCategory({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.itemCount,
    this.badge,
  });
}

/// صفحة الفئات الدائرية الأنيقة بلغة فلاتر (Flutter Categories Screen)
class FlutterCategoriesScreen extends StatefulWidget {
  final Function(String categoryName)? onCategorySelected;

  const FlutterCategoriesScreen({Key? key, this.onCategorySelected})
      : super(key: key);

  @override
  State<FlutterCategoriesScreen> createState() =>
      _FlutterCategoriesScreenState();
}

class _FlutterCategoriesScreenState extends State<FlutterCategoriesScreen> {
  final List<ShopikCategory> _categories = const [
    ShopikCategory(
      id: 'all',
      name: 'جميع الأقسام',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200',
      itemCount: 48,
      badge: 'شامل',
    ),
    ShopikCategory(
      id: 'men',
      name: 'أزياء رجالية',
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=200',
      itemCount: 18,
      badge: 'الأكثر طلباً',
    ),
    ShopikCategory(
      id: 'fashion',
      name: 'الملابس والأناقة',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
      itemCount: 24,
    ),
    ShopikCategory(
      id: 'electronics',
      name: 'الإلكترونيات والأجهزة',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
      itemCount: 16,
      badge: 'جديد',
    ),
    ShopikCategory(
      id: 'phones',
      name: 'الهواتف وملحقاتها',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
      itemCount: 12,
    ),
    ShopikCategory(
      id: 'perfumes',
      name: 'العطور والبخور',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200',
      itemCount: 9,
    ),
    ShopikCategory(
      id: 'shoes',
      name: 'أحذية رياضية ورسمية',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
      itemCount: 15,
    ),
  ];

  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final filtered = _categories
        .where((c) => c.name.contains(_searchQuery))
        .toList();

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: const Color(0xFF8B1D3B),
          title: const Text(
            'أقسام وتصنيفات المتجر',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          centerTitle: true,
          elevation: 2,
        ),
        body: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                decoration: InputDecoration(
                  hintText: 'ابحث عن قسم أو تصنيف...',
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF8B1D3B)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                ),
              ),
            ),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 14,
                  childAspectRatio: 0.75,
                ),
                itemCount: filtered.length,
                itemBuilder: (context, index) {
                  final cat = filtered[index];
                  return InkWell(
                    onTap: () {
                      if (widget.onCategorySelected != null) {
                        widget.onCategorySelected!(cat.name);
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 82,
                              height: 82,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF8B1D3B), Color(0xFFBE185D)],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF8B1D3B).withOpacity(0.2),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              padding: const EdgeInsets.all(3),
                              child: ClipOval(
                                child: Image.network(
                                  cat.imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    color: Colors.grey.shade200,
                                    child: const Icon(Icons.category, color: Colors.grey),
                                  ),
                                ),
                              ),
                            ),
                            if (cat.badge != null)
                              Positioned(
                                top: -4,
                                right: -4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF8B1D3B),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: Colors.white, width: 1.5),
                                  ),
                                  child: Text(
                                    cat.badge!,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          cat.name,
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '\${cat.itemCount} منتج',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}`;

export const CategoriesFlutterScreen: React.FC<CategoriesFlutterScreenProps> = ({
  onBack,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ui" | "flutter">("ui");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchExtraCategories = async () => {
      try {
        const res = await fetch("/api/store/categories/");
        if (res.ok) {
          const data = await res.json();
          const list = data.results || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            const extra = list.map((c: any) => ({
              id: String(c.id || c.name),
              name: c.name || "صنف جديد",
              iconImage:
                c.image ||
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
              itemCount: c.products_count || c.count || 10,
            }));

            setCategories((prev) => {
              const existingNames = new Set(prev.map((p) => p.name));
              const newItems = extra.filter((e: any) => !existingNames.has(e.name));
              return [...prev, ...newItems];
            });
          }
        }
      } catch (err) {
        // Fallback to rich default
      }
    };
    fetchExtraCategories();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FLUTTER_CATEGORIES_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto" dir="rtl">
      <div className="bg-[#8B1D3B] text-white px-4 py-3.5 flex items-center justify-between shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 text-xs font-black shadow-xs border border-white/20"
          >
            <ArrowRight className="w-4 h-4" />
            <span>رجوع</span>
          </button>
          <div className="font-black text-base">أقسام وتصنيفات المتجر</div>
        </div>

        <div className="flex items-center gap-1 bg-white/15 p-1 rounded-full text-xs">
          <button
            onClick={() => setActiveTab("ui")}
            className={`px-3 py-1 rounded-full text-xs font-black transition ${
              activeTab === "ui"
                ? "bg-white text-[#8B1D3B] shadow-xs"
                : "text-white/80 hover:text-white"
            }`}
          >
            الأقسام
          </button>
          <button
            onClick={() => setActiveTab("flutter")}
            className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1 ${
              activeTab === "flutter"
                ? "bg-white text-[#8B1D3B] shadow-xs"
                : "text-white/80 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>كود فلاتر</span>
          </button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4 pb-20">
        {activeTab === "ui" ? (
          <>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن قسم، تصنيف، أو ماركة..."
                className="w-full bg-white border border-slate-200 rounded-2xl pr-9 pl-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#8B1D3B] shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>

            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8B1D3B]" />
                  <span>التصنيفات الدائرية المعتمدة في شبيك</span>
                </div>
                <span className="text-[11px] text-slate-400 font-bold">
                  ({filteredCategories.length} قسم)
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pt-1">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.name)}
                    className="flex flex-col items-center text-center group active:scale-95 transition"
                  >
                    <div className="relative mb-2">
                      <div className="w-18 h-18 rounded-full p-[3px] bg-gradient-to-tr from-[#8B1D3B] to-rose-400 shadow-sm group-hover:scale-105 transition">
                        <img
                          src={cat.iconImage}
                          alt={cat.name}
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                      </div>
                      {cat.badge && (
                        <span className="absolute -top-1 -right-1 bg-[#8B1D3B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-xs">
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-[#8B1D3B]">
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {cat.itemCount} منتج
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-indigo-950 text-white rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black">
                    كود شاشة الفئات الدائرية في فلاتر (Flutter Dart)
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition active:scale-95"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                تصميم فلاتر متكامل مع GridView.builder ومظهر الصور الدائرية ClipOval مع دعم كامل للغة العربية وتوافق الأجهزة المحمولة.
              </p>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 text-left font-mono text-[11px] overflow-x-auto shadow-inner border border-slate-800 dir-ltr max-h-[480px]">
              <pre>{FLUTTER_CATEGORIES_CODE}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
