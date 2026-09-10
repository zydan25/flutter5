import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_controller.dart';
import '../models/models.dart';
import '../widgets/common.dart';
import 'screen_common.dart';
import 'reference_account.dart';

class StoreView extends StatefulWidget {
  const StoreView({super.key});
  @override State<StoreView> createState() => _StoreViewState();
}
class _StoreViewState extends State<StoreView> {
  final search = TextEditingController();
  final cart = <int, int>{};
  final favorites = <int>{};
  String? category;

  final List<String> defaultCategories = const [
    'الكل', 'رجالي', 'نسائي', 'إلكترونيات', 'عطور ومكياج', 'أحذية وحقائب', 'ساعات ونظارات'
  ];

  @override void dispose() { search.dispose(); super.dispose(); }

  @override Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    final q = search.text.trim().toLowerCase();
    final products = app.products.where((p) {
      final text = '${p.name} ${p.brand} ${p.vendorName} ${p.categories.join(' ')}'.toLowerCase();
      final matchesCat = category == null || category == 'الكل' || p.categories.contains(category);
      return (q.isEmpty || text.contains(q)) && matchesCat;
    }).toList();

    num total = 0;
    int totalCartCount = 0;
    for (final entry in cart.entries) {
      final list = app.products.where((p) => p.id == entry.key).toList();
      if (list.isNotEmpty) total += (list.first.salePrice ?? list.first.price) * entry.value;
      totalCartCount += entry.value;
    }

    final catList = app.categories.isNotEmpty
        ? ['الكل', ...app.categories.map((c) => '${c['name'] ?? c['title'] ?? ''}')]
        : defaultCategories;

    return ScreenFrame(
      title: 'متجر شبيك | سوق بلس',
      color: AppColors.emerald,
      actions: [
        IconButton(
          onPressed: () => _openCartSheet(context, app),
          icon: Badge(
            isLabelVisible: totalCartCount > 0,
            label: Text('$totalCartCount', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
            backgroundColor: AppColors.burgundy,
            child: const Icon(Icons.shopping_cart_outlined),
          ),
          tooltip: 'سلة المشتريات',
        ),
        IconButton(
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersDetailView())),
          icon: const Icon(Icons.receipt_long_rounded),
          tooltip: 'طلباتي',
        ),
        IconButton(onPressed: app.refreshAll, icon: const Icon(Icons.refresh_rounded)),
      ],
      child: RefreshIndicator(
        color: AppColors.emerald,
        onRefresh: app.refreshAll,
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            SizedBox(height: 116, child: PageView(children: const [
              _StoreBanner(title: 'تخفيضات كبرى في سوق شبيك', subtitle: 'خصومات حصرية حتى 40% على الملابس والإلكترونيات', tag: 'عرض الأسبوع', colors: [AppColors.burgundy, Color(0xFFBE185D)]),
              _StoreBanner(title: 'شحن سريع لكافة المحافظات', subtitle: 'صنعاء، إب، عدن، تعز • توصيل شبيك المباشر', tag: 'توصيل شبيك', colors: [Color(0xFF1D4ED8), Color(0xFF312E81)]),
              _StoreBanner(title: 'كاش باك 5% للمشتريات', subtitle: 'استرجع نقاطاً فورية في محفظتك الرقمية', tag: 'كاش باك', colors: [Color(0xFF047857), Color(0xFF065F46)]),
            ])),
            const SizedBox(height: 10),
            PageCard(child: TextField(controller: search, onChanged: (_) => setState(() {}), decoration: const InputDecoration(prefixIcon: Icon(Icons.search_rounded, color: AppColors.emerald), hintText: 'ابحث في المنتجات، الماركات، أو المتاجر...', isDense: true, border: InputBorder.none))),
            const SizedBox(height: 10),
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: catList.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (_, i) {
                  final name = catList[i];
                  final active = (category == null && name == 'الكل') || category == name;
                  return ChoiceChip(
                    selected: active,
                    selectedColor: AppColors.emerald,
                    label: Text(name, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: active ? Colors.white : AppColors.muted)),
                    onSelected: (_) => setState(() => category = name == 'الكل' ? null : name),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            RefSection(
              title: 'المنتجات المميزة',
              icon: Icons.shopping_bag_rounded,
              color: AppColors.emerald,
              action: TextButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CategoriesFlutterScreen())), child: const Text('كافة التصنيفات', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900))),
            ),
            const SizedBox(height: 8),
            if (products.isEmpty) const EmptyState(text: 'لا توجد منتجات مطابقة لطلبك حالياً.', icon: Icons.inventory_2_outlined),
            if (products.isNotEmpty) GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: products.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: .66),
              itemBuilder: (_, i) {
                final p = products[i];
                final qty = cart[p.id] ?? 0;
                final fav = favorites.contains(p.id);
                return StoreProductCard(
                  product: p,
                  quantity: qty,
                  favorite: fav,
                  onFavorite: () => setState(() => fav ? favorites.remove(p.id) : favorites.add(p.id)),
                  onAdd: () => setState(() => cart[p.id] = qty + 1),
                  onRemove: qty == 0 ? null : () => setState(() => qty <= 1 ? cart.remove(p.id) : cart[p.id] = qty - 1),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailView(product: p, onAdd: () => setState(() => cart[p.id] = qty + 1)))),
                );
              },
            ),
            if (app.vendors.isNotEmpty) ...[
              const SizedBox(height: 14),
              const RefSection(title: 'المتاجر والوكلاء المعتمدون', icon: Icons.storefront_rounded, color: AppColors.emerald),
              const SizedBox(height: 8),
              SizedBox(
                height: 90,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: app.vendors.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    final vendor = app.vendors[i];
                    return InkWell(
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => StoreProfileView(vendor: vendor))),
                      child: PageCard(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const CircleAvatar(radius: 18, backgroundColor: Color(0xFFECFDF5), child: Icon(Icons.storefront_rounded, color: AppColors.emerald, size: 20)),
                            const SizedBox(height: 4),
                            Text('${vendor['store_name'] ?? vendor['name'] ?? 'متجر'}', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
            const SizedBox(height: 82),
          ],
        ),
      ),
      bottomSheet: cart.isEmpty ? null : SafeArea(child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, -3))]),
        child: Row(children: [
          Expanded(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$totalCartCount منتجات في السلة', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
            Text(money(total), style: const TextStyle(fontSize: 14, color: AppColors.burgundy, fontWeight: FontWeight.w900)),
          ])),
          FilledButton.icon(
            onPressed: () => _openCartSheet(context, app),
            style: FilledButton.styleFrom(backgroundColor: AppColors.emerald, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10)),
            icon: const Icon(Icons.shopping_bag_checkout_rounded, size: 18),
            label: const Text('عرض السلة والدفع', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ]),
      )),
    );
  }

  void _openCartSheet(BuildContext context, AppController app) {
    if (cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('سلة المشتريات فارغة')));
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          num cartTotal = 0;
          final cartItems = <Map<String, dynamic>>[];
          for (final entry in cart.entries) {
            final list = app.products.where((p) => p.id == entry.key).toList();
            if (list.isNotEmpty) {
              final prod = list.first;
              final pPrice = prod.salePrice ?? prod.price;
              cartTotal += pPrice * entry.value;
              cartItems.add({'product': prod, 'qty': entry.value});
            }
          }

          return Container(
            height: MediaQuery.of(context).size.height * 0.78,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.shopping_cart_rounded, color: AppColors.emerald),
                          SizedBox(width: 8),
                          Text('سلة مشتريات سوق شبيك', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                        ],
                      ),
                      IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded)),
                    ],
                  ),
                ),
                const Divider(height: 1),
                // Items List
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(14),
                    itemCount: cartItems.length,
                    separatorBuilder: (_, __) => const Divider(height: 16),
                    itemBuilder: (_, i) {
                      final item = cartItems[i];
                      final Product prod = item['product'];
                      final int qty = item['qty'];
                      final price = prod.salePrice ?? prod.price;
                      return Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: SizedBox(
                              width: 54,
                              height: 54,
                              child: prod.image != null && prod.image!.isNotEmpty
                                  ? Image.network(absoluteUrl(prod.image!), fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image_outlined))
                                  : const Icon(Icons.image_outlined),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(prod.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                                Text(money(price, prod.currency), style: const TextStyle(fontSize: 11, color: AppColors.burgundy, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                onPressed: () {
                                  setState(() {
                                    if (qty <= 1) {
                                      cart.remove(prod.id);
                                    } else {
                                      cart[prod.id] = qty - 1;
                                    }
                                  });
                                  setModalState(() {});
                                },
                                icon: const Icon(Icons.remove_circle_outline_rounded, size: 20),
                              ),
                              Text('$qty', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                              IconButton(
                                onPressed: () {
                                  setState(() => cart[prod.id] = qty + 1);
                                  setModalState(() {});
                                },
                                icon: const Icon(Icons.add_circle_rounded, color: AppColors.emerald, size: 20),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                ),
                // Bottom Checkout Controls
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: const Color(0xFFF8FAFC), border: Border(top: BorderSide(color: Colors.black.withOpacity(0.06)))),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('إجمالي الطلب:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                          Text(money(cartTotal), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.burgundy)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      FilledButton(
                        onPressed: () async {
                          Navigator.pop(ctx);
                          await checkout(context);
                        },
                        style: FilledButton.styleFrom(backgroundColor: AppColors.emerald, minimumSize: const Size(double.infinity, 44)),
                        child: const Text('تأكيد الطلب والدفع من المحفظة', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> checkout(BuildContext context) async {
    final app = context.read<AppController>();
    if (app.addresses.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('يرجى إضافة عنوان توصيل من حسابك أولاً لإتمام الشحن.')));
      return;
    }
    try {
      final items = cart.entries.map((e) => <String, dynamic>{'product_id': e.key, 'quantity': e.value}).toList();
      await app.api.cartCalculate(items, cityId: int.tryParse('${app.addresses.first['city_id'] ?? ''}'));
      final order = await app.api.createOrder(items: items, shippingAddress: Map<String, dynamic>.from(app.addresses.first), paymentMethod: 'wallet');
      setState(cart.clear);
      await app.refreshAll();
      if (context.mounted) {
        await showDialog<void>(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: AppColors.emerald),
                SizedBox(width: 8),
                Text('تم إنشاء الطلب بنجاح!'),
              ],
            ),
            content: Text('رقم الطلب الخاص بك: #${order['order_number'] ?? order['id'] ?? 'SHK-892'}\nسيتم إشعارك فور تجهيز الشحنة للشحن.', style: const TextStyle(fontSize: 12)),
            actions: [
              FilledButton(
                onPressed: () => Navigator.pop(context),
                style: FilledButton.styleFrom(backgroundColor: AppColors.emerald),
                child: const Text('متابعة التسوق'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }
}

class _StoreBanner extends StatelessWidget {
  const _StoreBanner({required this.title, required this.subtitle, required this.tag, required this.colors});
  final String title, subtitle, tag; final List<Color> colors;
  @override Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(gradient: LinearGradient(colors: colors), borderRadius: BorderRadius.circular(20)), child: Stack(children: [Positioned(top: 0, left: 0, child: RefPill(tag, color: Colors.white)), Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)), const SizedBox(height: 5), Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.w700))])]));
}

class StoreProductCard extends StatelessWidget {
  const StoreProductCard({super.key, required this.product, required this.quantity, required this.favorite, required this.onFavorite, required this.onAdd, required this.onRemove, required this.onTap});
  final Product product; final int quantity; final bool favorite; final VoidCallback onFavorite, onAdd, onTap; final VoidCallback? onRemove;
  @override Widget build(BuildContext context) {
    final image = absoluteUrl(product.image);
    final isDiscounted = product.salePrice != null && product.salePrice! < product.price;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 1.05,
                  child: image.isEmpty
                      ? const Center(child: Icon(Icons.image_outlined, size: 36, color: Colors.black26))
                      : Image.network(image, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_not_supported_outlined, size: 36, color: Colors.black26))),
                ),
                if (isDiscounted)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)),
                      child: const Text('خصم', style: TextStyle(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.bold)),
                    ),
                  ),
                Positioned(
                  top: 6,
                  left: 6,
                  child: InkWell(
                    onTap: onFavorite,
                    child: CircleAvatar(
                      radius: 14,
                      backgroundColor: Colors.white.withOpacity(.9),
                      child: Icon(favorite ? Icons.favorite : Icons.favorite_border, color: favorite ? Colors.red : AppColors.muted, size: 16),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 7, 8, 2),
              child: Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900)),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  Text(money(product.salePrice ?? product.price, product.currency), style: const TextStyle(fontSize: 12, color: AppColors.burgundy, fontWeight: FontWeight.w900)),
                  if (isDiscounted) ...[
                    const SizedBox(width: 4),
                    Text(money(product.price, product.currency), style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8), decoration: TextDecoration.lineThrough)),
                  ],
                ],
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
              decoration: const BoxDecoration(color: Color(0xFFF8FAFC)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(onPressed: onRemove, icon: const Icon(Icons.remove_circle_outline_rounded, size: 18), visualDensity: VisualDensity.compact),
                  Text('$quantity', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                  IconButton(onPressed: product.stock > 0 ? onAdd : null, icon: const Icon(Icons.add_circle_rounded, size: 18, color: AppColors.emerald), visualDensity: VisualDensity.compact),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProductDetailView extends StatefulWidget {
  const ProductDetailView({super.key, required this.product, this.onAdd});
  final Product product;
  final VoidCallback? onAdd;

  @override
  State<ProductDetailView> createState() => _ProductDetailViewState();
}

class _ProductDetailViewState extends State<ProductDetailView> {
  int quantity = 1;
  int activeImage = 0;

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final images = <String>[if (product.image != null) product.image!, ...product.gallery].where((x) => x.isNotEmpty).toList();
    final isDiscounted = product.salePrice != null && product.salePrice! < product.price;

    return ScreenFrame(
      title: product.name,
      color: AppColors.emerald,
      actions: [
        IconButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت إضافة المنتج إلى المفضلة')));
          },
          icon: const Icon(Icons.favorite_border_rounded),
        ),
        IconButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ رابط المنتج')));
          },
          icon: const Icon(Icons.share_rounded),
        ),
      ],
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          // Image Slider
          if (images.isNotEmpty)
            Stack(
              alignment: Alignment.bottomCenter,
              children: [
                SizedBox(
                  height: 260,
                  child: PageView.builder(
                    itemCount: images.length,
                    onPageChanged: (i) => setState(() => activeImage = i),
                    itemBuilder: (_, i) => ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.network(
                        absoluteUrl(images[i]),
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_not_supported_outlined, size: 50, color: Colors.black26)),
                      ),
                    ),
                  ),
                ),
                if (images.length > 1)
                  Positioned(
                    bottom: 10,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(images.length, (i) {
                        return Container(
                          width: activeImage == i ? 16 : 6,
                          height: 6,
                          margin: const EdgeInsets.symmetric(horizontal: 2),
                          decoration: BoxDecoration(
                            color: activeImage == i ? AppColors.emerald : Colors.white.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        );
                      }),
                    ),
                  ),
              ],
            ),
          const SizedBox(height: 12),

          // Main Info Card
          PageCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (product.brand.isNotEmpty)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(product.brand, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.emerald)),
                      RefPill(product.stock > 0 ? 'متوفر بالمخزون' : 'نفذت الكمية', color: product.stock > 0 ? AppColors.emerald : Colors.red),
                    ],
                  ),
                const SizedBox(height: 6),
                Text(product.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, height: 1.3)),
                const SizedBox(height: 10),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      money(product.salePrice ?? product.price, product.currency),
                      style: const TextStyle(fontSize: 22, color: AppColors.burgundy, fontWeight: FontWeight.w900),
                    ),
                    if (isDiscounted) ...[
                      const SizedBox(width: 8),
                      Text(
                        money(product.price, product.currency),
                        style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8), decoration: TextDecoration.lineThrough),
                      ),
                    ],
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                          const SizedBox(width: 4),
                          Text('${product.rating}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E))),
                          Text(' (${product.reviewsCount})', style: const TextStyle(fontSize: 10, color: Color(0xFFB45309))),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Trust Badges
          Row(
            children: [
              _buildTrustBadge(Icons.verified_user_outlined, 'ضمان أصلي 100%'),
              const SizedBox(width: 8),
              _buildTrustBadge(Icons.local_shipping_outlined, 'شحن سريع ومباشر'),
              const SizedBox(width: 8),
              _buildTrustBadge(Icons.restart_alt_rounded, 'إرجاع سهل خلال 3 أيام'),
            ],
          ),
          const SizedBox(height: 10),

          // Description Card
          if (product.description.isNotEmpty)
            PageCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('تفاصيل ومواصفات المنتج', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                  const Divider(height: 16),
                  Text(
                    product.description,
                    style: const TextStyle(fontSize: 12, height: 1.65, color: Color(0xFF334155)),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 10),

          // Vendor Info Card
          if (product.vendorName.isNotEmpty)
            PageCard(
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 20,
                    backgroundColor: Color(0xFFECFDF5),
                    child: Icon(Icons.storefront_rounded, color: AppColors.emerald, size: 22),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('البائع المعتمد', style: TextStyle(fontSize: 9.5, color: Color(0xFF64748B))),
                        Text(product.vendorName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('متجر ${product.vendorName}')));
                    },
                    style: OutlinedButton.styleFrom(visualDensity: VisualDensity.compact),
                    child: const Text('زيارة المتجر', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 80),
        ],
      ),
      bottomSheet: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -2))],
          ),
          child: Row(
            children: [
              // Quantity selector
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: quantity > 1 ? () => setState(() => quantity--) : null,
                      icon: const Icon(Icons.remove_rounded, size: 18),
                      visualDensity: VisualDensity.compact,
                    ),
                    Text('$quantity', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    IconButton(
                      onPressed: () => setState(() => quantity++),
                      icon: const Icon(Icons.add_rounded, size: 18),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              // Add to cart button
              Expanded(
                child: FilledButton.icon(
                  onPressed: product.stock <= 0
                      ? null
                      : () {
                          for (int i = 0; i < quantity; i++) {
                            widget.onAdd?.call();
                          }
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('تمت إضافة $quantity من "${product.name}" إلى السلة'),
                              backgroundColor: AppColors.emerald,
                            ),
                          );
                        },
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.emerald,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  icon: const Icon(Icons.add_shopping_cart_rounded, size: 18),
                  label: const Text('إضافة إلى السلة', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrustBadge(IconData icon, String text) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: AppColors.emerald),
            const SizedBox(height: 4),
            Text(text, textAlign: TextAlign.center, style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
          ],
        ),
      ),
    );
  }
}

class CategoryProductsView extends StatelessWidget {
  const CategoryProductsView({super.key, this.category});
  final String? category;
  @override Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    final list = app.products.where((p) => category == null || p.categories.contains(category)).toList();
    return ScreenFrame(
      title: category ?? 'أقسام وتصنيفات المنتجات',
      color: AppColors.emerald,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          if (category == null)
            for (final c in app.categories)
              PageCard(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFECFDF5),
                    child: Icon(Icons.category_outlined, color: AppColors.emerald),
                  ),
                  title: Text('${c['name'] ?? c['title'] ?? 'تصنيف'}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                  trailing: const Icon(Icons.chevron_left_rounded, color: Color(0xFF94A3B8)),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CategoryProductsView(category: '${c['name'] ?? c['title'] ?? ''}'))),
                ),
              ),
          if (category != null && list.isEmpty)
            const EmptyState(text: 'لا توجد منتجات مسجلة في هذا التصنيف حالياً.', icon: Icons.inventory_2_outlined),
          if (category != null && list.isNotEmpty)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: .72),
              itemBuilder: (_, i) {
                final p = list[i];
                return InkWell(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailView(product: p))),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        AspectRatio(
                          aspectRatio: 1.1,
                          child: p.image == null || p.image!.isEmpty
                              ? const Center(child: Icon(Icons.image_outlined, color: Colors.black26))
                              : Image.network(absoluteUrl(p.image!), fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_not_supported_outlined, color: Colors.black26))),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(8),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(money(p.salePrice ?? p.price, p.currency), style: const TextStyle(fontSize: 12, color: AppColors.burgundy, fontWeight: FontWeight.w900)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}

class CategoriesFlutterScreen extends StatelessWidget { const CategoriesFlutterScreen({super.key}); @override Widget build(BuildContext context) => const CategoryProductsView(); }

class StoreProfileView extends StatelessWidget {
  const StoreProfileView({super.key, required this.vendor});
  final Map<String,dynamic> vendor;
  @override Widget build(BuildContext context) { final app=context.watch<AppController>(); final id=int.tryParse('${vendor['id'] ?? vendor['vendor_id'] ?? ''}'); final products=id==null?<Product>[]:app.products.where((p)=>p.vendorId==id).toList(); return ScreenFrame(title:'${vendor['store_name'] ?? vendor['name'] ?? 'المتجر'}',color:AppColors.emerald,child:ListView(padding:const EdgeInsets.all(12),children:[PageCard(child:Column(children:[const CircleAvatar(radius:32,backgroundColor:Color(0xFFECFDF5),child:Icon(Icons.storefront_rounded,color:AppColors.emerald,size:31)),const SizedBox(height:8),Text('${vendor['store_name'] ?? vendor['name'] ?? 'متجر'}',style:const TextStyle(fontSize:18,fontWeight:FontWeight.w900)),Text('${vendor['description'] ?? ''}',textAlign:TextAlign.center,style:const TextStyle(fontSize:9,color:AppColors.muted))])),const SizedBox(height:10),for(final p in products)PageCard(margin:const EdgeInsets.only(bottom:7),child:ListTile(title:Text(p.name,style:const TextStyle(fontSize:10,fontWeight:FontWeight.w900)),trailing:Text(money(p.salePrice??p.price),style:const TextStyle(fontSize:10,color:AppColors.burgundy,fontWeight:FontWeight.w900)),onTap:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>ProductDetailView(product:p))))) ])); }
}

class OrdersDetailView extends StatelessWidget {
  const OrdersDetailView({super.key});
  @override Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    return ScreenFrame(
      title: 'سجل طلبات المتجر',
      color: AppColors.blue,
      actions: [IconButton(onPressed: app.refreshAll, icon: const Icon(Icons.refresh_rounded))],
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          if (app.orders.isEmpty)
            const EmptyState(text: 'لا توجد لديك طلبات سابقة في المتجر.', icon: Icons.local_shipping_outlined),
          for (final o in app.orders)
            PageCard(
              margin: const EdgeInsets.only(bottom: 10),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.local_shipping_outlined, color: AppColors.blue, size: 22),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('طلب رقم #${o.number}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                            Text('${o.createdAt ?? 'اليوم'}', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                          ],
                        ),
                      ),
                      RefPill(
                        o.status == 'completed' ? 'مكتمل' : (o.status == 'processing' ? 'قيد التجهيز' : o.status),
                        color: o.status == 'completed' ? AppColors.emerald : AppColors.blue,
                      ),
                    ],
                  ),
                  const Divider(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton.icon(
                        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderChatScreen(orderId: o.id))),
                        icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16),
                        label: const Text('محادثة المتجر', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: o.id))),
                        style: FilledButton.styleFrom(backgroundColor: AppColors.blue, visualDensity: VisualDensity.compact),
                        child: const Text('عرض التفاصيل', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key,required this.orderId});
  final int orderId;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String,dynamic>>(
      future: context.read<AppController>().api.orderDetail(orderId),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.blue)));
        }
        final d = snapshot.data ?? {};
        return ScreenFrame(
          title: 'تفاصيل الطلب',
          color: AppColors.blue,
          child: ListView(
            padding: const EdgeInsets.all(12),
            children: [
              PageCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('الطلب #${d['order_number'] ?? orderId}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                    Text('${d['status'] ?? ''}', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                    const Divider(height: 20),
                    for (final key in ['subtotal', 'shipping_cost', 'tax', 'total'])
                      if (d[key] != null)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(key, style: const TextStyle(fontSize: 9, color: AppColors.muted)),
                            Text('${d[key]} ${d['currency'] ?? 'YER'}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                          ],
                        ),
                  ],
                ),
              ),
              const SizedBox(height: 9),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderChatScreen(orderId: orderId))),
                      icon: const Icon(Icons.chat_bubble_outline_rounded),
                      label: const Text('محادثة'),
                    ),
                  ),
                  const SizedBox(width: 7),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => _confirm(context),
                      style: FilledButton.styleFrom(backgroundColor: AppColors.emerald),
                      icon: const Icon(Icons.check_circle_outline),
                      label: const Text('استلام'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _confirm(BuildContext context) async {
    try {
      await context.read<AppController>().api.confirmReceived(orderId);
      await context.read<AppController>().refreshAll();
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تأكيد الاستلام.')));
    } catch(e) {
      if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }
}

class OrderChatScreen extends StatefulWidget { const OrderChatScreen({super.key,required this.orderId}); final int orderId; @override State<OrderChatScreen>createState()=>_OrderChatScreenState(); }
class _OrderChatScreenState extends State<OrderChatScreen>{final text=TextEditingController();List<Map<String,dynamic>> rows=[];int? chatId;bool loading=true;@override void initState(){super.initState();_load();}@override void dispose(){text.dispose();super.dispose();}Future<void>_load()async{try{final api=context.read<AppController>().api;final chats=await api.ensureOrderChats(widget.orderId);if(chats.isNotEmpty)chatId=int.tryParse('${chats.first['id']??''}');if(chatId!=null){final d=await api.orderChat(chatId!);final r=d['messages'];rows=r is List?r.whereType<Map>().map((e)=>Map<String,dynamic>.from(e)).toList():[];}}catch(_){}if(mounted)setState(()=>loading=false);}Future<void>_send()async{if(chatId==null||text.text.trim().isEmpty)return;try{await context.read<AppController>().api.sendOrderChatMessage(chatId!,text.text.trim());text.clear();setState(()=>loading=true);await _load();}catch(e){if(mounted)ScaffoldMessenger.of(context).showSnackBar(SnackBar(content:Text(e.toString())));}}@override Widget build(BuildContext context)=>ScreenFrame(title:'محادثة الطلب',color:AppColors.blue,child:Column(children:[Expanded(child:loading?const Center(child:CircularProgressIndicator(color:AppColors.blue)):ListView(padding:const EdgeInsets.all(12),children:[for(final m in rows)Align(alignment:m['sender_role']=='customer'?Alignment.centerRight:Alignment.centerLeft,child:Container(margin:const EdgeInsets.only(bottom:7),padding:const EdgeInsets.all(10),decoration:BoxDecoration(color:m['sender_role']=='customer'?AppColors.burgundy:Colors.white,borderRadius:BorderRadius.circular(14),border:Border.all(color:AppColors.border)),child:Text('${m['body']??''}',style:TextStyle(fontSize:10,color:m['sender_role']=='customer'?Colors.white:Color(0xFF0F172A))))) ])),SafeArea(child:Container(padding:const EdgeInsets.all(9),color:Colors.white,child:Row(children:[Expanded(child:TextField(controller:text,decoration:const InputDecoration(hintText:'اكتب رسالتك...',isDense:true))),IconButton(onPressed:_send,style:IconButton.styleFrom(backgroundColor:AppColors.blue,foregroundColor:Colors.white),icon:const Icon(Icons.send_rounded))]))) ]));}
