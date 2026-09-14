
const GiftCardsModal = ({ isOpen, onClose, userProfile, onShowToast, onOpenWallet }) => {
  const uid = userProfile ? userProfile.id || userProfile.uid : "guest_user";
  const [perks, setPerks] = S.useState(() => window.__getCustomerPerks(uid));
  const [redeemCode, setRedeemCode] = S.useState("");
  const [copiedCode, setCopiedCode] = S.useState(null);

  S.useEffect(() => {
    const handler = () => {
      setPerks(window.__getCustomerPerks(uid));
    };
    window.addEventListener("customer_perks_changed", handler);
    return () => window.removeEventListener("customer_perks_changed", handler);
  }, [uid]);

  if (!isOpen) return null;

  const giftItems = perks.filter(p => p.type === "gift_card" || p.type === "wallet_credit" || p.type === "free_product");

  const handleRedeem = (e) => {
    e && e.preventDefault();
    if (!redeemCode.trim()) {
      onShowToast && onShowToast("يرجى إدخال رمز بطاقة الهدية أو الصنف", "error");
      return;
    }
    const res = window.__redeemPerk(redeemCode, uid);
    if (res.success) {
      onShowToast && onShowToast(res.message, "success");
      setRedeemCode("");
      setPerks(window.__getCustomerPerks(uid));
    } else {
      onShowToast && onShowToast(res.message, "error");
    }
  };

  const copyCode = (c) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    onShowToast && onShowToast(`تم نسخ الرمز: ${c} 📋`, "info");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return r.jsx("div", {
    className: "fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-['Cairo',sans-serif]",
    onClick: onClose,
    children: r.jsxs("div", {
      className: "bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp",
      onClick: (e) => e.stopPropagation(),
      children: [
        r.jsxs("div", {
          className: "p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-white to-amber-50",
          children: [
            r.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                r.jsx("div", {
                  className: "w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs",
                  children: r.jsx(Y0, { className: "w-5 h-5 stroke-[2.2]" })
                }),
                r.jsxs("div", {
                  children: [
                    r.jsx("h3", { className: "text-base font-black text-slate-900", children: "الهدايا والبطاقات والمكافآت" }),
                    r.jsx("p", { className: "text-[11px] text-slate-500 font-medium", children: "هدايا حصرية وأصناف مجانية مخصصة لك من إدارة المتجر" })
                  ]
                })
              ]
            }),
            r.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-black transition-colors cursor-pointer",
              children: "✕"
            })
          ]
        }),
        r.jsxs("div", {
          className: "p-4 overflow-y-auto space-y-4 flex-1",
          children: [
            r.jsxs("form", {
              onSubmit: handleRedeem,
              className: "p-3.5 bg-slate-50 border border-slate-200 rounded-2xl",
              children: [
                r.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1.5", children: "هل وصلك رمز هدية أو صنف مجاني؟" }),
                r.jsxs("div", {
                  className: "flex items-center gap-2",
                  children: [
                    r.jsx("input", {
                      type: "text",
                      value: redeemCode,
                      onChange: (e) => setRedeemCode(e.target.value.toUpperCase()),
                      placeholder: "أدخل الرمز هنا (مثال: GIFT5000 أو FREE-DRESS)",
                      className: "flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 tracking-wider text-center uppercase focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    }),
                    r.jsx("button", {
                      type: "submit",
                      className: "px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer",
                      children: "تفعيل الهدية"
                    })
                  ]
                })
              ]
            }),
            r.jsxs("div", {
              className: "flex items-center justify-between pt-1",
              children: [
                r.jsx("h4", { className: "text-xs font-black text-slate-800", children: "الهدايا والبطاقات المتاحة لك حالياً" }),
                r.jsx("span", { className: "text-[11px] text-slate-500 font-bold", children: `${giftItems.length} هدية` })
              ]
            }),
            giftItems.length === 0 ? r.jsxs("div", {
              className: "text-center py-8 text-slate-400 space-y-2",
              children: [
                r.jsx(Y0, { className: "w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" }),
                r.jsx("p", { className: "text-xs font-bold text-slate-500", children: "لا توجد هدايا أو بطاقات غير مستخدمة حالياً" }),
                r.jsx("p", { className: "text-[11px] text-slate-400", children: "ترقب مفاجآت وهدايا الإدارة، أو تواصل مع الدعم للاستفسار عن المكافآت!" })
              ]
            }) : r.jsx("div", {
              className: "space-y-2.5",
              children: giftItems.map((item) => {
                const isRedeemed = Array.isArray(item.redeemedBy) && item.redeemedBy.includes(uid);
                const currName = item.currency === "SAR" ? "ريال سعودي" : item.currency === "USD" ? "دولار" : "ريال يمني";
                const isFreeProduct = item.type === "free_product";
                const timeLeft = formatTimeRemaining(item.expiresAt);
                return r.jsxs("div", {
                  key: item.id,
                  className: `p-3.5 rounded-2xl border transition-all ${isRedeemed ? "bg-slate-50 border-slate-200 opacity-60" : "bg-gradient-to-r from-amber-50/80 via-white to-rose-50/80 border-amber-200 shadow-xs"}`,
                  children: [
                    r.jsxs("div", {
                      className: "flex items-start justify-between gap-2 mb-2",
                      children: [
                        r.jsxs("div", {
                          children: [
                            r.jsxs("div", {
                              className: "flex items-center gap-1.5",
                              children: [
                                r.jsx("span", {
                                  className: `px-2 py-0.5 rounded-full text-[9.5px] font-black text-white ${isFreeProduct ? "bg-purple-600" : "bg-rose-600"}`,
                                  children: isFreeProduct ? "صنف بلاش 🎁" : "بطاقة رصيد 💳"
                                }),
                                r.jsx("h5", { className: "text-xs font-black text-slate-900", children: item.title })
                              ]
                            }),
                            r.jsx("p", { className: "text-[10.5px] text-slate-500 font-medium mt-1", children: item.description || (isFreeProduct ? "صنف مجاني بالكامل يضاف لطلبك" : "بطاقة رصيد تشحن للمحفظة") })
                          ]
                        }),
                        r.jsxs("div", {
                          className: "text-right shrink-0",
                          children: [
                            isFreeProduct ? r.jsx("span", { className: "text-sm font-black text-purple-600 block", children: "مجاني 100%" }) : r.jsxs("span", { className: "text-base font-black text-rose-600 block", children: [Number(item.amount || item.discountValue || 0).toLocaleString(), " ", currName] }),
                            timeLeft && r.jsx("span", { className: "text-[9.5px] font-bold text-amber-700 block bg-amber-50 px-1.5 py-0.5 rounded-md mt-0.5", children: timeLeft })
                          ]
                        })
                      ]
                    }),
                    r.jsxs("div", {
                      className: "flex items-center justify-between pt-2 border-t border-slate-100 gap-2",
                      children: [
                        r.jsx("div", {
                          className: "px-2.5 py-1 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 tracking-wider",
                          children: item.code
                        }),
                        r.jsxs("div", {
                          className: "flex items-center gap-1.5",
                          children: [
                            r.jsx("button", {
                              type: "button",
                              onClick: () => copyCode(item.code),
                              className: "px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer",
                              children: copiedCode === item.code ? "تم النسخ ✓" : "نسخ الرمز"
                            }),
                            !isRedeemed && r.jsx("button", {
                              type: "button",
                              onClick: () => {
                                const res = window.__redeemPerk(item.code, uid);
                                if (res.success) {
                                  onShowToast && onShowToast(res.message, "success");
                                  setPerks(window.__getCustomerPerks(uid));
                                } else {
                                  onShowToast && onShowToast(res.message, "error");
                                }
                              },
                              className: `px-3 py-1 rounded-lg text-white text-[11px] font-black transition-colors shadow-2xs cursor-pointer ${isFreeProduct ? "bg-purple-600 hover:bg-purple-700" : "bg-rose-600 hover:bg-rose-700"}`,
                              children: isFreeProduct ? "تفعيل الصنف المجاني" : "شحن للمحفظة"
                            })
                          ]
                        })
                      ]
                    })
                  ]
                });
              })
            })
          ]
        }),
        r.jsx("div", {
          className: "p-3 bg-slate-50 border-t border-slate-100 text-center",
          children: r.jsx("button", {
            type: "button",
            onClick: () => {
              onClose();
              onOpenWallet && onOpenWallet();
            },
            className: "text-xs font-black text-rose-600 hover:text-rose-700 transition-colors cursor-pointer inline-flex items-center gap-1",
            children: "💳 الانتقال إلى رصيد المحفظة وعمليات الشحن ←"
          })
        })
      ]
    })
  });
};

const WalletModal = ({ isOpen, onClose, userProfile, onShowToast, onOpenCustomerChat }) => {
  const uid = userProfile ? userProfile.id || userProfile.uid : "guest_user";
  const [wallet, setWallet] = S.useState(() => window.__getCustomerWallet(uid));
  const [copiedAccount, setCopiedAccount] = S.useState(null);

  S.useEffect(() => {
    const handler = () => {
      setWallet(window.__getCustomerWallet(uid));
    };
    window.addEventListener("customer_wallet_changed", handler);
    return () => window.removeEventListener("customer_wallet_changed", handler);
  }, [uid]);

  if (!isOpen) return null;

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    onShowToast && onShowToast(`تم نسخ رقم ${label}: ${text} 📋`, "success");
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleOpenChatRecharge = () => {
    onClose();
    onOpenCustomerChat && onOpenCustomerChat();
    onShowToast && onShowToast("أهلاً بك! يرجى إرسال إشعار التحويل هنا لشحن محفظتك فوراً 💳", "info");
  };

  return r.jsx("div", {
    className: "fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-['Cairo',sans-serif]",
    onClick: onClose,
    children: r.jsxs("div", {
      className: "bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp",
      onClick: (e) => e.stopPropagation(),
      children: [
        r.jsxs("div", {
          className: "p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/70",
          children: [
            r.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                r.jsx("div", {
                  className: "w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs",
                  children: r.jsx(tQ, { className: "w-5 h-5 stroke-[2.2]" })
                }),
                r.jsxs("div", {
                  children: [
                    r.jsx("h3", { className: "text-base font-black text-slate-900", children: "محفظتي الرقمية" }),
                    r.jsx("p", { className: "text-[11px] text-slate-500 font-medium", children: "رصيدك المتاح، سجل الشحن، وحسابات الإيداع المعتمدة" })
                  ]
                })
              ]
            }),
            r.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-black transition-colors cursor-pointer",
              children: "✕"
            })
          ]
        }),
        r.jsxs("div", {
          className: "p-4 overflow-y-auto space-y-4 flex-1",
          children: [
            r.jsxs("div", {
              className: "grid grid-cols-3 gap-2",
              children: [
                r.jsxs("div", {
                  className: "bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-center",
                  children: [
                    r.jsx("span", { className: "text-[10px] text-emerald-800 font-bold block", children: "ريال يمني (YER)" }),
                    r.jsx("span", { className: "text-lg font-black text-emerald-700 block mt-0.5", children: Number(wallet.balanceYER || 0).toLocaleString() }),
                    r.jsx("span", { className: "text-[10px] text-emerald-600 font-semibold block", children: "ر.ي" })
                  ]
                }),
                r.jsxs("div", {
                  className: "bg-blue-50/80 border border-blue-200 rounded-2xl p-3 text-center",
                  children: [
                    r.jsx("span", { className: "text-[10px] text-blue-800 font-bold block", children: "سعودي (SAR)" }),
                    r.jsx("span", { className: "text-lg font-black text-blue-700 block mt-0.5", children: Number(wallet.balanceSAR || 0).toFixed(2) }),
                    r.jsx("span", { className: "text-[10px] text-blue-600 font-semibold block", children: "ر.س" })
                  ]
                }),
                r.jsxs("div", {
                  className: "bg-purple-50/80 border border-purple-200 rounded-2xl p-3 text-center",
                  children: [
                    r.jsx("span", { className: "text-[10px] text-purple-800 font-bold block", children: "دولار (USD)" }),
                    r.jsx("span", { className: "text-lg font-black text-purple-700 block mt-0.5", children: Number(wallet.balanceUSD || 0).toFixed(2) }),
                    r.jsx("span", { className: "text-[10px] text-purple-600 font-semibold block", children: "$" })
                  ]
                })
              ]
            }),
            r.jsxs("div", {
              className: "bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5",
              children: [
                r.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    r.jsx("h4", { className: "text-xs font-black text-slate-900", children: "حسابات الإيداع والشحن الفوري المعتمدة 🏦" }),
                    r.jsx("span", { className: "text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full", children: "شحن مباشر" })
                  ]
                }),
                r.jsxs("div", {
                  className: "space-y-1.5 text-xs",
                  children: [
                    r.jsxs("div", {
                      className: "flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors",
                      children: [
                        r.jsxs("div", {
                          children: [
                            r.jsx("span", { className: "font-bold text-slate-800 block text-[11px]", children: "بنك الكريمي المميز" }),
                            r.jsx("span", { className: "text-[10px] text-slate-500 font-medium block", children: "باسم: بشير نجيب التبالي" })
                          ]
                        }),
                        r.jsxs("button", {
                          type: "button",
                          onClick: () => copyText("3052037319", "كريمي مميز"),
                          className: "flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono font-bold text-xs hover:border-emerald-500 transition-colors cursor-pointer",
                          children: [
                            "3052037319",
                            copiedAccount === "كريمي مميز" ? " ✓" : " 📋"
                          ]
                        })
                      ]
                    }),
                    r.jsxs("div", {
                      className: "flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors",
                      children: [
                        r.jsxs("div", {
                          children: [
                            r.jsx("span", { className: "font-bold text-slate-800 block text-[11px]", children: "مشترك كل المحافظ الإلكترونية" }),
                            r.jsx("span", { className: "text-[10px] text-slate-500 font-medium block", children: "باسم: بشير نجيب ناجي التبالي" })
                          ]
                        }),
                        r.jsxs("button", {
                          type: "button",
                          onClick: () => copyText("771053370", "مشترك المحافظ"),
                          className: "flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono font-bold text-xs hover:border-emerald-500 transition-colors cursor-pointer",
                          children: [
                            "771053370",
                            copiedAccount === "مشترك المحافظ" ? " ✓" : " 📋"
                          ]
                        })
                      ]
                    }),
                    r.jsxs("div", {
                      className: "grid grid-cols-2 gap-1.5",
                      children: [
                        r.jsxs("div", {
                          className: "flex items-center justify-between p-2 bg-slate-50 rounded-xl text-[11px]",
                          children: [
                            r.jsx("span", { className: "font-bold text-slate-700", children: "محفظة فلوسك:" }),
                            r.jsx("button", {
                              type: "button",
                              onClick: () => copyText("701703", "محفظة فلوسك"),
                              className: "font-mono font-bold text-emerald-700 px-1.5 py-0.5 bg-white rounded border border-slate-200 cursor-pointer",
                              children: "701703"
                            })
                          ]
                        }),
                        r.jsxs("div", {
                          className: "flex items-center justify-between p-2 bg-slate-50 rounded-xl text-[11px]",
                          children: [
                            r.jsx("span", { className: "font-bold text-slate-700", children: "نقطة حاسب كريمي:" }),
                            r.jsx("button", {
                              type: "button",
                              onClick: () => copyText("1778906", "حاسب كريمي"),
                              className: "font-mono font-bold text-emerald-700 px-1.5 py-0.5 bg-white rounded border border-slate-200 cursor-pointer",
                              children: "1778906"
                            })
                          ]
                        }),
                        r.jsxs("div", {
                          className: "flex items-center justify-between p-2 bg-slate-50 rounded-xl text-[11px]",
                          children: [
                            r.jsx("span", { className: "font-bold text-slate-700", children: "محفظة جيب:" }),
                            r.jsx("button", {
                              type: "button",
                              onClick: () => copyText("562110", "محفظة جيب"),
                              className: "font-mono font-bold text-emerald-700 px-1.5 py-0.5 bg-white rounded border border-slate-200 cursor-pointer",
                              children: "562110"
                            })
                          ]
                        }),
                        r.jsxs("div", {
                          className: "flex items-center justify-between p-2 bg-slate-50 rounded-xl text-[11px]",
                          children: [
                            r.jsx("span", { className: "font-bold text-slate-700", children: "محفظة جوالي:" }),
                            r.jsx("button", {
                              type: "button",
                              onClick: () => copyText("892599", "محفظة جوالي"),
                              className: "font-mono font-bold text-emerald-700 px-1.5 py-0.5 bg-white rounded border border-slate-200 cursor-pointer",
                              children: "892599"
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                r.jsx("button", {
                  type: "button",
                  onClick: handleOpenChatRecharge,
                  className: "w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer",
                  children: "💬 إرسال إشعار التحويل لاعتماد الشحن فوراً"
                })
              ]
            }),
            r.jsxs("div", {
              className: "space-y-2",
              children: [
                r.jsx("h4", { className: "text-xs font-black text-slate-800", children: "سجل العمليات والمعاملات" }),
                (!wallet.transactions || wallet.transactions.length === 0) ? r.jsx("p", {
                  className: "text-center py-4 text-slate-400 text-xs font-medium",
                  children: "لا توجد معاملات سابقة في المحفظة حتى الآن."
                }) : r.jsx("div", {
                  className: "space-y-1.5",
                  children: wallet.transactions.map((tx) => r.jsxs("div", {
                    key: tx.id,
                    className: "p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs",
                    children: [
                      r.jsxs("div", {
                        children: [
                          r.jsx("span", { className: "font-bold text-slate-800 block text-[11px]", children: tx.title }),
                          r.jsx("span", { className: "text-[9.5px] text-slate-400 font-medium block", children: tx.date })
                        ]
                      }),
                      r.jsxs("span", {
                        className: `font-black text-xs ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-600"}`,
                        children: [
                          tx.type === "deposit" ? "+ " : "- ",
                          Number(tx.amount).toLocaleString(),
                          " ",
                          tx.currency === "SAR" ? "ر.س" : tx.currency === "USD" ? "$" : "ر.ي"
                        ]
                      })
                    ]
                  }))
                })
              ]
            })
          ]
        })
      ]
    })
  });
};

const CouponsModal = ({ isOpen, onClose, userProfile, onShowToast, onApplyCoupon }) => {
  const uid = userProfile ? userProfile.id || userProfile.uid : "guest_user";
  const [perks, setPerks] = S.useState(() => window.__getCustomerPerks(uid));
  const [copiedCode, setCopiedCode] = S.useState(null);

  S.useEffect(() => {
    const handler = () => {
      setPerks(window.__getCustomerPerks(uid));
    };
    window.addEventListener("customer_perks_changed", handler);
    return () => window.removeEventListener("customer_perks_changed", handler);
  }, [uid]);

  if (!isOpen) return null;

  const coupons = perks.filter(p => p.type === "coupon" || !p.type);

  const copyCode = (c) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    onShowToast && onShowToast(`تم نسخ الكوبون: ${c} 🏷️`, "info");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const applyCoupon = (c) => {
    localStorage.setItem("applied_coupon_code_v1", c);
    onShowToast && onShowToast(`تم تفعيل الكوبون "${c}" بنجاح! سيتم تطبيق الخصم في السلة ✨`, "success");
    onApplyCoupon && onApplyCoupon(c);
    onClose();
  };

  return r.jsx("div", {
    className: "fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn font-['Cairo',sans-serif]",
    onClick: onClose,
    children: r.jsxs("div", {
      className: "bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp",
      onClick: (e) => e.stopPropagation(),
      children: [
        r.jsxs("div", {
          className: "p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-rose-50/70",
          children: [
            r.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                r.jsx("div", {
                  className: "w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs",
                  children: r.jsx(OP, { className: "w-5 h-5 stroke-[2.2]" })
                }),
                r.jsxs("div", {
                  children: [
                    r.jsx("h3", { className: "text-base font-black text-slate-900", children: "كوبونات الخصم والعروض" }),
                    r.jsx("p", { className: "text-[11px] text-slate-500 font-medium", children: "أقوى التخفيضات والكوبونات المؤقتة المتاحة لطلبك" })
                  ]
                })
              ]
            }),
            r.jsx("button", {
              type: "button",
              onClick: onClose,
              className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-black transition-colors cursor-pointer",
              children: "✕"
            })
          ]
        }),
        r.jsxs("div", {
          className: "p-4 overflow-y-auto space-y-3 flex-1",
          children: [
            coupons.length === 0 ? r.jsxs("div", {
              className: "text-center py-8 text-slate-400 space-y-2",
              children: [
                r.jsx(OP, { className: "w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" }),
                r.jsx("p", { className: "text-xs font-bold text-slate-500", children: "لا توجد كوبونات خصم متاحة حالياً" })
              ]
            }) : coupons.map((c) => {
              const timeLeft = formatTimeRemaining(c.expiresAt);
              return r.jsxs("div", {
                key: c.id,
                className: "p-3.5 bg-gradient-to-r from-amber-50/70 via-white to-orange-50/70 rounded-2xl border border-amber-200/80 shadow-2xs space-y-2.5",
                children: [
                  r.jsxs("div", {
                    className: "flex items-start justify-between gap-2",
                    children: [
                      r.jsxs("div", {
                        children: [
                          r.jsx("h4", { className: "text-xs font-black text-slate-900", children: c.title }),
                          r.jsx("p", { className: "text-[10.5px] text-slate-500 font-medium mt-0.5", children: c.description || "كود خصم فوري عند الشراء" })
                        ]
                      }),
                      r.jsxs("div", {
                        className: "text-right shrink-0",
                        children: [
                          r.jsx("span", {
                            className: "px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-black block shadow-2xs",
                            children: c.discountType === "percentage" ? `${c.discountValue}% خصم` : `${c.discountValue} ر.ي خصم`
                          }),
                          timeLeft && r.jsx("span", { className: "text-[9.5px] font-bold text-amber-800 block mt-1", children: timeLeft })
                        ]
                      })
                    ]
                  }),
                  r.jsxs("div", {
                    className: "flex items-center justify-between pt-2 border-t border-amber-100 gap-2",
                    children: [
                      r.jsxs("div", {
                        className: "px-3 py-1 bg-white border border-dashed border-amber-400 rounded-xl text-xs font-mono font-black text-amber-900 tracking-wider flex items-center gap-1.5",
                        children: [
                          r.jsx(OP, { className: "w-3.5 h-3.5 text-amber-600 stroke-[2]" }),
                          c.code
                        ]
                      }),
                      r.jsxs("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                          r.jsx("button", {
                            type: "button",
                            onClick: () => copyCode(c.code),
                            className: "px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer",
                            children: copiedCode === c.code ? "تم النسخ ✓" : "نسخ"
                          }),
                          r.jsx("button", {
                            type: "button",
                            onClick: () => applyCoupon(c.code),
                            className: "px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black transition-colors shadow-2xs cursor-pointer",
                            children: "تطبيق في السلة"
                          })
                        ]
                      })
                    ]
                  })
                ]
              });
            })
          ]
        })
      ]
    })
  });
};

const CustomerPerksAdminManager = ({ users = [], onShowToast, onClose }) => {
  const [tab, setTab] = S.useState("issue");
  const [perks, setPerks] = S.useState(() => window.__getCustomerPerks());
  
  // Issue form state
  const [targetUser, setTargetUser] = S.useState("all");
  const [perkType, setPerkType] = S.useState("gift_card");
  const [title, setTitle] = S.useState("");
  const [code, setCode] = S.useState("");
  const [amount, setAmount] = S.useState("5000");
  const [currency, setCurrency] = S.useState("YER");
  const [durationPreset, setDurationPreset] = S.useState("1_day");
  const [customDate, setCustomDate] = S.useState("2026-12-31T23:59");
  const [conditionNote, setConditionNote] = S.useState("هدية حصرية للاستخدام مع أي طلب");

  // Wallet manager state
  const [selectedWalletUser, setSelectedWalletUser] = S.useState(users[0] ? users[0].uid || users[0].id : "");
  const [walletAmount, setWalletAmount] = S.useState("1000");
  const [walletCurr, setWalletCurr] = S.useState("YER");
  const [walletNote, setWalletNote] = S.useState("شحن رصيد / هدية من الإدارة");
  const [selectedUserWallet, setSelectedUserWallet] = S.useState(() => window.__getCustomerWallet(selectedWalletUser));

  S.useEffect(() => {
    if (selectedWalletUser) {
      setSelectedUserWallet(window.__getCustomerWallet(selectedWalletUser));
    }
  }, [selectedWalletUser]);

  const computeExpiresAt = () => {
    const now = Date.now();
    switch (durationPreset) {
      case "1_hour": return new Date(now + 1 * 3600 * 1000).toISOString();
      case "2_hours": return new Date(now + 2 * 3600 * 1000).toISOString();
      case "6_hours": return new Date(now + 6 * 3600 * 1000).toISOString();
      case "12_hours": return new Date(now + 12 * 3600 * 1000).toISOString();
      case "1_day": return new Date(now + 24 * 3600 * 1000).toISOString();
      case "2_days": return new Date(now + 48 * 3600 * 1000).toISOString();
      case "3_days": return new Date(now + 72 * 3600 * 1000).toISOString();
      case "1_week": return new Date(now + 7 * 24 * 3600 * 1000).toISOString();
      case "1_month": return new Date(now + 30 * 24 * 3600 * 1000).toISOString();
      case "3_months": return new Date(now + 90 * 24 * 3600 * 1000).toISOString();
      case "1_year": return new Date(now + 365 * 24 * 3600 * 1000).toISOString();
      case "custom": return new Date(customDate).toISOString();
      default: return new Date(now + 24 * 3600 * 1000).toISOString();
    }
  };

  const generateCode = () => {
    const prefix = perkType === "free_product" ? "FREE" : perkType === "gift_card" ? "GIFT" : perkType === "coupon" ? "COUPON" : "BONUS";
    const rand = Math.floor(1000 + Math.random() * 9000);
    setCode(`${prefix}-${rand}`);
  };

  const handleCreatePerk = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast && onShowToast("يرجى إدخال عنوان الهدية أو الصنف أو الكوبون", "error");
      return;
    }
    const finalCode = (code.trim() || `SAH-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const expiry = computeExpiresAt();

    const newPerk = {
      id: `perk-${Date.now()}`,
      type: perkType,
      targetUserId: targetUser,
      title: title.trim(),
      code: finalCode,
      amount: Number(amount) || 0,
      discountValue: Number(amount) || 0,
      discountType: perkType === "coupon" ? "percentage" : "fixed",
      currency: currency,
      expiresAt: expiry,
      durationOption: durationPreset,
      description: conditionNote.trim(),
      createdAt: new Date().toISOString()
    };

    const next = [newPerk, ...perks];
    setPerks(next);
    window.__saveCustomerPerks(next);
    onShowToast && onShowToast(`تم إصدار "${title.trim()}" بنجاح! وستحذف تلقائياً عند انتهاء المدة 🎁✨`, "success");
    setTitle("");
    setCode("");
  };

  const handleDeletePerk = (id) => {
    const next = perks.filter(p => p.id !== id);
    setPerks(next);
    window.__saveCustomerPerks(next);
    onShowToast && onShowToast("تم حذف البطاقة / الكوبون بنجاح 🗑️", "info");
  };

  const handleUpdateWallet = (type) => {
    if (!selectedWalletUser) {
      onShowToast && onShowToast("يرجى اختيار العميل أولاً", "error");
      return;
    }
    const val = Number(walletAmount);
    if (!val || val <= 0) {
      onShowToast && onShowToast("يرجى إدخال مبلغ صحيح", "error");
      return;
    }
    const current = window.__getCustomerWallet(selectedWalletUser);
    const multiplier = type === "add" ? 1 : -1;
    if (walletCurr === "SAR") current.balanceSAR = Math.max(0, (current.balanceSAR || 0) + val * multiplier);
    else if (walletCurr === "USD") current.balanceUSD = Math.max(0, (current.balanceUSD || 0) + val * multiplier);
    else current.balanceYER = Math.max(0, (current.balanceYER || 0) + val * multiplier);

    current.transactions = current.transactions || [];
    current.transactions.unshift({
      id: `tx-${Date.now()}`,
      title: walletNote.trim() || (type === "add" ? "إيداع رصيد من الإدارة" : "خصم رصيد من الإدارة"),
      amount: val,
      currency: walletCurr,
      type: type === "add" ? "deposit" : "deduct",
      date: new Date().toLocaleDateString("ar-SA") + " " + new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
    });

    window.__saveCustomerWallet(selectedWalletUser, current);
    setSelectedUserWallet({ ...current });
    onShowToast && onShowToast(type === "add" ? `تم شحن ${val.toLocaleString()} إلى محفظة العميل بنجاح 💳✨` : `تم خصم ${val.toLocaleString()} من محفظة العميل`, "success");
  };

  return r.jsxs("div", {
    className: "space-y-4 font-['Cairo',sans-serif]",
    children: [
      r.jsxs("div", {
        className: "flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 rounded-2xl border border-slate-200",
        children: [
          r.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              r.jsx("div", {
                className: "w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center",
                children: r.jsx(Y0, { className: "w-4 h-4" })
              }),
              r.jsxs("div", {
                children: [
                  r.jsx("h4", { className: "text-xs font-black text-slate-900", children: "لوحة التحكم: الهدايا، الأصناف المجانية، المحافظ والكوبونات" }),
                  r.jsx("p", { className: "text-[10px] text-slate-500", children: "إرسال هدية مؤقتة (ساعة، ساعتين، أيام، أشهر) تحذف تلقائياً عند انتهائها" })
                ]
              })
            ]
          }),
          r.jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 bg-white text-slate-700 rounded-full border border-slate-200", children: `${perks.length} نشطة` })
        ]
      }),
      r.jsxs("div", {
        className: "flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl",
        children: [
          r.jsx("button", {
            type: "button",
            onClick: () => setTab("issue"),
            className: `flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${tab === "issue" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
            children: "🎁 إرسال هدية / كوبون"
          }),
          r.jsx("button", {
            type: "button",
            onClick: () => setTab("wallet"),
            className: `flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${tab === "wallet" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
            children: "💳 شحن وتعديل محفظة"
          }),
          r.jsx("button", {
            type: "button",
            onClick: () => setTab("list"),
            className: `flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${tab === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
            children: `📋 الهدايا والكوبونات النشطة (${perks.length})`
          })
        ]
      }),
      tab === "issue" && r.jsxs("form", {
        onSubmit: handleCreatePerk,
        className: "space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs",
        children: [
          r.jsxs("div", {
            children: [
              r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "نوع الإهداء والمكافأة:" }),
              r.jsxs("select", {
                value: perkType,
                onChange: (e) => setPerkType(e.target.value),
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold",
                children: [
                  r.jsx("option", { value: "gift_card", children: "🎁 بطاقة هدية (رصيد مالي يشحن للمحفظة)" }),
                  r.jsx("option", { value: "free_product", children: "🛍️ صنف مجاني بلاش (هدية منتج أو لباس)" }),
                  r.jsx("option", { value: "coupon", children: "🏷️ كود خصم (نسبة مئوية من السلة عند الدفع)" }),
                  r.jsx("option", { value: "wallet_credit", children: "💳 رصيد محفظة فوري" })
                ]
              })
            ]
          }),
          r.jsxs("div", {
            children: [
              r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "المستفيد (العميل المستهدف):" }),
              r.jsxs("select", {
                value: targetUser,
                onChange: (e) => setTargetUser(e.target.value),
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold",
                children: [
                  r.jsx("option", { value: "all", children: "🌟 كافة العملاء المسجلين (عام)" }),
                  users.map((u) => r.jsx("option", {
                    key: u.uid || u.id,
                    value: u.uid || u.id,
                    children: `${u.firstName || ""} ${u.lastName || ""} (${u.phone || u.email || u.uid})`
                  }))
                ]
              })
            ]
          }),
          r.jsxs("div", {
            children: [
              r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "عنوان الهدية / الصنف / الكوبون:" }),
              r.jsx("input", {
                type: "text",
                value: title,
                onChange: (e) => setTitle(e.target.value),
                placeholder: perkType === "free_product" ? "مثال: فستان بناتي تركي هدية مجانية بلاش" : "مثال: بطاقة هدية 5,000 ريال أو كود خصم 20%",
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              })
            ]
          }),
          r.jsxs("div", {
            children: [
              r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "الشروط / ملاحظات الاستخدام:" }),
              r.jsx("input", {
                type: "text",
                value: conditionNote,
                onChange: (e) => setConditionNote(e.target.value),
                placeholder: "مثال: متاح مجاناً مع أول طلب، أو حد أدنى للشراء",
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              })
            ]
          }),
          perkType !== "free_product" && r.jsxs("div", {
            className: "grid grid-cols-2 gap-2",
            children: [
              r.jsxs("div", {
                children: [
                  r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: perkType === "coupon" ? "نسبة الخصم (%)" : "المبلغ" }),
                  r.jsx("input", {
                    type: "number",
                    value: amount,
                    onChange: (e) => setAmount(e.target.value),
                    className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-black"
                  })
                ]
              }),
              r.jsxs("div", {
                children: [
                  r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "العملة:" }),
                  r.jsxs("select", {
                    value: currency,
                    onChange: (e) => setCurrency(e.target.value),
                    disabled: perkType === "coupon",
                    className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold",
                    children: [
                      r.jsx("option", { value: "YER", children: "ريال يمني (YER)" }),
                      r.jsx("option", { value: "SAR", children: "ريال سعودي (SAR)" }),
                      r.jsx("option", { value: "USD", children: "دولار أمريكي (USD)" })
                    ]
                  })
                ]
              })
            ]
          }),
          r.jsxs("div", {
            children: [
              r.jsxs("div", {
                className: "flex items-center justify-between mb-1",
                children: [
                  r.jsx("label", { className: "font-bold text-slate-700", children: "رمز الكود المخصص:" }),
                  r.jsx("button", {
                    type: "button",
                    onClick: generateCode,
                    className: "text-[10px] text-rose-600 font-bold hover:underline cursor-pointer",
                    children: "توليد كود تلقائي ⚡"
                  })
                ]
              }),
              r.jsx("input", {
                type: "text",
                value: code,
                onChange: (e) => setCode(e.target.value.toUpperCase()),
                placeholder: "مثال: GIFT-7710 أو FREE-DRESS",
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black tracking-wider text-center"
              })
            ]
          }),
          r.jsxs("div", {
            className: "space-y-1.5 p-3 bg-amber-50/60 rounded-xl border border-amber-200/70",
            children: [
              r.jsx("label", { className: "block font-bold text-amber-900", children: "مدة صلاحية الهدية / الكوبون (مؤقت ويحذف بعد الانتهاء):" }),
              r.jsxs("select", {
                value: durationPreset,
                onChange: (e) => setDurationPreset(e.target.value),
                className: "w-full p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-800",
                children: [
                  r.jsx("option", { value: "1_hour", children: "⏱️ ساعة واحدة (1 ساعة)" }),
                  r.jsx("option", { value: "2_hours", children: "⏱️ ساعتان (2 ساعة)" }),
                  r.jsx("option", { value: "6_hours", children: "⏱️ 6 ساعات" }),
                  r.jsx("option", { value: "12_hours", children: "⏱️ 12 ساعة" }),
                  r.jsx("option", { value: "1_day", children: "📅 يوم واحد (24 ساعة)" }),
                  r.jsx("option", { value: "2_days", children: "📅 يومان (48 ساعة)" }),
                  r.jsx("option", { value: "3_days", children: "📅 3 أيام" }),
                  r.jsx("option", { value: "1_week", children: "📅 أسبوع كامل (7 أيام)" }),
                  r.jsx("option", { value: "1_month", children: "📅 شهر كامل (30 يوماً)" }),
                  r.jsx("option", { value: "3_months", children: "📅 3 أشهر" }),
                  r.jsx("option", { value: "1_year", children: "📅 سنة كاملة (365 يوماً)" }),
                  r.jsx("option", { value: "custom", children: "⚙️ تحديد تاريخ ووقت مخصص" })
                ]
              }),
              durationPreset === "custom" && r.jsx("input", {
                type: "datetime-local",
                value: customDate,
                onChange: (e) => setCustomDate(e.target.value),
                className: "w-full p-2 bg-white border border-amber-300 rounded-xl font-bold mt-2"
              })
            ]
          }),
          r.jsx("button", {
            type: "submit",
            className: "w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition-colors shadow-xs cursor-pointer",
            children: "إرسال الهدية / الكوبون للعميل الآن 🚀"
          })
        ]
      }),
      tab === "wallet" && r.jsxs("div", {
        className: "space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs",
        children: [
          r.jsxs("div", {
            children: [
              r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "اختر العميل لشحن أو تعديل محفظته:" }),
              r.jsx("select", {
                value: selectedWalletUser,
                onChange: (e) => setSelectedWalletUser(e.target.value),
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold",
                children: users.map((u) => r.jsx("option", {
                  key: u.uid || u.id,
                  value: u.uid || u.id,
                  children: `${u.firstName || ""} ${u.lastName || ""} • ${u.phone || u.email || u.uid}`
                }))
              })
            ]
          }),
          r.jsxs("div", {
            className: "p-3 bg-slate-50 rounded-xl border border-slate-200 text-center grid grid-cols-3 gap-1",
            children: [
              r.jsxs("div", {
                children: [
                  r.jsx("span", { className: "text-[10px] text-slate-500 block", children: "رصيد يمني" }),
                  r.jsxs("span", { className: "text-xs font-black text-emerald-700", children: [Number(selectedUserWallet.balanceYER || 0).toLocaleString(), " ر.ي"] })
                ]
              }),
              r.jsxs("div", {
                children: [
                  r.jsx("span", { className: "text-[10px] text-slate-500 block", children: "رصيد سعودي" }),
                  r.jsxs("span", { className: "text-xs font-black text-blue-700", children: [Number(selectedUserWallet.balanceSAR || 0).toFixed(2), " ر.س"] })
                ]
              }),
              r.jsxs("div", {
                children: [
                  r.jsx("span", { className: "text-[10px] text-slate-500 block", children: "رصيد دولار" }),
                  r.jsxs("span", { className: "text-xs font-black text-purple-700", children: [Number(selectedUserWallet.balanceUSD || 0).toFixed(2), " $"] })
                ]
              })
            ]
          }),
          r.jsxs("div", {
            className: "grid grid-cols-2 gap-2",
            children: [
              r.jsxs("div", {
                children: [
                  r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "المبلغ المراد شحنه/خصمه:" }),
                  r.jsx("input", {
                    type: "number",
                    value: walletAmount,
                    onChange: (e) => setWalletAmount(e.target.value),
                    className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-black"
                  })
                ]
              }),
              r.jsxs("div", {
                children: [
                  r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "العملة:" }),
                  r.jsxs("select", {
                    value: walletCurr,
                    onChange: (e) => setWalletCurr(e.target.value),
                    className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold",
                    children: [
                      r.jsx("option", { value: "YER", children: "ريال يمني (YER)" }),
                      r.jsx("option", { value: "SAR", children: "ريال سعودي (SAR)" }),
                      r.jsx("option", { value: "USD", children: "دولار أمريكي (USD)" })
                    ]
                  })
                ]
              })
            ]
          }),
          r.jsxs("div", {
            children: [
              r.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "ملاحظة / سبب العملية:" }),
              r.jsx("input", {
                type: "text",
                value: walletNote,
                onChange: (e) => setWalletNote(e.target.value),
                placeholder: "مثال: إيداع تحويل كريمي أو هدية ترحيبية",
                className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              })
            ]
          }),
          r.jsxs("div", {
            className: "flex items-center gap-2 pt-1",
            children: [
              r.jsx("button", {
                type: "button",
                onClick: () => handleUpdateWallet("add"),
                className: "flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xs transition-colors cursor-pointer",
                children: "+ شحن الرصيد للمحفظة"
              }),
              r.jsx("button", {
                type: "button",
                onClick: () => handleUpdateWallet("deduct"),
                className: "flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-xs transition-colors cursor-pointer",
                children: "- خصم من المحفظة"
              })
            ]
          })
        ]
      }),
      tab === "list" && r.jsxs("div", {
        className: "space-y-2 max-h-[360px] overflow-y-auto",
        children: [
          perks.length === 0 ? r.jsx("p", {
            className: "text-center py-6 text-slate-400 text-xs",
            children: "لا توجد بطاقات أو كوبونات مصدرة حالياً"
          }) : perks.map((p) => {
            const timeLeft = formatTimeRemaining(p.expiresAt);
            return r.jsxs("div", {
              key: p.id,
              className: "p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-2 text-xs",
              children: [
                r.jsxs("div", {
                  children: [
                    r.jsxs("div", {
                      className: "flex items-center gap-1.5",
                      children: [
                        r.jsx("span", { className: "font-black text-slate-900", children: p.title }),
                        r.jsx("span", {
                          className: `px-2 py-0.5 rounded-full text-[9px] font-bold ${p.type === "free_product" ? "bg-purple-100 text-purple-800" : p.type === "gift_card" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`,
                          children: p.type === "free_product" ? "صنف مجاني" : p.type === "gift_card" ? "بطاقة هدية" : p.type === "coupon" ? "كوبون خصم" : "رصيد"
                        })
                      ]
                    }),
                    r.jsxs("div", {
                      className: "flex items-center gap-2 mt-1 text-[10.5px] text-slate-500",
                      children: [
                        r.jsx("span", { className: "font-mono font-bold text-slate-800 bg-slate-50 px-1.5 rounded border border-slate-200", children: p.code }),
                        p.type !== "free_product" && r.jsxs("span", { children: ["المبلغ/الخصم: ", p.type === "coupon" ? `${p.discountValue}%` : `${Number(p.amount).toLocaleString()} ${p.currency}`] }),
                        timeLeft && r.jsxs("span", { className: "text-amber-700 font-bold", children: ["⏳ ", timeLeft] })
                      ]
                    })
                  ]
                }),
                r.jsx("button", {
                  type: "button",
                  onClick: () => handleDeletePerk(p.id),
                  className: "px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                  children: "حذف"
                })
              ]
            });
          })
        ]
      })
    ]
  });
};
