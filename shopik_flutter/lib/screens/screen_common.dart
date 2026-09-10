import 'package:flutter/material.dart';
import '../widgets/common.dart';

class ScreenFrame extends StatelessWidget {
  const ScreenFrame({super.key, required this.title, required this.child, this.color = AppColors.burgundy, this.actions, this.bottomSheet});
  final String title;
  final Widget child;
  final Color color;
  final List<Widget>? actions;
  final Widget? bottomSheet;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.page,
      appBar: AppBar(
        backgroundColor: color,
        foregroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        title: Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
        actions: actions,
      ),
      body: child,
      bottomSheet: bottomSheet,
    );
  }
}

class RefSection extends StatelessWidget {
  const RefSection({super.key, required this.title, this.icon, this.color = AppColors.burgundy, this.action});
  final String title;
  final IconData? icon;
  final Color color;
  final Widget? action;
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (icon != null)
          Container(width: 29, height: 29, decoration: BoxDecoration(color: color.withValues(alpha: .10), borderRadius: BorderRadius.circular(9)), child: Icon(icon, color: color, size: 16)),
        if (icon != null) const SizedBox(width: 8),
        Expanded(child: Text(title, textAlign: TextAlign.right, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900))),
        if (action != null) action!,
      ],
    );
  }
}

class RefPill extends StatelessWidget {
  const RefPill(this.text, {super.key, this.color = AppColors.burgundy, this.icon});
  final String text;
  final Color color;
  final IconData? icon;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(color: color.withValues(alpha: .10), borderRadius: BorderRadius.circular(9), border: Border.all(color: color.withValues(alpha: .18))),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (icon != null) ...[Icon(icon, size: 13, color: color), const SizedBox(width: 4)],
        Text(text, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: color)),
      ]),
    );
  }
}

class RefMetric extends StatelessWidget {
  const RefMetric({super.key, required this.title, required this.value, required this.icon, required this.color});
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(9),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15), border: Border.all(color: AppColors.border)),
      child: Column(children: [Icon(icon, color: color, size: 18), const SizedBox(height: 4), Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)), Text(title, style: const TextStyle(fontSize: 7.5, color: AppColors.muted))]),
    );
  }
}

String resolveOperationTitle(Map<String, dynamic> op) {
  final name = op['packageName'] ?? op['serviceName'] ?? op['service_name'] ?? op['name'];
  if (name != null && name.toString().trim().isNotEmpty && !name.toString().startsWith('http')) {
    return name.toString();
  }
  final rawSvc = '${op['service'] ?? ''}'.trim();
  if (rawSvc.isEmpty) return 'عملية خدمة';

  final s = rawSvc.toLowerCase();
  if (s.contains('yem-balance') || s.contains('yem_bill_balance')) return 'تسديد رصيد يمن موبايل';
  if (s.contains('yem-denomination') || s.contains('yem_denom')) return 'فئات شحن يمن موبايل';
  if (s.contains('yem-offer-bill') || s.contains('yem-bill-offer') || s.contains('yem-offers') || s.contains('yem-offer')) return 'تفعيل باقة مزايا';
  if (s.contains('yem-query-balance')) return 'استعلام رصيد يمن موبايل';
  if (s.contains('yem-query-offers')) return 'استعلام باقات يمن موبايل';
  if (s.contains('yem-postpaid') || s.contains('postpaid')) return 'تسديد فاتورة يمن موبايل';
  if (s.contains('yem4g-package') || s.contains('yemen-4g-offer') || s.contains('4g')) return 'تسديد باقة يمن فورجي 4G';
  if (s.contains('yem4g-balance') || s.contains('yemen-4g-balance')) return 'تسديد رصيد يمن فورجي 4G';
  if (s.contains('yem4g-query')) return 'استعلام يمن فورجي 4G';
  if (s.contains('yem4g-change')) return 'تغيير باقة يمن فورجي 4G';
  if (s.contains('saba-balance') || s.contains('sabafon-balance')) return 'تسديد رصيد سبأفون';
  if (s.contains('saba-offer') || s.contains('sabafon-offer')) return 'باقة سبأفون';
  if (s.contains('saba-denomination') || s.contains('sabafon-denom')) return 'فئات شحن سبأفون';
  if (s.contains('saba-bill') || s.contains('sabafon-bill')) return 'تسديد فاتورة سبأفون';
  if (s.contains('you-balance')) return 'تسديد رصيد يو (YOU)';
  if (s.contains('you-denomination')) return 'فئات شحن يو (YOU)';
  if (s.contains('you-offer')) return 'باقات يو (YOU)';
  if (s.contains('you-bill')) return 'تسديد فاتورة يو (YOU)';
  if (s.contains('why-balance')) return 'تسديد رصيد واي';
  if (s.contains('why-package') || s.contains('why-offer')) return 'باقة واي';
  if (s.contains('why-bill')) return 'تسديد فاتورة واي';
  if (s.contains('post-adsl') || s.contains('adsl')) return 'تسديد نت منزلي ADSL';
  if (s.contains('post-line')) return 'تسديد هاتف ثابت';
  if (s.contains('post-query')) return 'استعلام انترنت يمن نت';
  if (s.contains('adenet-bill') || s.contains('aden_net')) return 'تسديد عدن نت';
  if (s.contains('adenet-query')) return 'استعلام عدن نت';
  if (s.contains('electric-bill') || s.contains('electricity')) return 'تسديد الكهرباء';
  if (s.contains('water-bill') || s.contains('water')) return 'تسديد المياه';
  if (s.contains('wifi')) return 'شراء كرت وايفاي';
  if (s.contains('transfer')) return 'تحويل لمشترك';
  if (s.contains('pubg')) return 'شحن شدات ببجي (PUBG)';
  if (s.contains('freefire')) return 'شحن جواهر فري فاير';
  if (s.contains('googleplay')) return 'بطاقة جوجل بلاي';
  if (s.contains('appstore')) return 'بطاقة آبل ستور';
  if (s.contains('playstation') || s.contains('plastation')) return 'بطاقة بلايستيشن';

  final match = RegExp(r'/services/(\d+)').firstMatch(rawSvc);
  if (match != null) {
    final id = match.group(1);
    const idMap = {
      '1': 'تسديد رصيد يمن موبايل',
      '2': 'فئات شحن يمن موبايل',
      '3': 'باقات يمن موبايل',
      '4': 'تفعيل باقة مزايا',
      '5': 'تسديد وتفعيل باقة',
      '6': 'استعلام رصيد يمن موبايل',
      '7': 'استعلام باقات يمن موبايل',
      '8': 'فئات شحن سبأفون',
      '9': 'تسديد رصيد سبأفون',
      '10': 'تسديد فاتورة سبأفون',
      '11': 'باقات سبأفون',
      '12': 'تسديد سبأفون',
      '13': 'تسديد رصيد يو (YOU)',
      '14': 'فئات شحن يو (YOU)',
      '15': 'باقات يو (YOU)',
      '16': 'تسديد واي',
      '17': 'تسديد رصيد واي',
      '18': 'باقات واي',
      '19': 'تسديد باقة يمن فورجي 4G',
      '20': 'تسديد رصيد يمن فورجي 4G',
      '21': 'تغيير باقة يمن فورجي 4G',
      '22': 'استعلام يمن فورجي 4G',
      '23': 'تسديد انترنت ADSL',
      '24': 'تسديد هاتف ثابت',
      '25': 'استعلام انترنت يمن نت',
      '26': 'تسديد عدن نت',
      '27': 'استعلام عدن نت',
      '28': 'استعلام الكهرباء',
      '29': 'تسديد الكهرباء',
      '30': 'استعلام المياه',
      '31': 'تسديد المياه',
      '35': 'شحن ببجي موبايل',
      '36': 'شحن فري فاير',
    };
    if (idMap.containsKey(id)) return idMap[id]!;
    return 'عملية خدمة #$id';
  }
  return rawSvc;
}

class RefOperationTile extends StatelessWidget {
  const RefOperationTile({super.key, required this.operation, this.onTap});
  final Map<String, dynamic> operation;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final status = '${operation['status'] ?? ''}'.toLowerCase();
    final success = status == 'success' || status == 'completed';
    final failed = status == 'failed' || status == 'rejected';
    final color = success ? AppColors.emerald : failed ? Colors.red : AppColors.amber;
    final title = resolveOperationTitle(operation);

    String dateStr = '${operation['created_at'] ?? operation['date'] ?? ''}';
    if (dateStr.contains('T')) {
      final parts = dateStr.split('T');
      final date = parts[0];
      final time = parts[1].split('.').first;
      dateStr = '$date  $time';
    }

    final phone = '${operation['phone'] ?? operation['account_number'] ?? ''}';
    final subtitle = phone.isNotEmpty ? '$phone • $dateStr' : dateStr;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(17),
      child: PageCard(
        margin: const EdgeInsets.only(bottom: 7),
        padding: const EdgeInsets.all(9),
        child: Row(children: [
          Icon(success ? Icons.check_circle_rounded : failed ? Icons.error_outline_rounded : Icons.schedule_rounded, color: color, size: 19),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900)),
            Text(subtitle, style: const TextStyle(fontSize: 8, color: AppColors.muted)),
          ])),
          Text('${operation['amount'] ?? 0} ${operation['currency'] ?? 'YER'}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.burgundy)),
        ]),
      ),
    );
  }
}

String refAbsoluteUrl(String? value) {
  if (value == null || value.isEmpty) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return 'https://shopik.alattab.site${value.startsWith('/') ? value : '/$value'}';
}
