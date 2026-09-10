import React, { useState } from "react";
import {
  ArrowRight,
  Search,
  Heart,
  ShoppingCart,
  Plus,
  Tag,
  Grid,
  Sparkles,
  Layers,
  ChevronLeft
} from "lucide-react";
import { StoreProduct } from "../types";

interface Props {
  initialCategory?: string;
  onBack: () => void;
  onSelectProduct: (product: StoreProduct) => void;
  onAddToCart: (product: StoreProduct) => void;
}

export const CategoryProductsView: React.FC<Props> = ({
  initialCategory = "الإلكترونيات",
  onBack,
  onSelectProduct,
  onAddToCart,
}) => {
  const [selectedMainCat, setSelectedMainCat] = useState(initialCategory);
  const [selectedSubCat, setSelectedSubCat] = useState("الكل");
  const [favorites, setFavorites] = useState<number[]>([1]);

  const mainCategories = ["الكل", "الإلكترونيات", "الملابس", "المأكولات"];
  const subCategories = ["الكل", "هواتف", "أجهزة لوحية", "كمبيوترات"];

  // Sample items structured like Screenshot 5
  const sampleProducts: StoreProduct[] = [
    {
      id: 1,
      name: "تلفون سامسونج",
      price: 180000,
      salePrice: 200000,
      storeName: "الاناقات",
      category: "هواتف",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
      rating: 4.8,
      stock: 5,
      sku: "SAM-S23",
      brand: "Samsung",
      description: "هاتف سامسونج احترافي عالي الجودة مع شاشة سوبر أموليد وبطارية تدوم طويلاً.",
      isTrending: true,
    },
    {
      id: 2,
      name: "بنطلون",
      price: 1900,
      salePrice: 2000,
      storeName: "زيزو",
      category: "الملابس",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      rating: 4.7,
      stock: 40,
      sku: "1234",
      brand: "Apple",
      description: "منتج أصلي معتمد متوفر من زيزو بضمان وجودة عالية وتوصيل سريع.",
      isTrending: true,
    },
    {
      id: 3,
      name: "زيدو",
      price: 10000,
      storeName: "الاناقات",
      category: "الملابس",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
      rating: 4.9,
      stock: 12,
      sku: "ZID-01",
      brand: "Zara",
      description: "طقم شبابي أنيق وعصري.",
    },
    {
      id: 4,
      name: "جهاز لوحي تاب 11",
      price: 95000,
      storeName: "سوق بلس",
      category: "أجهزة لوحية",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
      rating: 4.6,
      stock: 8,
      sku: "TAB-11",
      brand: "Lenovo",
      description: "تابلت عالي الأداء مع شاشة 2K مناسب للدراسة والتصفح ومشاهدة الفيديوهات.",
    },
    {
      id: 5,
      name: "لابتوب ألترا بوك",
      price: 340000,
      salePrice: 380000,
      storeName: "الاناقات",
      category: "كمبيوترات",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      rating: 4.9,
      stock: 4,
      sku: "DELL-XPS",
      brand: "Dell",
      description: "لابتوب فائق السرعة والنحافة مع معالج الجيل الحديث وشاشة فائقة الوضوح.",
      isTrending: true,
    },
  ];

  const filteredProducts = sampleProducts.filter((p) => {
    if (selectedMainCat !== "الكل") {
      if (selectedMainCat === "الإلكترونيات") {
        const isElec = ["هواتف", "أجهزة لوحية", "كمبيوترات", "الإلكترونيات"].includes(p.category);
        if (!isElec) return false;
      } else if (selectedMainCat === "الملابس") {
        if (p.category !== "الملابس") return false;
      }
    }
    if (selectedSubCat !== "الكل") {
      if (p.category !== selectedSubCat) return false;
    }
    return true;
  });

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto" dir="rtl">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="text-base font-black text-slate-900">
            أقسام وتصنيفات المنتجات
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
          <Grid className="w-4 h-4" />
        </div>
      </div>

      {/* Main Categories Tabs matching Screenshot 5 */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {mainCategories.map((cat, idx) => {
          const isSelected = selectedMainCat === cat;
          return (
            <button
              key={`mcat-${cat}-${idx}`}
              onClick={() => {
                setSelectedMainCat(cat);
                setSelectedSubCat("الكل");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black shrink-0 transition ${
                isSelected
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Subcategory Chips matching Screenshot 5 */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {subCategories.map((sub, idx) => {
          const isSelected = selectedSubCat === sub;
          return (
            <button
              key={`subcat-${sub}-${idx}`}
              onClick={() => setSelectedSubCat(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition border ${
                isSelected
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Section Banner matching Screenshot 5 */}
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">
              تصفح قسم: {selectedMainCat}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {filteredProducts.length} منتج يندرج ضمن هذا القسم
            </div>
          </div>
        </div>

        {/* Product Grid matching Screenshot 5 */}
        <div className="grid grid-cols-2 gap-3.5 mt-4">
          {filteredProducts.map((p, idx) => {
            const isFav = favorites.includes(p.id);

            return (
              <div
                key={p.id ? `cat-prod-${p.id}-${idx}` : `cat-prod-${idx}`}
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(e, p.id)}
                    className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-600 shadow-xs hover:bg-white"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? "text-rose-600 fill-rose-600" : ""
                      }`}
                    />
                  </button>

                  {/* Discount / Trending tag */}
                  {p.salePrice && (
                    <span className="absolute bottom-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      خصم {Math.round(((p.salePrice - p.price) / p.salePrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-bold mb-0.5">
                      <span className="bg-blue-50 px-1.5 py-0.5 rounded">{p.category}</span>
                      {p.brand && <span>{p.brand}</span>}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                      {p.name}
                    </h4>
                    <div className="text-[11px] text-slate-400">{p.storeName}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-black text-[#1E3A8A]">
                        {p.price.toLocaleString()} ر.ي
                      </div>
                      {p.salePrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {p.salePrice.toLocaleString()} ر.ي
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(p);
                      }}
                      className="w-7 h-7 rounded-lg bg-[#1E3A8A] hover:bg-blue-900 text-white flex items-center justify-center shadow-xs active:scale-95 transition"
                      title="أضف للسلة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
