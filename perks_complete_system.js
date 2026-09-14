
/* === COMPLETE PERKS, GIFTS & CUSTOMER WALLETS SYSTEM === */
const PERKS_STORAGE_KEY = "customer_perks_v1";
const WALLETS_STORAGE_KEY = "customer_wallets_v1";

const DEFAULT_PERKS = [
  {
    id: "perk-welcome-2026",
    type: "coupon",
    targetUserId: "all",
    title: "كود الخصم الترحيبي 15%",
    code: "SAH2026",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 0,
    expiresAt: "2026-12-31T23:59:59.000Z",
    description: "خصم 15% على إجمالي قيمة مشترياتك في السلة"
  },
  {
    id: "perk-special-5",
    type: "coupon",
    targetUserId: "all",
    title: "كوبون التخفيض الذهبي 5%",
    code: "TAKHFEED5",
    discountType: "percentage",
    discountValue: 5,
    minOrderAmount: 0,
    expiresAt: "2026-12-31T23:59:59.000Z",
    description: "خصم إضافي 5% بدون حد أدنى للمشتريات"
  },
  {
    id: "perk-gift-5000",
    type: "gift_card",
    targetUserId: "all",
    title: "بطاقة هدية ترحيبية 5,000 ريال يمني",
    code: "GIFT5000",
    amount: 5000,
    currency: "YER",
    expiresAt: "2026-12-31T23:59:59.000Z",
    description: "بطاقة هدية ترحيبية قابلة للشحن في المحفظة واستخدامها في الشراء"
  }
];

function formatTimeRemaining(isoDate) {
  if (!isoDate) return null;
  const now = Date.now();
  const target = new Date(isoDate).getTime();
  const diff = target - now;
  if (diff <= 0) return "منتهية الصلاحية";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `متبقي: ${days} يوم ${remainingHours > 0 ? `و ${remainingHours} ساعة` : ""}`;
  if (hours > 0) return `متبقي: ${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ""}`;
  return `متبقي: ${minutes} دقيقة ⏳`;
}

window.__getCustomerPerks = function(userId) {
  try {
    const raw = localStorage.getItem(PERKS_STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list) || list.length === 0) {
      list = [...DEFAULT_PERKS];
      localStorage.setItem(PERKS_STORAGE_KEY, JSON.stringify(list));
    }
    const now = Date.now();
    // Purge expired perks automatically
    const validList = list.filter(p => {
      if (!p.expiresAt) return true;
      const expTime = new Date(p.expiresAt).getTime();
      return isNaN(expTime) || expTime > now;
    });

    if (validList.length !== list.length) {
      localStorage.setItem(PERKS_STORAGE_KEY, JSON.stringify(validList));
      try {
        if (typeof Dc !== "undefined" && typeof qd === "function" && typeof ed === "function") {
          const expired = list.filter(p => p.expiresAt && new Date(p.expiresAt).getTime() <= now);
          expired.forEach(exp => {
            try {
              const docRef = qd(Dc, "customer_perks", exp.id);
              ed(docRef);
            } catch(err) {}
          });
        }
      } catch(err) {}
    }

    if (!userId) return validList;
    return validList.filter(p => !p.targetUserId || p.targetUserId === "all" || p.targetUserId === userId);
  } catch(e) {
    return [...DEFAULT_PERKS];
  }
};

window.__saveCustomerPerks = function(list) {
  try {
    localStorage.setItem(PERKS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("customer_perks_changed", { detail: list }));
    try {
      if (typeof Dc !== "undefined" && typeof qd === "function" && typeof $0 === "function") {
        list.slice(0, 20).forEach(p => {
          try {
            const docRef = qd(Dc, "customer_perks", p.id);
            $0(docRef, QA({ ...p, updatedAt: new Date().toISOString() }), { merge: true });
          } catch(err) {}
        });
      }
    } catch(err) {}
  } catch(e) {}
};

window.__getCustomerWallet = function(userId) {
  if (!userId) return { balanceYER: 0, balanceSAR: 0, balanceUSD: 0, transactions: [] };
  try {
    const raw = localStorage.getItem(WALLETS_STORAGE_KEY);
    const wallets = raw ? JSON.parse(raw) : {};
    if (wallets[userId]) return wallets[userId];
    const initial = { balanceYER: 0, balanceSAR: 0, balanceUSD: 0, transactions: [] };
    wallets[userId] = initial;
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
    return initial;
  } catch(e) {
    return { balanceYER: 0, balanceSAR: 0, balanceUSD: 0, transactions: [] };
  }
};

window.__saveCustomerWallet = function(userId, walletData) {
  if (!userId) return;
  try {
    const raw = localStorage.getItem(WALLETS_STORAGE_KEY);
    const wallets = raw ? JSON.parse(raw) : {};
    wallets[userId] = walletData;
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
    window.dispatchEvent(new CustomEvent("customer_wallet_changed", { detail: { userId, walletData } }));
    try {
      if (typeof Dc !== "undefined" && typeof qd === "function" && typeof $0 === "function") {
        const docRef = qd(Dc, "customer_wallets", userId);
        $0(docRef, QA({ userId, ...walletData, updatedAt: new Date().toISOString() }), { merge: true });
      }
    } catch(err) {}
  } catch(e) {}
};

window.__redeemPerk = function(code, userId) {
  if (!code || !userId) return { success: false, message: "يرجى إدخال الكود أولاً" };
  const cleanCode = code.trim().toUpperCase();
  const perks = window.__getCustomerPerks(userId);
  const perk = perks.find(p => p.code && p.code.toUpperCase() === cleanCode);
  if (!perk) {
    return { success: false, message: "عذراً، هذا الكود غير موجود أو غير صالح" };
  }
  if (perk.expiresAt && new Date(perk.expiresAt) < new Date()) {
    return { success: false, message: "عذراً، هذا الكود منتهي الصلاحية وتم حذفه" };
  }
  if (perk.redeemedBy && perk.redeemedBy.includes(userId)) {
    return { success: false, message: "لقد قمت باسترداد هذه الهدية مسبقاً!" };
  }

  if (perk.type === "free_product") {
    perk.redeemedBy = perk.redeemedBy || [];
    perk.redeemedBy.push(userId);
    const allPerks = window.__getCustomerPerks();
    const nextPerks = allPerks.map(p => p.id === perk.id ? perk : p);
    window.__saveCustomerPerks(nextPerks);
    localStorage.setItem("applied_free_gift_v1", JSON.stringify(perk));
    return { success: true, message: `مبروك! تم تفعيل الهدية المجانية "${perk.title}" لطلبك القادم 🎁✨` };
  }

  if (perk.type === "gift_card" || perk.type === "wallet_credit") {
    const wallet = window.__getCustomerWallet(userId);
    const curr = perk.currency || "YER";
    const amount = Number(perk.amount || perk.discountValue || 0);
    if (curr === "SAR") wallet.balanceSAR = (wallet.balanceSAR || 0) + amount;
    else if (curr === "USD") wallet.balanceUSD = (wallet.balanceUSD || 0) + amount;
    else wallet.balanceYER = (wallet.balanceYER || 0) + amount;

    wallet.transactions = wallet.transactions || [];
    wallet.transactions.unshift({
      id: `tx-${Date.now()}`,
      title: perk.title || "استرداد بطاقة هدية",
      amount: amount,
      currency: curr,
      type: "deposit",
      date: new Date().toLocaleDateString("ar-SA") + " " + new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    });

    window.__saveCustomerWallet(userId, wallet);

    perk.redeemedBy = perk.redeemedBy || [];
    perk.redeemedBy.push(userId);
    const allPerks = window.__getCustomerPerks();
    const nextPerks = allPerks.map(p => p.id === perk.id ? perk : p);
    window.__saveCustomerPerks(nextPerks);

    return { success: true, message: `تم شحن ${amount.toLocaleString()} ${curr === "SAR" ? "ريال سعودي" : curr === "USD" ? "دولار" : "ريال يمني"} إلى محفظتك بنجاح! 💳✨` };
  }

  localStorage.setItem("applied_coupon_code_v1", perk.code);
  return { success: true, message: `تم تفعيل الكوبون "${perk.code}" بنجاح! سيتم تطبيق الخصم تلقائياً في سلتك 🏷️✨` };
};
