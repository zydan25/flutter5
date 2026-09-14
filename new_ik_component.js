
const ik = ({
  isOpen: s,
  onClose: e,
  userGovernorate: t,
  onSelectGovernorate: n,
  currentCurrency: a,
  onSelectCurrency: i,
  pricingSettings: l,
  userProfile: u,
  onShowToast: A,
  initialTab: d = "main",
  onOpenCustomerChat: g,
  onLoginClick: dLogin,
  onLogout: fLogout
}) => {
  const [activeView, setActiveView] = S.useState(d === "location" ? "location" : d === "currency" ? "currency" : "main");
  const [searchGov, setSearchGov] = S.useState("");
  const [regionFilter, setRegionFilter] = S.useState("all");
  const [copiedKey, setCopiedKey] = S.useState(null);

  S.useEffect(() => {
    if (s) {
      setActiveView(d === "location" ? "location" : d === "currency" ? "currency" : "main");
    }
  }, [s, d]);

  if (!s) return null;

  const currentGovInfo = GT(t, l);
  const isSouthRegion = currentGovInfo.region === "south";
  const activeCurrencyObj = Bm.find(c => c.code === a) || Bm[0];
  const samplePrice = Ha(100, t, a, l);

  const displayName = (u && (
    [u.firstName, u.secondName, u.thirdName, u.lastName].filter(Boolean).join(" ").toUpperCase() ||
    (u.name && u.name.toUpperCase()) ||
    u.phone
  )) || "BASHIR NAJEEB ALTBALI";

  const copyToClipboard = (text, label, key) => {
    try {
      if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch (err) {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (A) A(`تم نسخ ${label} بنجاح`, "success");
  };

  const paymentMethods = [
    {
      id: "kuraimi",
      name: "بنك الكريمي (حساب جاري / مميز)",
      accountNumber: "3052037319",
      holderName: "بشير نجيب التبالي",
      badge: "الحساب المعتمد",
      iconColor: "from-blue-600 to-indigo-700"
    },
    {
      id: "all_wallets",
      name: "مشترك كافة المحافظ الإلكترونية",
      accountNumber: "771053370",
      holderName: "بشير نجيب ناجي التبالي",
      badge: "فلوسك • ون كاش • كاش • جيب • جوالي",
      iconColor: "from-purple-600 to-rose-600"
    },
    {
      id: "floosak",
      name: "محفظة فلوسك (بنك اليمن والكويت)",
      accountNumber: "701703",
      holderName: "بشير نجيب التبالي",
      badge: "رقم حساب فلوسك",
      iconColor: "from-emerald-600 to-teal-700"
    },
    {
      id: "haseb",
      name: "خدمة حاسب (بنك الكريمي)",
      accountNumber: "1778906",
      holderName: "بشير نجيب التبالي",
      badge: "رقم حاسب",
      iconColor: "from-sky-600 to-blue-700"
    },
    {
      id: "jeeb",
      name: "محفظة جيب (بنك التضامن)",
      accountNumber: "562110",
      holderName: "بشير نجيب التبالي",
      badge: "رقم جيب",
      iconColor: "from-amber-600 to-orange-700"
    },
    {
      id: "jawali",
      name: "محفظة جوالي (بنك اليمن والبحرين)",
      accountNumber: "892599",
      holderName: "بشير نجيب التبالي",
      badge: "رقم جوالي",
      iconColor: "from-rose-600 to-pink-700"
    }
  ];

  const filteredGovs = af.filter(gov => {
    const matchSearch = gov.includes(searchGov.trim());
    if (!matchSearch) return false;
    if (regionFilter === "all") return true;
    const info = GT(gov, l);
    return regionFilter === "south" ? info.region === "south" : info.region !== "south";
  });

  return r.jsx("div", {
    className: "fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex justify-center items-stretch sm:items-center sm:p-4 font-['Cairo',sans-serif] select-none animate-fadeIn",
    children: r.jsxs("div", {
      className: "bg-[#F6F7F9] w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col",
      children: [
        /* TOP HEADER BAR */
        r.jsxs("div", {
          className: "bg-white h-14 px-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-2xs",
          children: [
            r.jsx("button", {
              type: "button",
              onClick: () => {
                if (activeView === "main") {
                  e();
                } else {
                  setActiveView("main");
                }
              },
              className: "p-2 -mr-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer text-slate-900 flex items-center justify-center",
              "aria-label": "رجوع",
              children: r.jsx(tu, { className: "w-5 h-5 stroke-[2.4]" })
            }),
            r.jsx("h1", {
              className: "text-base font-bold text-slate-950 tracking-tight",
              children: activeView === "main" ? "إعدادات" :
                        activeView === "payment" ? "خيارات الدفع" :
                        activeView === "account" ? "إدارة حسابي" :
                        activeView === "location" ? "الموقع والمحافظات" :
                        activeView === "language" ? "اللغة" :
                        activeView === "currency" ? "عملة الأسعار" : "إعدادات"
            }),
            r.jsx("div", { className: "w-9" })
          ]
        }),

        /* CONTENT BODY */
        r.jsx("div", {
          className: "flex-1 overflow-y-auto",
          children: activeView === "main" ? (
            /* === MAIN LIST VIEW (MATCHING SHEIN SCREENSHOT EXACTLY) === */
            r.jsxs("div", {
              className: "flex flex-col pb-8",
              children: [
                /* User Name Banner - NO QR icon as requested */
                r.jsxs("button", {
                  type: "button",
                  onClick: () => setActiveView("account"),
                  className: "w-full bg-white px-5 py-4 border-b border-slate-100/90 flex items-center justify-between text-right hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group",
                  children: [
                    r.jsx("span", {
                      className: "text-sm font-black tracking-wide text-slate-950 font-sans uppercase truncate",
                      children: displayName
                    }),
                    r.jsx(_a, { className: "w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:-translate-x-0.5" })
                  ]
                }),

                /* Section Divider */
                r.jsx("div", { className: "h-3 bg-[#F6F7F9] border-y border-slate-100/60 shrink-0" }),

                /* Group 1: خيارات الدفع + إدارة حسابي */
                r.jsxs("div", {
                  className: "bg-white",
                  children: [
                    r.jsxs("button", {
                      type: "button",
                      id: "settings-payment-btn",
                      onClick: () => setActiveView("payment"),
                      className: "w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-right cursor-pointer group border-b border-slate-100/80",
                      children: [
                        r.jsx("span", { className: "text-sm font-bold text-slate-800", children: "خيارات الدفع" }),
                        r.jsx(_a, { className: "w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" })
                      ]
                    }),
                    r.jsxs("button", {
                      type: "button",
                      id: "settings-account-btn",
                      onClick: () => setActiveView("account"),
                      className: "w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-right cursor-pointer group",
                      children: [
                        r.jsx("span", { className: "text-sm font-bold text-slate-800", children: "إدارة حسابي" }),
                        r.jsx(_a, { className: "w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" })
                      ]
                    })
                  ]
                }),

                /* Section Divider */
                r.jsx("div", { className: "h-3 bg-[#F6F7F9] border-y border-slate-100/60 shrink-0" }),

                /* Group 2: موقع + اللغة + عملة */
                r.jsxs("div", {
                  className: "bg-white",
                  children: [
                    r.jsxs("button", {
                      type: "button",
                      id: "settings-location-btn",
                      onClick: () => setActiveView("location"),
                      className: "w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-right cursor-pointer group border-b border-slate-100/80",
                      children: [
                        r.jsx("span", { className: "text-sm font-bold text-slate-800", children: "موقع" }),
                        r.jsxs("div", {
                          className: "flex items-center gap-2 text-slate-400 group-hover:text-slate-700",
                          children: [
                            r.jsx("span", { className: "text-xs font-bold text-slate-700", children: t || "صنعاء" }),
                            r.jsx(_a, { className: "w-4 h-4 shrink-0" })
                          ]
                        })
                      ]
                    }),
                    r.jsxs("button", {
                      type: "button",
                      id: "settings-language-btn",
                      onClick: () => setActiveView("language"),
                      className: "w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-right cursor-pointer group border-b border-slate-100/80",
                      children: [
                        r.jsx("span", { className: "text-sm font-bold text-slate-800", children: "اللغة" }),
                        r.jsxs("div", {
                          className: "flex items-center gap-2 text-slate-400 group-hover:text-slate-700",
                          children: [
                            r.jsx("span", { className: "text-xs font-bold text-slate-700", children: "العربية" }),
                            r.jsx(_a, { className: "w-4 h-4 shrink-0" })
                          ]
                        })
                      ]
                    }),
                    r.jsxs("button", {
                      type: "button",
                      id: "settings-currency-btn",
                      onClick: () => setActiveView("currency"),
                      className: "w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-right cursor-pointer group",
                      children: [
                        r.jsx("span", { className: "text-sm font-bold text-slate-800", children: "عملة" }),
                        r.jsxs("div", {
                          className: "flex items-center gap-2 text-slate-400 group-hover:text-slate-700",
                          children: [
                            r.jsx("span", { className: "text-xs font-black text-slate-900 font-mono", children: a || "SAR" }),
                            r.jsx(_a, { className: "w-4 h-4 shrink-0" })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                /* Section Divider */
                r.jsx("div", { className: "h-3 bg-[#F6F7F9] border-y border-slate-100/60 shrink-0" }),

                /* Group 3: التواصل معنا */
                r.jsx("div", {
                  className: "bg-white",
                  children: r.jsxs("button", {
                    type: "button",
                    id: "settings-contact-btn",
                    onClick: () => {
                      e();
                      if (g) {
                        g();
                      } else if (A) {
                        A("جاري فتح خدمة العملاء...", "info");
                      }
                    },
                    className: "w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-right cursor-pointer group border-b border-slate-100/80",
                    children: [
                      r.jsx("span", { className: "text-sm font-bold text-slate-800", children: "التواصل معنا" }),
                      r.jsx(_a, { className: "w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" })
                    ]
                  })
                })
              ]
            })
          ) : activeView === "payment" ? (
            /* === SUBVIEW: خيارات وبيانات الدفع === */
            r.jsxs("div", {
              className: "p-4 space-y-3 animate-fadeIn",
              children: [
                r.jsxs("div", {
                  className: "bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-200/80 text-right",
                  children: [
                    r.jsx("h3", { className: "text-xs font-black text-blue-950", children: "💳 الحسابات المعتمدة لتحويل المبالغ وتأكيد الطلبات" }),
                    r.jsx("p", { className: "text-[11px] text-blue-800 font-medium mt-1 leading-relaxed", children: "يمكنك التحويل لأي من الحسابات أدناه عبر تطبيقك البنكي أو المحفظة الإلكترونية، ثم إرسال إشعار السداد لتجهيز طلبك فوراً." })
                  ]
                }),
                paymentMethods.map(pm => {
                  const isCopied = copiedKey === pm.id;
                  return r.jsxs("div", {
                    className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-2.5",
                    children: [
                      r.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          r.jsxs("div", {
                            className: "flex items-center gap-2.5",
                            children: [
                              r.jsx("div", {
                                className: `w-9 h-9 rounded-xl bg-gradient-to-tr ${pm.iconColor} text-white flex items-center justify-center shadow-xs`,
                                children: r.jsx(Xh, { className: "w-4 h-4 stroke-[2.2]" })
                              }),
                              r.jsxs("div", {
                                className: "text-right",
                                children: [
                                  r.jsx("h4", { className: "text-xs font-black text-slate-900", children: pm.name }),
                                  r.jsx("span", { className: "text-[10px] font-bold text-slate-500", children: pm.badge })
                                ]
                              })
                            ]
                          }),
                          r.jsx("button", {
                            type: "button",
                            onClick: () => copyToClipboard(pm.accountNumber, pm.name, pm.id),
                            className: `px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isCopied ? "bg-emerald-600 text-white shadow-xs scale-105" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`,
                            children: isCopied ? [r.jsx(vs, { className: "w-3.5 h-3.5 stroke-[3]" }), "تم النسخ"] : [r.jsx(mb, { className: "w-3.5 h-3.5 stroke-[2.2]" }), "نسخ"]
                          })
                        ]
                      }),
                      r.jsxs("div", {
                        className: "bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between font-mono",
                        children: [
                          r.jsx("span", { className: "text-xs text-slate-500 font-bold", children: "رقم الحساب:" }),
                          r.jsx("span", { className: "text-sm font-black text-slate-950 tracking-wider", children: pm.accountNumber })
                        ]
                      }),
                      r.jsxs("div", {
                        className: "text-[11px] text-slate-600 flex items-center justify-between font-medium",
                        children: [
                          r.jsx("span", { className: "text-slate-400", children: "باسم:" }),
                          r.jsx("span", { className: "font-bold text-slate-800", children: pm.holderName })
                        ]
                      })
                    ]
                  }, pm.id);
                }),
                r.jsxs("button", {
                  type: "button",
                  onClick: () => {
                    e();
                    if (g) g();
                  },
                  className: "w-full bg-slate-900 hover:bg-black text-white p-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 mt-2",
                  children: [
                    r.jsx(oy, { className: "w-4 h-4 text-rose-400" }),
                    r.jsx("span", { children: "إرسال سند التحويل لخدمة العملاء ←" })
                  ]
                })
              ]
            })
          ) : activeView === "account" ? (
            /* === SUBVIEW: إدارة حسابي === */
            r.jsxs("div", {
              className: "p-4 space-y-3.5 animate-fadeIn",
              children: [
                r.jsxs("div", {
                  className: "bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center",
                  children: [
                    r.jsx("div", {
                      className: "w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center text-xl font-black shadow-sm mb-3",
                      children: u && u.firstName ? u.firstName[0].toUpperCase() : "👤"
                    }),
                    r.jsx("h3", { className: "text-base font-black text-slate-950", children: displayName }),
                    r.jsx("p", { className: "text-xs text-slate-500 font-mono mt-0.5", children: (u && u.phone) || "حساب زائر" }),
                    r.jsx("span", {
                      className: "mt-2.5 px-3 py-1 rounded-full text-[10.5px] font-black bg-slate-100 text-slate-700 border border-slate-200",
                      children: u && u.isAdmin ? "👑 مدير المتجر" : "عميل مميز"
                    })
                  ]
                }),
                r.jsxs("div", {
                  className: "bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 text-right",
                  children: [
                    r.jsxs("div", {
                      className: "flex items-center justify-between pb-2.5 border-b border-slate-100",
                      children: [
                        r.jsx("span", { className: "text-xs text-slate-500 font-bold", children: "محافظة الإقامة والتوصيل" }),
                        r.jsx("span", { className: "text-xs font-black text-slate-900", children: t || "صنعاء" })
                      ]
                    }),
                    r.jsxs("div", {
                      className: "flex items-center justify-between pb-2.5 border-b border-slate-100",
                      children: [
                        r.jsx("span", { className: "text-xs text-slate-500 font-bold", children: "البريد الإلكتروني" }),
                        r.jsx("span", { className: "text-xs font-bold text-slate-700 font-mono", children: (u && u.email) || "غير مسجل" })
                      ]
                    }),
                    r.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        r.jsx("span", { className: "text-xs text-slate-500 font-bold", children: "العملة المفضلة" }),
                        r.jsx("span", { className: "text-xs font-black text-slate-900", children: `${activeCurrencyObj.name} (${activeCurrencyObj.symbol})` })
                      ]
                    })
                  ]
                }),
                u ? (
                  r.jsxs("button", {
                    type: "button",
                    onClick: () => {
                      if (fLogout) fLogout();
                      e();
                    },
                    className: "w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98",
                    children: [
                      r.jsx(yO, { className: "w-4 h-4 stroke-[2.2]" }),
                      r.jsx("span", { children: "تسجيل الخروج من الحساب" })
                    ]
                  })
                ) : (
                  r.jsxs("button", {
                    type: "button",
                    onClick: () => {
                      if (dLogin) dLogin();
                      e();
                    },
                    className: "w-full bg-slate-950 hover:bg-black text-white p-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98",
                    children: [
                      r.jsx(Cb, { className: "w-4 h-4 stroke-[2.2]" }),
                      r.jsx("span", { children: "تسجيل الدخول / إنشاء حساب جديد" })
                    ]
                  })
                )
              ]
            })
          ) : activeView === "location" ? (
            /* === SUBVIEW: الموقع والمحافظات وتغيير السعر حسب المحافظة === */
            r.jsxs("div", {
              className: "p-4 space-y-3 animate-fadeIn",
              children: [
                r.jsxs("div", {
                  className: "bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-right",
                  children: [
                    r.jsxs("div", {
                      children: [
                        r.jsx("h3", { className: "text-xs font-black text-slate-950", children: "📍 اختر محافظة التوصيل في اليمن" }),
                        r.jsx("p", { className: "text-[11px] text-slate-500 font-medium mt-0.5", children: "يتغير السعر وسعر الصرف وتكلفة التوصيل تلقائياً وفورياً بحسب المحافظة المحددة." })
                      ]
                    }),
                    r.jsx("input", {
                      type: "text",
                      value: searchGov,
                      onChange: ev => setSearchGov(ev.target.value),
                      placeholder: "ابحث عن محافظتك (مثال: صنعاء، عدن، تعز، حضرموت)...",
                      className: "w-full h-10 bg-slate-50 rounded-xl px-3 text-xs font-bold text-slate-900 border border-slate-200 focus:outline-hidden focus:border-slate-900 focus:bg-white"
                    }),
                    r.jsxs("div", {
                      className: "flex gap-1.5 pt-1",
                      children: [
                        r.jsx("button", {
                          type: "button",
                          onClick: () => setRegionFilter("all"),
                          className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${regionFilter === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
                          children: "كافة المحافظات"
                        }),
                        r.jsx("button", {
                          type: "button",
                          onClick: () => setRegionFilter("north"),
                          className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${regionFilter === "north" ? "bg-emerald-700 text-white shadow-xs" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`,
                          children: "محافظات الشمال"
                        }),
                        r.jsx("button", {
                          type: "button",
                          onClick: () => setRegionFilter("south"),
                          className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${regionFilter === "south" ? "bg-blue-700 text-white shadow-xs" : "bg-blue-50 text-blue-800 hover:bg-blue-100"}`,
                          children: "محافظات الجنوب"
                        })
                      ]
                    })
                  ]
                }),

                r.jsx("div", {
                  className: "space-y-2",
                  children: filteredGovs.map(gov => {
                    const isSelected = t === gov;
                    const info = GT(gov, l);
                    const isSouth = info.region === "south";
                    return r.jsxs("button", {
                      type: "button",
                      onClick: () => {
                        n(gov);
                        if (A) A(`تم ضبط موقع التوصيل إلى "${gov}" وتحديث كافة الأسعار 📍`, "success");
                        setActiveView("main");
                      },
                      className: `w-full p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-right ${isSelected ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.01]" : "bg-white hover:bg-slate-50 border-slate-200/80"}`,
                      children: [
                        r.jsxs("div", {
                          className: "flex items-center gap-3",
                          children: [
                            r.jsx("div", {
                              className: `w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`,
                              children: r.jsx(Ko, { className: "w-4 h-4 stroke-[2.2]" })
                            }),
                            r.jsxs("div", {
                              children: [
                                r.jsx("h4", { className: `text-xs font-black ${isSelected ? "text-white" : "text-slate-950"}`, children: gov }),
                                r.jsx("p", {
                                  className: `text-[10px] font-medium mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`,
                                  children: isSouth ? "محافظات الجنوب • تسعير الصرف الجنوبي" : "محافظات الشمال • تسعير الصرف الشمالي"
                                })
                              ]
                            })
                          ]
                        }),
                        r.jsxs("div", {
                          className: "flex items-center gap-2",
                          children: [
                            r.jsx("span", {
                              className: `text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : isSouth ? "bg-blue-50 text-blue-800" : "bg-emerald-50 text-emerald-800"}`,
                              children: isSouth ? "جنوب" : "شمال"
                            }),
                            isSelected && r.jsx(vs, { className: "w-4 h-4 text-emerald-400 stroke-[3]" })
                          ]
                        })
                      ]
                    }, gov);
                  })
                })
              ]
            })
          ) : activeView === "language" ? (
            /* === SUBVIEW: اللغة === */
            r.jsxs("div", {
              className: "p-4 space-y-2.5 animate-fadeIn",
              children: [
                r.jsxs("button", {
                  type: "button",
                  onClick: () => {
                    if (A) A("اللغة العربية مفعلة افتراضياً للواجهة", "info");
                    setActiveView("main");
                  },
                  className: "w-full bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-xs flex items-center justify-between text-right cursor-pointer",
                  children: [
                    r.jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [
                        r.jsx("span", { className: "text-2xl", children: "🇾🇪" }),
                        r.jsxs("div", {
                          children: [
                            r.jsx("h4", { className: "text-xs font-black text-slate-950", children: "العربية (Arabic)" }),
                            r.jsx("p", { className: "text-[10.5px] text-slate-500 font-medium mt-0.5", children: "اللغة الرسمية للتطبيق وكافة العروض" })
                          ]
                        })
                      ]
                    }),
                    r.jsx("div", {
                      className: "w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center",
                      children: r.jsx(vs, { className: "w-3.5 h-3.5 stroke-[3]" })
                    })
                  ]
                }),
                r.jsxs("div", {
                  className: "w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-right opacity-60",
                  children: [
                    r.jsxs("div", {
                      className: "flex items-center gap-3",
                      children: [
                        r.jsx("span", { className: "text-2xl", children: "🇬🇧" }),
                        r.jsxs("div", {
                          children: [
                            r.jsx("h4", { className: "text-xs font-black text-slate-800", children: "English" }),
                            r.jsx("p", { className: "text-[10.5px] text-slate-400 font-medium mt-0.5", children: "Coming soon in upcoming release" })
                          ]
                        })
                      ]
                    }),
                    r.jsx("span", { className: "text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md", children: "قريباً" })
                  ]
                })
              ]
            })
          ) : activeView === "currency" ? (
            /* === SUBVIEW: تغيير السعر يمني وسعودي ودولار === */
            r.jsxs("div", {
              className: "p-4 space-y-3 animate-fadeIn",
              children: [
                r.jsxs("div", {
                  className: "bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-right",
                  children: [
                    r.jsx("h3", { className: "text-xs font-black text-slate-950", children: "💱 اختر عملة عرض الأسعار" }),
                    r.jsx("p", { className: "text-[11px] text-slate-500 font-medium mt-0.5", children: "سيتم تحويل كافة أسعار المنتجات في المتجر والسلة فوراً للعملة المختارة." })
                  ]
                }),
                Bm.map(curr => {
                  const isSelected = a === curr.code;
                  const sampleConverted = Ha(100, t, curr.code, l);
                  return r.jsxs("button", {
                    type: "button",
                    onClick: () => {
                      i(curr.code);
                      if (A) A(`تم تحويل عملة الأسعار إلى "${curr.name}" بنجاح 💱`, "success");
                      setActiveView("main");
                    },
                    className: `w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between text-right ${isSelected ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.01]" : "bg-white hover:bg-slate-50 border-slate-200"}` ,
                    children: [
                      r.jsxs("div", {
                        className: "flex items-center gap-3",
                        children: [
                          r.jsx("span", { className: "text-2xl", children: curr.flag }),
                          r.jsxs("div", {
                            children: [
                              r.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  r.jsx("h4", { className: `text-xs font-black ${isSelected ? "text-white" : "text-slate-950"}`, children: curr.name }),
                                  r.jsx("span", {
                                    className: `text-[10px] font-black px-2 py-0.5 rounded-md font-mono ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-800"}`,
                                    children: curr.code
                                  })
                                ]
                              }),
                              r.jsxs("p", {
                                className: `text-[11px] font-bold mt-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`,
                                children: [
                                  "مثال 100 ر.س تظهر بـ: ",
                                  r.jsx("span", { className: isSelected ? "text-amber-300 font-black" : "text-rose-600 font-black", children: sampleConverted.formattedWithSymbol })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      isSelected && r.jsx("div", {
                        className: "w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xs",
                        children: r.jsx(vs, { className: "w-4 h-4 stroke-[3]" })
                      })
                    ]
                  }, curr.code);
                })
              ]
            })
          ) : null
        })
      ]
    })
  });
};
