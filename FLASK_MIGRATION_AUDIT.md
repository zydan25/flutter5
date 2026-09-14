# تقرير فحص وإصلاح flutter5 — خطة الانتقال من Firebase إلى Flask

التاريخ: 2026-09-14
الفرع: `main`
المستودع: `zydan25/flutter5`

## 1) الحالة الحالية

تم فك المشروع المرفوع بنجاح داخل `flutter5` عن طريق GitHub Actions. المستودع الحالي يحتوي على:

- تطبيق عميل رئيسي: `src/App.tsx`.
- نسخة عميل ثانية مكررة: `src/customer-app/`.
- تطبيق إدارة مستقل: `src/admin-app/`.
- نسخ build جاهزة مسبقاً داخل `customer-app/` و`admin-app/` و`public/` و`dist_backup/`.
- ملفات Firebase القديمة: `src/firebase.ts` و`src/shared/firebase.ts` و`shared/firebase/index.ts`.
- ملفات إعداد Firestore: `firestore.rules` و`firebase-blueprint.json` و`firebase-applet-config.json`.

## 2) نتائج الفحص

### Firebase / Firestore — حرج

Firebase مستخدم فعلياً داخل الشيفرة وليس مجرد اعتماد:

1. `src/firebase.ts` يهيئ Firebase وFirestore ويحدد مشروع Firebase وقاعدة Firestore باسم قاعدة مخصصة.
2. `src/components/CartModal.tsx` ونسختها داخل `src/customer-app/` تحفظ الطلبات مباشرة في Firestore.
3. `src/components/AuthModal.tsx` ونسختها داخل `src/customer-app/` تحفظ العميل مباشرة في Firestore.
4. `src/components/AdminModal.tsx` ونسختها داخل `src/admin-app/` تقرأ العملاء من Firestore وتحذفهم وتعدل حالات الطلبات عبر Firestore.
5. `shared/firebase/index.ts` و`src/shared/firebase.ts` يعيدان تصدير Firebase القديمة.
6. `package.json` ما زال يحتوي على `firebase` و`bun.lock` يحتوي حزم Firebase.

**القرار:** لا يتم حذف Firebase من المشروع حتى يتم نقل الوظائف الأربع الأساسية إلى Flask والتحقق منها، ثم تزال المكتبة والملفات القديمة في مرحلة تنظيف نهائية.

### بيانات ثابتة يجب نقلها إلى Flask

يوجد تخزين محلي وبيانات ثابتة داخل:

- `src/data/products.ts`
- `src/data/categories.ts`
- `src/data/banners.ts`
- `src/data/trends.ts`
- `src/data/governorates.ts`
- `src/utils/pricing.ts`

المنتجات والتصنيفات والبنرات والحملات والتسعير يجب أن تصبح بيانات خادم، بينما تبقى القيم الثابتة فقط كـfallback أثناء التحويل.

### التسعير — حرج وظيفياً

التطبيق يحسب رسوم الشحن وسعر المنتج محلياً، ويوجد معدل صرف افتراضي ثابت وقواعد محافظة داخل الواجهة.

**القرار:** Flask يصبح المصدر الوحيد للتسعير، مع endpoint عام للقراءة وendpoints إدارية للحفظ.

### المصادقة — حرج

المصادقة الحالية ليست مصادقة خادمية حقيقية؛ النموذج ينشئ `uid` محلياً ويحدد المدير اعتماداً على رقم الهاتف ثم يحفظ المستخدم في Firestore.

**القرار:** استخدام مسار Flask OTP الموجود في مشروع Flask المشترك:

- إرسال OTP
- تحقق OTP
- access token
- `/me`
- logout
- صلاحية admin من الخادم، وليس من الواجهة.

### الطلبات — حرج

الطلب يتم إنشاؤه في المتصفح ثم حفظه في Firestore، والحالة تُدار من لوحة الإدارة عبر Firestore.

**القرار:**

- إنشاء الطلب: Flask
- قراءة الطلبات: Flask
- تحديث الحالة: Flask
- التحقق من المستخدم والصلاحيات: Flask
- حساب السعر النهائي: Flask

يجب ألا يكون `localStorage` مصدراً للحقيقة؛ يستخدم فقط cache واجهة.

### الصور — يحتاج إعادة تنظيم

الصور الحالية تأتي من البيانات الثابتة/المخرجات السابقة ولا يوجد نظام موحد لرفع صور الإدارة إلى خادم Flask.

**القرار:** رفع الصور إلى Flask وتخزين URL أو media path فقط في قاعدة البيانات. لا يتم تخزين ملفات الصور داخل GitHub Pages.

### المحادثات — غير مكتملة كمنظومة خادمية

`CustomerChatModal` الحالي هو شاشة دعم ثابتة وروابط واتساب/اتصال، وليس نظام محادثة خادمي بين العميل والإدارة.

**القرار:** نقل محادثات الطلب إلى Flask API، مع polling أو Socket.IO لاحقاً حسب البنية الموجودة في الخادم.

## 3) مشكلة بنيوية مهمة

هناك ثلاث واجهات متداخلة:

- `src/App.tsx`
- `src/customer-app/App.tsx`
- `src/admin-app/AdminApp.tsx`

وتوجد نسخ متكررة من المكونات.

**الخطة:**

- `src/` = الواجهة العميلية الأساسية التي يتم نشرها على GitHub Pages.
- `src/admin-app/` = مصدر لوحة الإدارة، ويرتبط مباشرة بـFlask أو يفتح لوحة Flask الكاملة.
- `src/customer-app/` = يدمج أو يحذف بعد التأكد أن النسخة الرئيسية هي المصدر الوحيد لتطبيق العميل.
- مجلدات build (`customer-app/`, `admin-app/`, `dist_backup/`) لا تعتبر مصادر تطوير.

## 4) إصلاح GitHub Pages الذي تم تنفيذه

تم إنشاء:

`.github/workflows/deploy-pages.yml`

ويقوم بـ:

1. Checkout.
2. تثبيت Bun.
3. `bun install --frozen-lockfile`.
4. `bun run build`.
5. إنشاء `404.html` من `index.html` لدعم SPA على GitHub Pages.
6. رفع artifact.
7. النشر بواسطة `actions/deploy-pages`.

كما تم إصلاح `vite.config.ts` ليستخدم:

`/flutter5/`

عند البناء داخل GitHub Actions، مع `/` أثناء التطوير المحلي.

## 5) خارطة نقل Firebase → Flask

### المرحلة A — تجهيز الواجهة

- API client واحد في `src/api.ts`.
- token في `localStorage` فقط كجلسة واجهة.
- عدم استدعاء Firestore من أي component.
- كل العمليات تمر عبر Flask.

### المرحلة B — العملاء والمصادقة

توصيل:

- `send-otp`
- `verify-otp`
- `auth/me`
- `logout`
- profile GET/PUT
- admin customers GET/DELETE

ثم إزالة `syncUserToFirestore` نهائياً.

### المرحلة C — المنتجات والمحتوى

توصيل:

- المنتجات GET/POST/DELETE
- التصنيفات
- البنرات
- الحملات
- رفع الصور

والاحتفاظ بالبيانات المحلية كـfallback مؤقت فقط.

### المرحلة D — الطلبات

استبدال:

`saveOrderToFirestore`

بـ:

`POST /takhfid/api/v2/orders`

ثم:

- GET orders
- GET order
- PATCH status
- bulk operations عند الحاجة

### المرحلة E — التسعير

نقل:

- SAR/YER
- USD/YER
- markup
- delivery fee
- free shipping
- المنطقة/المحافظة

إلى Flask، وتصبح الواجهة مستهلكاً للبيانات فقط.

### المرحلة F — المحادثات والصور

- chat messages في Flask.
- payment proof في Flask.
- media upload في Flask.
- عدم تخزين ملفات المستخدم في GitHub Pages.

### المرحلة G — إزالة Firebase

بعد نجاح الاختبارات:

- حذف imports من كل TS/TSX.
- حذف `src/firebase.ts`.
- حذف `src/shared/firebase.ts`.
- حذف `shared/firebase/`.
- إزالة `firebase` من `package.json`.
- تحديث `bun.lock`.
- إبقاء Firebase فقط لو كانت هناك حاجة مؤكدة إلى FCM للإشعارات، وليس Firestore/Auth/Storage.

## 6) اختبارات قبول مطلوبة قبل اعتبار النقل ناجحاً

- تسجيل عميل جديد عبر OTP.
- تسجيل خروج وإعادة فتح الصفحة واستعادة الجلسة.
- إنشاء طلب من عميل حقيقي.
- ظهور الطلب في لوحة الإدارة.
- تغيير حالة الطلب وظهورها عند العميل.
- إضافة/تعديل/حذف منتج من لوحة الإدارة.
- رفع صورة منتج من الهاتف وعرضها.
- تعديل البنرات/الحملات/التصنيفات وعرضها للعميل.
- تعديل سعر الصرف والتسعير وعكسه فوراً في العميل.
- إرسال/قراءة محادثة مرتبطة بطلب.
- عدم وجود أي قراءة أو كتابة Firestore من المتصفح.
- `firebase` غير موجود في الشيفرة التنفيذية بعد مرحلة التنظيف.
- نجاح GitHub Pages build.

## 7) ملاحظات تقنية يجب إصلاحها أثناء التحويل

1. توجد نسخ build كبيرة داخل المستودع؛ الأفضل عدم اعتبارها مصدر الشيفرة.
2. يوجد `__pycache__` داخل المستودع، ويجب ألا يبقى في النسخة النهائية.
3. توجد ملفات Firebase config/rules في الجذر؛ تبقى مؤقتاً للتوثيق ثم تحذف بعد نجاح النقل.
4. بعض المكونات تستخدم `localStorage` كمصدر بيانات دائم؛ يجب تقليله إلى cache فقط.
5. بعض components تستخدم hooks بعد `if (!isOpen) return null`، وهذا يجب إصلاحه عند تنظيف الواجهة لأنه يخالف قواعد React Hooks.
6. `CustomerChatModal` الحالي ليس chat backend حقيقياً.

## 8) الحالة بعد هذا التدقيق

- فك المشروع: ناجح.
- فحص البنية: مكتمل.
- تحديد نقاط Firebase: مكتمل.
- تجهيز GitHub Pages workflow: منفذ.
- إصلاح Vite base لـGitHub Pages: منفذ.
- تحويل Firebase إلى Flask بالكامل: **لم يكتمل بعد**؛ يجب تنفيذ المراحل A→G واختبار كل مرحلة قبل حذف Firebase.

## 9) المصدر المستهدف للـbackend

سيُربط المشروع بنفس بنية Flask المستخدمة في مشروع `waseliyat`، وعلى الواجهة استخدام API أساسه:

`https://whats.alattab.site`

مع الحفاظ على GitHub Pages للواجهة فقط، وFlask للعملاء/المنتجات/الطلبات/المحتوى/التسعير/المحادثات/الصور.
