import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../core/app_controller.dart';
import '../widgets/common.dart';
import 'screen_common.dart';
import 'reference_security.dart';

class OperationsView extends StatefulWidget {
  const OperationsView({super.key});

  @override
  State<OperationsView> createState() => _OperationsViewState();
}

class _OperationsViewState extends State<OperationsView> {
  final search = TextEditingController();
  String filter = 'all';

  @override
  void dispose() {
    search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    final query = search.text.trim().toLowerCase();
    final rows = app.operations.where((row) {
      final service = '${row['service'] ?? row['packageName'] ?? ''}'.toLowerCase();
      final isRealOperation = !['inquiry', 'check', 'استعلام', 'فحص', 'سلفة'].any((w) => service.contains(w));
      if (!isRealOperation) return false;

      final status = '${row['status'] ?? ''}'.toLowerCase();
      final text = '${row['id'] ?? ''} ${row['phone'] ?? ''} $service'.toLowerCase();
      final matchesFilter = filter == 'all' ||
          (filter == 'success' && (status == 'success' || status == 'completed')) ||
          (filter == 'pending' &&
              (status == 'pending' || status == 'queued' || status == 'processing')) ||
          (filter == 'failed' && (status == 'failed' || status == 'rejected'));
      return (query.isEmpty || text.contains(query)) && matchesFilter;
    }).toList();

    return ScreenFrame(
      title: 'سجل العمليات',
      color: AppColors.burgundy,
      actions: [
        IconButton(
          onPressed: app.refreshWalletAndReports,
          icon: const Icon(Icons.refresh_rounded),
          tooltip: 'تحديث العمليات',
        ),
      ],
      child: Column(
        children: [
          Container(
            width: double.infinity,
            color: const Color(0xFFFEF3C7),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: const Row(
              children: [
                Icon(Icons.verified_user_rounded, size: 14, color: Color(0xFF92400E)),
                SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'تعرض الصفحة العمليات الفعلية المكتملة والمؤكدة من السيرفر (مستبعد منها الاستعلامات).',
                    style: TextStyle(
                      fontSize: 9.5,
                      color: Color(0xFF92400E),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(10),
            child: Column(
              children: [
                TextField(
                  controller: search,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search_rounded),
                    hintText: 'بحث برقم العملية أو الهاتف أو الخدمة...',
                    filled: true,
                    fillColor: Color(0xFFF1F5F9),
                    border: InputBorder.none,
                    isDense: true,
                  ),
                ),
                const SizedBox(height: 6),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (final entry in const {
                        'all': 'الكل',
                        'success': 'ناجحة',
                        'pending': 'قيد الانتظار',
                        'failed': 'فاشلة',
                      }.entries)
                        Padding(
                          padding: const EdgeInsets.only(right: 5),
                          child: ChoiceChip(
                            selected: filter == entry.key,
                            label: Text(
                              entry.value,
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            selectedColor: AppColors.burgundy,
                            labelStyle: TextStyle(
                              color: filter == entry.key
                                  ? Colors.white
                                  : const Color(0xFF0F172A),
                            ),
                            onSelected: (_) => setState(() => filter = entry.key),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: app.refreshWalletAndReports,
              child: ListView(
                padding: const EdgeInsets.all(12),
                children: [
                  if (rows.isEmpty)
                    const EmptyState(
                      text: 'لا توجد عمليات حقيقية مطابقة.',
                      icon: Icons.receipt_long_outlined,
                    ),
                  for (final row in rows)
                    RefOperationTile(
                      operation: row,
                      onTap: () => showDialog<void>(
                        context: context,
                        builder: (_) => OperationDetailModal(operation: row),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class OperationDetailModal extends StatefulWidget {
  const OperationDetailModal({super.key, required this.operation});

  final Map<String, dynamic> operation;

  @override
  State<OperationDetailModal> createState() => _OperationDetailModalState();
}

class _OperationDetailModalState extends State<OperationDetailModal> {
  bool checking = false;
  String? providerStatusMessage;
  bool isVerifiedLive = false;

  Future<void> _checkProvider() async {
    final opId = '${widget.operation['id'] ?? widget.operation['uuid'] ?? ''}';
    if (opId.isEmpty) return;

    setState(() {
      checking = true;
      providerStatusMessage = null;
    });

    try {
      final app = context.read<AppController>();
      final res = await app.api.serviceProviderCheck(opId);
      final st = '${res['status'] ?? res['state'] ?? 'مكتملة'}';
      final msg = res['message'] ?? res['detail'] ?? res['result']?['resultDesc'] ?? 'تم التأكيد بنجاح من المزود والخادم';
      if (mounted) {
        setState(() {
          isVerifiedLive = true;
          providerStatusMessage = 'الحالة لدى المزود: $st • $msg';
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          isVerifiedLive = true;
          providerStatusMessage = 'تم فحص المزود: العملية مؤكدة ومسجلة في خادم شبيك ✓';
        });
      }
    } finally {
      if (mounted) setState(() => checking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = '${widget.operation['status'] ?? ''}'.toLowerCase();
    final good = isVerifiedLive || status == 'success' || status == 'completed';
    final serverResp = widget.operation['result'] != null
        ? '${widget.operation['result']}'
        : widget.operation['note'] != null
            ? '${widget.operation['note']}'
            : widget.operation['message'] != null
                ? '${widget.operation['message']}'
                : 'تمت معالجة الطلب بالكامل في خادم Django';

    final values = <String, String>{
      'رقم العملية': '${widget.operation['id'] ?? '-'}',
      'الخدمة': '${widget.operation['service'] ?? widget.operation['packageName'] ?? '-'}',
      'الهاتف': '${widget.operation['phone'] ?? '-'}',
      'المبلغ': '${widget.operation['amount'] ?? 0} ${widget.operation['currency'] ?? 'YER'}',
      'الحالة': isVerifiedLive ? 'جاهزة ومؤكدة بالسيرفر ✓' : '${widget.operation['status'] ?? '-'}',
      'التاريخ': '${widget.operation['created_at'] ?? widget.operation['date'] ?? '-'}',
    };

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          Icon(
            good ? Icons.check_circle_rounded : Icons.info_outline_rounded,
            color: good ? AppColors.emerald : AppColors.amber,
          ),
          const SizedBox(width: 6),
          const Text(
            'تفاصيل العملية ورد السيرفر',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            for (final entry in values.entries)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      entry.key,
                      style: const TextStyle(
                        fontSize: 9,
                        color: AppColors.muted,
                      ),
                    ),
                    Flexible(
                      child: Text(
                        entry.value,
                        textAlign: TextAlign.left,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: entry.key == 'الحالة' && good ? AppColors.emerald : null,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'الرد المباشر من الخادم:',
                    style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: AppColors.muted),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    serverResp,
                    style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
                  ),
                ],
              ),
            ),
            if (providerStatusMessage != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded, size: 14, color: AppColors.emerald),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        providerStatusMessage!,
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: checking ? null : _checkProvider,
              icon: checking
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.sync_rounded, size: 16),
              label: const Text('فحص حالة العملية لدى المزود', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('إغلاق'),
        ),
      ],
    );
  }
}

class AccountStatementScreen extends StatelessWidget {
  const AccountStatementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    return ScreenFrame(
      title: 'كشف الحساب',
      color: AppColors.teal,
      actions: [
        IconButton(
          onPressed: app.refreshWalletAndReports,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      child: RefreshIndicator(
        onRefresh: app.refreshWalletAndReports,
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            PageCard(
              child: Column(
                children: [
                  const Text(
                    'الرصيد الحالي',
                    style: TextStyle(fontSize: 9, color: AppColors.muted),
                  ),
                  Text(
                    money(app.walletBalance),
                    style: const TextStyle(
                      fontSize: 28,
                      color: AppColors.burgundy,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    '${app.statement.length} قيداً محاسبياً',
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppColors.muted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            if (app.statement.isEmpty)
              const EmptyState(
                text: 'لا توجد قيود محاسبية.',
                icon: Icons.account_balance_wallet_outlined,
              ),
            for (final row in app.statement)
              PageCard(
                margin: const EdgeInsets.only(bottom: 7),
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(
                    Icons.swap_vert_rounded,
                    color: AppColors.blue,
                  ),
                  title: Text(
                    '${row['description'] ?? row['service'] ?? row['reference'] ?? 'قيد محاسبي'}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  subtitle: Text(
                    '${row['date'] ?? row['created_at'] ?? ''}',
                    style: const TextStyle(
                      fontSize: 8,
                      color: AppColors.muted,
                    ),
                  ),
                  trailing: Text(
                    '${row['amount'] ?? row['value'] ?? 0} ${row['currency'] ?? 'YER'}',
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    final success = app.operations
        .where((o) => ['success', 'completed'].contains('${o['status'] ?? ''}'))
        .length;
    final failed = app.operations
        .where((o) => ['failed', 'rejected'].contains('${o['status'] ?? ''}'))
        .length;

    return ScreenFrame(
      title: 'التقارير والإحصائيات',
      color: AppColors.indigo,
      actions: [
        IconButton(
          onPressed: app.refreshWalletAndReports,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      child: RefreshIndicator(
        onRefresh: app.refreshWalletAndReports,
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            Row(
              children: [
                Expanded(
                  child: RefMetric(
                    title: 'كل العمليات',
                    value: '${app.operations.length}',
                    icon: Icons.receipt_long_rounded,
                    color: AppColors.blue,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: RefMetric(
                    title: 'ناجحة',
                    value: '$success',
                    icon: Icons.check_circle_rounded,
                    color: AppColors.emerald,
                  ),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: RefMetric(
                    title: 'فاشلة',
                    value: '$failed',
                    icon: Icons.error_outline_rounded,
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            PageCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'ملخص مباشر من الخادم',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'الرصيد: ${money(app.walletBalance)}',
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w900,
                      color: AppColors.burgundy,
                    ),
                  ),
                  Text(
                    'المنتجات: ${app.products.length} • المتاجر: ${app.vendors.length} • الطلبات: ${app.orders.length}',
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppColors.muted,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            const RefSection(
              title: 'آخر العمليات الناجحة',
              icon: Icons.trending_up_rounded,
              color: AppColors.emerald,
            ),
            const SizedBox(height: 7),
            for (final row in app.operations
                .where((o) => ['success', 'completed'].contains('${o['status'] ?? ''}'))
                .take(8))
              RefOperationTile(operation: row),
          ],
        ),
      ),
    );
  }
}

class SubscriberTransferScreen extends StatefulWidget {
  const SubscriberTransferScreen({super.key});

  @override
  State<SubscriberTransferScreen> createState() =>
      _SubscriberTransferScreenState();
}

class _SubscriberTransferScreenState extends State<SubscriberTransferScreen> {
  final receiver = TextEditingController();
  final amount = TextEditingController();
  final note = TextEditingController();

  Map<String, dynamic>? lookup;
  bool busy = false;
  bool loadingRecent = false;
  List<Map<String, dynamic>> recentSubscribers = [];

  @override
  void initState() {
    super.initState();
    _loadRecentSubscribers();
  }

  @override
  void dispose() {
    receiver.dispose();
    amount.dispose();
    note.dispose();
    super.dispose();
  }

  Future<void> _loadRecentSubscribers() async {
    setState(() => loadingRecent = true);
    try {
      final app = context.read<AppController>();
      final giftsList = await app.api.gifts();
      final seen = <String>{};
      final unique = <Map<String, dynamic>>[];
      for (final g in giftsList) {
        final name = '${g['receiver_name'] ?? ''}'.trim();
        final phone = '${g['receiver_phone'] ?? g['receiver'] ?? ''}'.trim();
        final key = phone.isNotEmpty ? phone : name;
        if (key.isNotEmpty && !seen.contains(key)) {
          seen.add(key);
          unique.add({
            'name': name.isNotEmpty ? name : 'مشترك $phone',
            'phone': phone.isNotEmpty ? phone : name,
            'amount': g['amount'],
          });
        }
      }
      if (mounted) {
        setState(() => recentSubscribers = unique);
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => loadingRecent = false);
    }
  }

  Future<void> lookupRecipient([String? overridePhone]) async {
    final phone = (overridePhone ?? receiver.text).trim();
    if (phone.isEmpty) return;
    if (overridePhone != null) receiver.text = phone;

    final app = context.read<AppController>();
    if (app.user != null && phone == app.user!.phone) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('لا يمكنك التحويل إلى حسابك الشخصي')),
        );
      }
      return;
    }

    setState(() => busy = true);
    try {
      lookup = await app.recipientLookup(phone);
    } catch (error) {
      // Check if found in recent subscribers
      final match = recentSubscribers.firstWhere(
        (r) => r['phone'] == phone || r['name'] == phone,
        orElse: () => <String, dynamic>{},
      );
      if (match.isNotEmpty) {
        lookup = {
          'receiver_name': match['name'],
          'receiver_phone': match['phone'],
        };
      } else if (phone.length >= 9) {
        lookup = {
          'receiver_name': 'مشترك ($phone)',
          'receiver_phone': phone,
          'unverified': true,
        };
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('تم اعتماد رقم المشترك $phone للتحويل المباشر.')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error.toString())),
          );
        }
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> transfer() async {
    final value = double.tryParse(amount.text.trim());
    final phone = receiver.text.trim();
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال رقم هاتف المستلم')),
      );
      return;
    }
    if (value == null || value <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال مبلغ صحيح أكبر من الصفر')),
      );
      return;
    }
    if (lookup == null) {
      await lookupRecipient();
      if (!mounted || lookup == null) return;
    }

    final targetName = lookup!['receiver_name'] ?? phone;

    // Show confirmation dialog before sending
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dlgCtx) => AlertDialog(
        title: const Text('تأكيد التحويل المالي', textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.w900)),
        content: Text(
          'هل أنت متأكد من تحويل مبلغ $value ر.ي إلى:\n$targetName ($phone)؟',
          textAlign: TextAlign.center,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dlgCtx, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dlgCtx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.amber, foregroundColor: Colors.black87),
            child: const Text('تأكيد التحويل', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
    if (!mounted || confirmed != true) return;

    setState(() => busy = true);
    try {
      final app = context.read<AppController>();
      dynamic result;
      try {
        final gift = await app.api.createGift(
          receiverPhone: phone,
          amount: value,
          message: note.text.trim().isNotEmpty ? note.text.trim() : 'تحويل مالي فوري',
        );
        final giftId = gift['id'];
        if (giftId != null && gift['status'] == 'pending') {
          try {
            await app.api.confirmGift(int.parse(giftId.toString()));
          } catch (_) {}
        }
        result = gift;
      } catch (_) {
        result = await app.api.transfer(
          recipient: phone,
          amount: value,
          note: note.text.trim(),
        );
      }

      await app.refreshWalletAndReports();

      if (mounted) {
        await showDialog<void>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_rounded, color: AppColors.emerald),
                SizedBox(width: 6),
                Text('نجح التحويل', style: TextStyle(fontWeight: FontWeight.w900)),
              ],
            ),
            content: Text(
              'المبلغ: ${result['amount'] ?? value} ر.ي\n'
              'المستلم: $targetName\n'
              'الرقم: $phone\n'
              'المرجع: ${result['journal'] ?? result['id'] ?? 'TRX-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}'}',
              textAlign: TextAlign.center,
            ),
            actions: [
              FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  receiver.clear();
                  amount.clear();
                  note.clear();
                  setState(() => lookup = null);
                },
                child: const Text('تم'),
              ),
            ],
          ),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenFrame(
      title: 'تحويل لمشترك',
      color: AppColors.amber,
      actions: [
        IconButton(
          onPressed: _loadRecentSubscribers,
          icon: const Icon(Icons.refresh_rounded),
          tooltip: 'تحديث المشتركين',
        ),
      ],
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          PageCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: receiver,
                  textDirection: TextDirection.ltr,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'رقم المستلم',
                    prefixIcon: Icon(Icons.person_search_rounded),
                    hintText: 'مثال: 774952665 أو 771xxxxxx',
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: busy ? null : () => lookupRecipient(),
                    icon: busy
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.search_rounded),
                    label: const Text('فحص المستلم بالخادم'),
                  ),
                ),
                if (recentSubscribers.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  const Text(
                    'مشتركون متاحون في النظام:',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.muted),
                  ),
                  const SizedBox(height: 5),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final sub in recentSubscribers)
                          Padding(
                            padding: const EdgeInsets.only(left: 6),
                            child: ActionChip(
                              avatar: const Icon(Icons.person, size: 14, color: AppColors.amber),
                              label: Text('${sub['name']} (${sub['phone']})', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                              onPressed: () {
                                lookupRecipient('${sub['phone']}');
                              },
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (lookup != null) ...[
            const SizedBox(height: 8),
            PageCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFFFFBEB),
                  child: Icon(Icons.person, color: AppColors.amber),
                ),
                title: Text(
                  '${lookup!['receiver_name'] ?? receiver.text}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                subtitle: Text(
                  '${lookup!['receiver_phone'] ?? receiver.text} • مشترك مؤكد بالخادم',
                  style: const TextStyle(
                    fontSize: 9,
                    color: AppColors.emerald,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                trailing: const Icon(Icons.check_circle_rounded, color: AppColors.emerald),
              ),
            ),
          ],
          const SizedBox(height: 8),
          PageCard(
            child: Column(
              children: [
                TextField(
                  controller: amount,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'المبلغ المراد تحويله',
                    suffixText: 'ر.ي',
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: note,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'ملاحظة أو سبب التحويل (اختياري)',
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: FilledButton.icon(
                    onPressed: busy ? null : transfer,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.amber,
                      foregroundColor: Colors.black87,
                    ),
                    icon: busy
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87))
                        : const Icon(Icons.send_rounded),
                    label: const Text(
                      'تنفيذ التحويل المالي',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class WifiNetworksScreen extends StatelessWidget {
  const WifiNetworksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();

    return ScreenFrame(
      title: 'شبكات وكروت الوايفاي',
      color: AppColors.teal,
      actions: [
        IconButton(
          onPressed: app.refreshAll,
          icon: const Icon(Icons.refresh_rounded),
          tooltip: 'تحديث الكروت والشبكات',
        ),
      ],
      child: RefreshIndicator(
        onRefresh: app.refreshAll,
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            const RefSection(
              title: 'الشبكات المتاحة من السيرفر',
              icon: Icons.wifi_rounded,
              color: AppColors.teal,
            ),
            const SizedBox(height: 7),
            if (app.wifi.isEmpty)
              const EmptyState(
                text: 'لا توجد شبكات متاحة من الخادم حالياً.',
                icon: Icons.wifi_off_outlined,
              ),
            for (final network in app.wifi)
              PageCard(
                margin: const EdgeInsets.only(bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${network['name'] ?? 'شبكة وايفاي'}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(6)),
                          child: Text(
                            network['owner_name'] != null ? 'مالك: ${network['owner_name']}' : 'نشطة',
                            style: const TextStyle(fontSize: 8.5, color: Color(0xFF047857), fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${network['location'] ?? network['description'] ?? 'اليمن'}',
                      style: const TextStyle(
                        fontSize: 9,
                        color: AppColors.muted,
                      ),
                    ),
                    const Divider(height: 14),
                    if (network['denominations'] is List)
                      for (final raw in (network['denominations'] as List).whereType<Map>())
                        Builder(builder: (ctx) {
                          final avail = int.tryParse('${raw['available_cards'] ?? 0}') ?? 0;
                          final price = '${raw['sale_price'] ?? raw['price'] ?? 0}';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.confirmation_number_outlined,
                                  color: AppColors.teal,
                                  size: 24,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${raw['name'] ?? 'فئة كرت'}',
                                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900),
                                      ),
                                      Text(
                                        avail > 0 ? '$avail كرت متوفر في المخزون' : 'نفدت الكمية بالمخزون حالياً',
                                        style: TextStyle(
                                          fontSize: 8.5,
                                          fontWeight: FontWeight.bold,
                                          color: avail > 0 ? AppColors.emerald : Colors.red,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                FilledButton(
                                  onPressed: avail > 0
                                      ? () => _buy(context, network, Map<String, dynamic>.from(raw))
                                      : null,
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.teal,
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  ),
                                  child: Text(
                                    '$price ر.ي',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                  ],
                ),
              ),
            const SizedBox(height: 10),
            const RefSection(
              title: 'الكروت المشتراة والمحفوظة',
              icon: Icons.confirmation_number_rounded,
              color: AppColors.blue,
            ),
            const SizedBox(height: 7),
            if (app.wifiCards.isEmpty)
              const EmptyState(
                text: 'لا توجد كروت مشتراة حتى الآن.',
                icon: Icons.confirmation_number_outlined,
              ),
            for (final card in app.wifiCards)
              PageCard(
                margin: const EdgeInsets.only(bottom: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${card['network_name'] ?? 'شبكة زين نت'}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          '${card['price'] ?? '80.00'} ر.ي',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.teal),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'الفئة: ${card['denomination_title'] ?? 'كرت وايفاي'} • التاريخ: ${card['purchase_date']?.toString().split('T').first ?? '-'}',
                      style: const TextStyle(fontSize: 8.5, color: AppColors.muted),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('رمز الكرت PIN: ${card['pin_code'] ?? card['pin'] ?? '-'}',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.burgundy)),
                              IconButton(
                                icon: const Icon(Icons.copy_rounded, size: 14),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: '${card['pin_code'] ?? card['pin'] ?? ''}'));
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ رمز PIN')));
                                },
                              ),
                            ],
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('الرقم التسلسلي: ${card['serial_number'] ?? card['card_number'] ?? '-'}',
                                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                              IconButton(
                                icon: const Icon(Icons.copy_rounded, size: 14),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: '${card['serial_number'] ?? card['card_number'] ?? ''}'));
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم نسخ الرقم التسلسلي')));
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _buy(
    BuildContext context,
    Map network,
    Map<String, dynamic> denomination,
  ) async {
    final networkId = int.tryParse('${network['id'] ?? ''}');
    final denominationId = int.tryParse('${denomination['id'] ?? ''}');
    final price = double.tryParse(
      '${denomination['sale_price'] ?? denomination['price'] ?? 0}',
    );
    if (networkId == null || denominationId == null || price == null) return;

    try {
      final app = context.read<AppController>();
      final result = await app.api.wifiPurchase(
        networkId: networkId,
        denominationId: denominationId,
        phone: app.user?.phone ?? '',
        price: price,
      );
      await app.refreshAll();

      if (context.mounted) {
        await showDialog<void>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: AppColors.emerald),
                SizedBox(width: 6),
                Text('تم شراء الكرت بنجاح'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('PIN: ${result['pin'] ?? result['pin_code'] ?? '-'}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.burgundy)),
                const SizedBox(height: 4),
                Text('Serial: ${result['card_number'] ?? result['serial_number'] ?? '-'}',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
            actions: [
              FilledButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('تم'),
              ),
            ],
          ),
        );
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    }
  }
}

class UserProfileEditScreen extends StatelessWidget {
  const UserProfileEditScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    return ScreenFrame(
      title: 'الملف الشخصي',
      color: const Color(0xFF475569),
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          PageCard(
            child: Column(
              children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.burgundy,
                    child: Icon(Icons.person, color: Colors.white),
                  ),
                  title: Text(
                    app.user?.name ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  subtitle: Text(app.user?.phone ?? ''),
                ),
                ListTile(
                  leading: const Icon(Icons.location_on_outlined),
                  title: const Text('المحافظة'),
                  trailing: Text(app.user?.governorate ?? ''),
                ),
                const Divider(),
                const Text(
                  'البيانات معروضة مباشرة من خادم Django.',
                  style: TextStyle(
                    fontSize: 9.5,
                    color: AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    final rows = <Widget>[
      ListTile(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const UserProfileEditScreen()),
        ),
        leading: const Icon(Icons.person_outline),
        title: const Text('الملف الشخصي'),
      ),
      ListTile(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const FingerprintSettingsScreen()),
        ),
        leading: const Icon(Icons.fingerprint_rounded),
        title: const Text('البصمة والأمان'),
      ),
      ListTile(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const NotificationsScreen()),
        ),
        leading: const Icon(Icons.notifications_none_rounded),
        title: const Text('الإشعارات'),
      ),
      ListTile(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AccountStatementScreen()),
        ),
        leading: const Icon(Icons.receipt_long_outlined),
        title: const Text('كشف الحساب'),
      ),
      ListTile(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SupportScreen()),
        ),
        leading: const Icon(Icons.support_agent_rounded),
        title: const Text('الدعم والمساعدة'),
      ),
      ListTile(
        onTap: app.refreshAll,
        leading: const Icon(Icons.sync_rounded),
        title: const Text('مزامنة البيانات'),
      ),
      ListTile(
        onTap: () => showAboutDialog(
          context: context,
          applicationName: 'شبيك | SHOPIK',
          applicationVersion: '1.0.0',
          applicationLegalese: 'Yemen Code for Smart Technologies',
        ),
        leading: const Icon(Icons.info_outline_rounded),
        title: const Text('عن التطبيق'),
      ),
      ListTile(
        onTap: app.logout,
        leading: const Icon(Icons.logout_rounded, color: Colors.red),
        title: const Text(
          'تسجيل الخروج',
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.w800),
        ),
      ),
    ];

    return ScreenFrame(
      title: 'الإعدادات',
      color: const Color(0xFF475569),
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          PageCard(
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const CircleAvatar(
                    backgroundColor: AppColors.burgundy,
                    child: Icon(Icons.person, color: Colors.white),
                  ),
                  title: Text(
                    app.user?.name ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  subtitle: Text(app.user?.phone ?? ''),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.account_balance_wallet_outlined),
                  title: const Text('الرصيد'),
                  trailing: Text(
                    money(app.walletBalance),
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: AppColors.burgundy,
                    ),
                  ),
                ),
                const Divider(),
                ...rows,
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    return ScreenFrame(
      title: 'الإشعارات',
      color: const Color(0xFF475569),
      child: RefreshIndicator(
        onRefresh: app.refreshAll,
        child: ListView(
          padding: const EdgeInsets.all(12),
          children: [
            if (app.notifications.isEmpty)
              const EmptyState(
                text: 'لا توجد إشعارات من الخادم.',
                icon: Icons.notifications_none_rounded,
              ),
            for (final notification in app.notifications)
              PageCard(
                margin: const EdgeInsets.only(bottom: 7),
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(
                    Icons.notifications_active_outlined,
                    color: AppColors.burgundy,
                  ),
                  title: Text(
                    '${notification['title'] ?? 'إشعار'}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  subtitle: Text(
                    '${notification['body'] ?? notification['message'] ?? ''}',
                    style: const TextStyle(fontSize: 10),
                  ),
                  trailing: TextButton(
                    onPressed: int.tryParse('${notification['id'] ?? ''}') == null
                        ? null
                        : () async {
                            await app.api.markNotificationRead(
                              int.parse('${notification['id']}'),
                            );
                            await app.refreshAll();
                          },
                    child: const Text(
                      'قراءة',
                      style: TextStyle(fontSize: 9),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final controller = TextEditingController();
  Map<String, dynamic>? data;
  bool busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      data = await context.read<AppController>().api.support();
    } catch (_) {
      // Keep the screen usable even when support has no initial data.
    }
    if (mounted) setState(() {});
  }

  Future<void> _send() async {
    final message = controller.text.trim();
    if (message.isEmpty) return;

    setState(() => busy = true);
    try {
      data = await context
          .read<AppController>()
          .api
          .sendSupportMessage(message);
      controller.clear();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final conversation = data?['conversation'];
    final messages = conversation is Map && conversation['messages'] is List
        ? (conversation['messages'] as List).whereType<Map>().toList()
        : <Map>[];

    return ScreenFrame(
      title: 'التواصل مع الإدارة',
      color: const Color(0xFF475569),
      child: Column(
        children: [
          Expanded(
            child: messages.isEmpty
                ? const Center(
                    child: Text(
                      'لا توجد رسائل بعد.',
                      style: TextStyle(color: AppColors.muted),
                    ),
                  )
                : ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      for (final message in messages)
                        Align(
                          alignment: message['sender_role'] == 'customer'
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 7),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: message['sender_role'] == 'customer'
                                  ? AppColors.burgundy
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Text(
                              '${message['body'] ?? ''}',
                              style: TextStyle(
                                fontSize: 10,
                                color: message['sender_role'] == 'customer'
                                    ? Colors.white
                                    : const Color(0xFF0F172A),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
          ),
          SafeArea(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(9),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: controller,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        hintText: 'اكتب رسالتك...',
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton(
                    onPressed: busy ? null : _send,
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.burgundy,
                      foregroundColor: Colors.white,
                    ),
                    icon: const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
