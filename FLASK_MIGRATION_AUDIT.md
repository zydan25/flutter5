# تقرير فحص مشروع `flutter5` — خط الأساس قبل تحويل Firebase إلى Flask

**تاريخ الفحص:** 2026-09-14
**المصدر المفحوص:** ملف `التخفيض-الصح (5).zip`
**حالة الأرشيف:** 117 ملفًا، الحجم التقريبي 15 MB بعد فك الضغط.

## 1. ملخص تنفيذي

المشروع الحالي هو تطبيق متجر React/TypeScript/Vite عربي، ويحتوي على نسختين واضحتين من الواجهة:

- تطبيق العميل: `src/customer-app/`
- تطبيق الإدارة: `src/admin-app/`
- إضافة إلى نسخة قديمة/موحدة في `src/`.

النسخة المرفوعة تعتمد على Firebase/Firestore بشكل مباشر في المصادقة/تسجيل بيانات العملاء، حفظ الطلبات، تحديث حالات الطلبات، قراءة العملاء، وحذف العملاء. ولا يوجد Backend Flask داخل هذا المشروع نفسه.

المحادثة الحالية ليست محادثة داخلية محفوظة: واجهة `CustomerChatModal` تفتح واتساب/اتصال هاتفي فقط.

المنتجات والمحتوى والبنرات والحملات والتصنيفات والتسعير تعتمد في الأساس على بيانات ثابتة داخل `src/data` و`src/shared/data`، مع تخزين محلي لبعض الحالة عبر `localStorage`، وليس على قاعدة بيانات مركزية.

## 2. حالة Firebase

### ملفات مرتبطة مباشرة بـ Firebase

- `src/firebase.ts`
- `src/shared/firebase.ts`
- `shared/firebase/index.ts`
- `src/components/AuthModal.tsx`
- `src/customer-app/components/AuthModal.tsx`
- `src/components/CartModal.tsx`
- `src/customer-app/components/CartModal.tsx`
- `src/components/AdminModal.tsx`
- `src/admin-app/components/AdminModal.tsx`

### عمليات Firestore الموجودة

1. إنشاء/تحديث العميل في مجموعة `users`.
2. حذف عميل من `users`.
3. إنشاء/تحديث الطلب في `orders`.
4. تحديث حالة الطلب و`isPaid`.
5. قراءة جميع العملاء.
6. قراءة جميع الطلبات.

كما توجد إعدادات Firebase ثابتة داخل الشيفرة، لذلك الاعتماد ليس مجرد حزمة npm غير مستخدمة، بل اتصال فعلي بـ Firestore.

## 3. العملاء والمصادقة

### الوضع الحالي

`AuthModal` ينشئ كائن المستخدم محليًا، ويحدد صلاحية الإدارة بواسطة أرقام هواتف مكتوبة داخل الواجهة، ثم يستدعي `syncUserToFirestore()`.

المستخدم يتم الاحتفاظ به أيضًا في `localStorage` باسم `altakhfid_user`.

### ما يجب تحويله إلى Flask

- إنشاء جلسة/توثيق حقيقي من Flask.
- OTP أو آلية الدخول الموجودة في مشروع Flask السابق.
- جدول `customers` أو `takhfid_customers`.
- Access Token/JWT أو token session من Flask.
- صلاحية الإدارة يجب أن تأتي من الخادم، وليس من قائمة أرقام داخل JavaScript.
- GET/PATCH للملف الشخصي.

### خطورة حالية

صلاحية الإدارة معروفة في JavaScript من خلال أرقام الهواتف، ويمكن اعتبار ذلك تحكم صلاحيات على جهة العميل فقط؛ يجب نقل القرار بالكامل للخادم.

## 4. المنتجات

### الوضع الحالي

المنتجات الأساسية موجودة كبيانات ثابتة داخل:

- `src/data/products.ts`
- `src/shared/data/products.ts`

ويجري حفظ نسخة محلية أحيانًا داخل `localStorage` باسم `altakhfid_products`.

لا يوجد في النسخة المفحوصة CRUD فعلي دائم للمنتجات على خادم مركزي.

### ما يجب في Flask

- جدول منتجات.
- CRUD للمنتجات.
- حالة المخزون والكمية.
- التصنيفات والوسوم.
- الأسعار والخصومات.
- الصور من خلال upload حقيقي إلى Flask.
- API عام لقراءة المنتجات.
- API إداري للإنشاء والتعديل والحذف.

## 5. الطلبات

### الوضع الحالي

`CartModal` ينشئ الطلب ثم يكتب مباشرة إلى Firestore عبر `saveOrderToFirestore()`.

كما تحفظ الواجهة الطلبات محليًا في `localStorage` باسم `altakhfid_orders`.

`AdminModal` يعدّل حالات الطلبات مباشرة على Firestore عبر `updateOrderStatusInFirestore()`.

### ما يجب نقله إلى Flask

- `POST /takhfid/api/v2/orders`
- `GET /takhfid/api/v2/orders`
- `GET /takhfid/api/v2/orders/<id>`
- `PATCH /takhfid/api/v2/orders/<id>/status`
- منع العميل من تعديل أي حقل حساس مثل السعر النهائي أو حالة الدفع.
- حساب الإجمالي والتوصيل على الخادم.

## 6. المحادثات

المشروع الحالي لا يحتوي على نظام محادثة داخلي محفوظ في قاعدة البيانات.

`CustomerChatModal` عبارة عن واجهة دعم تعرض أرقام واتساب واتصال هاتفي وروابط `wa.me` و`tel:`.

إذن عند تحويله إلى Flask نحتاج أولًا إلى تحديد هل المطلوب:

- إبقاء الدعم عبر WhatsApp فقط، أو
- بناء Chat داخلي لكل طلب مع رسائل وصور وإيصالات دفع.

إذا كان المطلوب نفس نظام المشروع السابق، فالأفضل بناء نموذج `TakhfidChatMessage` مرتبطًا بالطلب، وواجهات GET/POST، ورفع صور وإيصالات إلى Flask.

## 7. الصور والوسائط

النسخة المفحوصة لا تحتوي على نظام رفع صور مركزي إلى الخادم.

كثير من الصور الحالية موجودة كرابط خارجي داخل ملفات البيانات، مثل صور Unsplash في:

- `src/data/banners.ts`
- `src/data/trends.ts`
- بيانات المنتجات والتصنيفات.

في النسخة Flask يجب استبدال ذلك بـ:

- رفع multipart/form-data.
- تحقق من امتداد وحجم الملف.
- اسم ملف عشوائي.
- تخزين على الخادم.
- URL عام من Flask.
- حذف الملف عند حذف الصورة/العنصر عند الحاجة.

## 8. المحتوى

البنرات والحملات والترندات والتصنيفات تعتمد حاليًا على `INITIAL_*` داخل ملفات TypeScript.

هذا يعني أن تغيير المحتوى يتطلب تعديل/إعادة بناء الواجهة، وليس إدارة مركزية من لوحة Flask.

### المطلوب

إنشاء API للمحتوى:

- categories
- banners
- campaigns
- hashtags
- أي نصوص/إعلانات عامة مستقبلًا

ثم تحميلها عند فتح التطبيق بدل `INITIAL_*` كالمصدر الرئيسي.

## 9. التسعير

التسعير الحالي موزع بين:

- `src/data/governorates.ts`
- `src/shared/data/governorates.ts`
- `src/utils/pricing.ts`
- `src/shared/utils/pricing.ts`

وفيه قيم صرف وتوصيل وmarkup ثابتة داخل الواجهة.

### المشكلة

يمكن أن يرى العميل قيمًا مختلفة إذا تغيرت إعدادات المتجر، ولا توجد نقطة حقيقة واحدة server-side.

### المطلوب في Flask

جدول إعدادات/أسعار حسب المحافظة والمنطقة، يتضمن:

- SAR/YER
- USD/YER
- markup
- shipping/delivery
- free delivery
- notes
- active

ويقوم Flask بحساب السعر النهائي عند الحاجة، وليس المتصفح وحده.

## 10. التطبيق الإداري

يوجد:

- `src/admin-app/AdminApp.tsx`
- `src/admin-app/components/AdminModal.tsx`
- نسخة أخرى من الإدارة في `src/components/AdminModal.tsx`.

هذه الازدواجية يجب حسمها قبل التحويل النهائي حتى لا نصلح واجهة ونترك أخرى تعتمد على Firebase.

## 11. تعدد النسخ

المشروع يحتوي على تكرار واضح في:

- `src/components/*`
- `src/customer-app/components/*`
- `src/admin-app/components/*`
- `src/data/*`
- `src/shared/data/*`

ينصح بعد التحويل باختيار معماري واضح:

`customer-app` = عميل فقط

`admin-app` = إدارة فقط

`shared` = types + API client + shared utilities

ولا توجد وظائف Firebase داخل `shared` بعد انتهاء الترحيل.

## 12. اعتماد npm

`package.json` يحتوي على:

- `firebase` — يجب حذفه بعد انتهاء الترحيل، ما لم نقرر استخدام Firebase فقط لـ FCM.
- React 19
- Vite
- Tailwind 4
- lucide-react
- html2canvas
- sharp

## 13. فحص البناء

تمت محاولة تشغيل:

`npm run build`

لكن `node_modules` غير موجودة في الأرشيف المفحوص، ولذلك ظهر `vite: not found`.

إذًا لم يكن ممكنًا إجراء Build حقيقي على هذه البيئة دون تثبيت dependencies.

## 14. خطة التحويل المقترحة

### المرحلة 1 — البنية

- إضافة Flask API client إلى الواجهة.
- إضافة auth/token.
- إزالة الاستدعاءات المباشرة من `firebase.ts`.

### المرحلة 2 — العملاء

- OTP/login في Flask.
- profile.
- admin customers.
- إزالة Firestore users بالكامل.

### المرحلة 3 — المنتجات

- Flask products CRUD.
- ربط العميل بمنتجات Flask.
- إزالة البيانات الثابتة كمصدر رئيسي.

### المرحلة 4 — الطلبات

- create/list/detail/status.
- حساب السعر على Flask.
- إزالة Firestore orders.

### المرحلة 5 — الصور

- upload API.
- product images.
- banners/campaign images.
- payment proofs عند الحاجة.

### المرحلة 6 — المحتوى والتسعير

- API للمحتوى.
- API للتسعير.
- إزالة governorate pricing الثابت من العميل كمصدر الحقيقة.

### المرحلة 7 — المحادثات

- chat per order.
- messages.
- attachments/payment proof.

### المرحلة 8 — إزالة Firebase

- إزالة imports.
- إزالة `firebase.ts` و`shared/firebase`.
- إزالة dependency `firebase` من package.json.
- الإبقاء على FCM فقط إذا كان مطلوبًا للإشعارات.

## 15. النتيجة النهائية المستهدفة

بعد الترحيل يجب أن تكون القاعدة:

**Flask هو مصدر الحقيقة لكل شيء:**

- العملاء
- المصادقة
- المنتجات
- الطلبات
- حالات الطلبات
- المحادثات
- الصور والملفات
- المحتوى
- التسعير

وFirebase، إن بقي، يكون مخصصًا للإشعارات FCM فقط.

## 16. ملاحظة مهمة حول رفع المشروع إلى GitHub

تم فحص الملف المرفوع بالكامل من حيث البنية والشيفرة، وتم أيضًا التحقق من أن `flutter5/main` موجود حاليًا وله محتوى مستقل.

لم يتم تنفيذ حذف `main` أو استبداله بنسخة ناقصة من الأرشيف، لأن قناة GitHub المتاحة هنا تسمح بإنشاء commits وblobs، لكنها لا توفر تمرير مسار الملف المحلي المرفوع مباشرة إلى Git كعملية push كاملة. لذلك كان حذف المستودع الحالي دون القدرة على رفع جميع الملفات الثنائية/النصية بنفس اللحظة سيترك المستودع ناقصًا.

هذا قرار مقصود لتجنب إتلاف `flutter5` الحالي قبل وجود نسخة كاملة قابلة للتشغيل.
