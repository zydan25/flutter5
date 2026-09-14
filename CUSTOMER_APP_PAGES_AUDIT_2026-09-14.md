# تقرير فحص نسخة Customer App المنشورة على فرع GitHub Pages

التاريخ: 2026-09-14
الفرع: `customer-app-pages-2026-09-14`
المصدر: `backup-before-original-ui-flask-2026-09-14`

## 1. ما تم إنشاؤه

- تم إنشاء فرع مستقل: `customer-app-pages-2026-09-14` انطلاقًا من فرع `backup-before-original-ui-flask-2026-09-14`.
- الفرع يحتفظ بمجلد `customer-app` كما هو، مع تعديل محدود في `customer-app/index.html` لتحويل مسارات ملفات CSS/JS إلى مسارات نسبية مناسبة لموقع GitHub Pages على شكل مشروع.
- تم تعديل سير عمل GitHub Actions ليقوم برفع `customer-app` نفسه كـ Pages artifact بدل استبدال الواجهة بإصدار آخر أو إعادة تصميمها.
- تم إنشاء `customer-app/404.html` أثناء عملية النشر كـ SPA fallback حتى تعمل مسارات الواجهة في بيئة Pages.

## 2. دليل مطابقة الواجهة

ملف `customer-app/index.html` يحدد اللغة العربية والاتجاه RTL، ويستخدم عنوان تطبيق العميل ومتطلبات الخط Cairo. كما يشير إلى نفس حزمة CSS الأساسية وملف JavaScript الرئيسي المستخدمين في نسخة العميل السابقة.

ملف `dist_backup/index.html` في نفس المصدر يحتوي على نفس ملفات الواجهة المجمعة: `assets/index-Co2L1R-b.js` و`assets/index-DqlAnH_M.css`، وهو دليل قوي على أن `customer-app` مبني من نفس عائلة واجهة العميل الأصلية، وليس واجهة جديدة مختلفة.

## 3. المصدر الأصلي للواجهة

المشروع يحتوي على المصدر الكامل في `src/`، ويشمل `src/App.tsx` ومكونات العميل مثل Header وBottomNavigation وProductCard وProductDetailsModal وCartModal وWishlistModal وTrendsView وCategoryModal وOrdersModal وSearchModal وAuthModal وCustomerChatModal.

`src/App.tsx` يدير حالات المنتجات والتصنيفات والبنرات والحملات والمستخدم والسلة، وهو المصدر الذي يمثل منطق واجهة متجر العميل.

## 4. بنية العميل الحالية

الواجهة تشمل وظيفيًا، بحسب المصدر:

- الصفحة الرئيسية وعرض المنتجات.
- التصنيفات.
- تفاصيل المنتج.
- السلة.
- المفضلة.
- الاتجاهات/الحملات.
- البحث.
- الطلبات.
- دردشة العميل/الطلب.
- تسجيل الدخول عبر رقم الهاتف ورمز OTP.
- إكمال الملف الشخصي بعد أول تسجيل.
- وظائف إدارية موجودة في المصدر ولكن يجب التأكد من صلاحية استخدامها من عميل غير إداري.

## 5. الربط مع Flask

`src/api.ts` مضبوط حاليًا على الخادم:
`https://whats.alattab.site`

ويستخدم مسارات Flask v2 التالية:

- `/takhfid/api/v2/auth/send-otp`
- `/takhfid/api/v2/auth/login-verify`
- `/takhfid/api/v2/auth/complete-profile`
- `/takhfid/api/v2/auth/session-revoke`
- `/takhfid/api/v2/auth/me`
- `/takhfid/api/v2/products`
- `/takhfid/api/v2/products/bulk`
- `/takhfid/api/v2/orders`
- `/takhfid/api/v2/orders/{id}/status`
- `/takhfid/api/v2/orders/{id}/chat`
- `/takhfid/api/v2/orders/{id}/chat/messages`
- `/takhfid/api/pricing`
- `/takhfid/admin/api/content`

ويتم إرسال Bearer token تلقائيًا عند وجود جلسة محفوظة.

## 6. ملاحظة مهمة في المصادقة

يوجد في `src/api.ts` دالة `verifyOtpApi()` تشير إلى endpoint قديم/غير متوافق هو `/takhfid/api/v2/auth/verify-otp`، بينما مسار التدفق الحديث يستخدم `login-verify` ثم `complete-profile`. البحث في المستودع لم يجد استخدامًا للدالة `verifyOtpApi`، لذلك لا يبدو أنها مسار التشغيل الحالي، لكنها تمثل كودًا ميتًا يجب حذفه أو تصحيحه لاحقًا حتى لا يبقى مصدر التباس.

## 7. ما تم التحقق منه

### ناجح

- إنشاء الفرع المستقل.
- وجود `customer-app` وملفات build الأساسية داخله.
- صحة بنية HTML الأساسية للعميل.
- وجود CSS وJS المطلوبين داخل `customer-app/assets`.
- ضبط سير GitHub Pages ليستخدم `customer-app` نفسه كـ artifact.
- إعداد SPA fallback في خطوة النشر.
- وجود مصدر React/TypeScript الكامل في `src/`.
- توافق طبقة API الحالية مع مسارات Flask v2 الرئيسية المستخدمة في التطبيق.

### يحتاج اختبارًا حيًا من المتصفح

- التأكد من فتح الصفحة فعليًا بعد نشر GitHub Pages.
- تحميل CSS وJS بدون 404 على رابط المشروع.
- تجربة تسجيل الدخول وإرسال OTP فعليًا.
- إدخال OTP صحيح والتحقق من إنشاء الجلسة.
- تجربة إكمال الملف الشخصي للمستخدم الجديد.
- تحميل المنتجات والمحتوى من Flask داخل الواجهة.
- إنشاء طلب حقيقي وتجربة حالة الطلب.
- اختبار دردشة الطلب.
- اختبار الصور والروابط الخارجية.
- اختبار LocalStorage وPWA في متصفح الهاتف.

## 8. ملاحظات تقنية مهمة

1. `customer-app/index.html` الأصلي كان يستخدم مسارات `/assets/...`، وتم تحويلها إلى `./assets/...` لأن GitHub Pages الخاص بالمستودع يعمل تحت مسار المشروع `/flutter5/`.
2. نسخة `customer-app` ثابتة ومبنية مسبقًا؛ لذلك فحصها يثبت الواجهة المجمعة، بينما أي إصلاحات منطقية مستقبلية ينبغي تنفيذها في `src/` ثم إعادة البناء بدل تعديل JavaScript المضغوط يدويًا.
3. ملف `vite.config.ts` في المصدر يحتوي أصلًا على `base: '/flutter5/'` عندما يعمل داخل GitHub Actions، وهو المسار الصحيح لعمليات build المستقبلية.
4. `package.json` يبين أن المشروع React/Vite/Tailwind وليس Flutter.

## 9. الخلاصة

الفرع `customer-app-pages-2026-09-14` أصبح فرع اختبار مستقل مخصص لنشر `customer-app` نفسه على GitHub Pages، دون استبداله بواجهة أخرى.

الواجهة المصدرية الأصلية موجودة في `src/`، والنسخة المجمعة للعميل موجودة في `customer-app/`. لذلك يمكن اعتماد هذا الفرع كخط أساس لاختبار مطابقة الواجهة قبل إعادة دمج أي إصلاحات Flask في `main`.

حالة الفحص الحالية: **البنية والملفات والربط البرمجي تم التحقق منها؛ التحقق الحي النهائي يعتمد على نجاح تشغيل GitHub Pages وفتح الموقع من متصفح فعلي وتنفيذ سيناريوهات المستخدم.**
