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
          Container(width: 29, height: 29, decoration: BoxDecoration(color: color.withOpacity(.10), borderRadius: BorderRadius.circular(9)), child: Icon(icon, color: color, size: 16)),
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
      decoration: BoxDecoration(color: color.withOpacity(.10), borderRadius: BorderRadius.circular(9), border: Border.all(color: color.withOpacity(.18))),
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
            Text('${operation['service'] ?? operation['packageName'] ?? 'عملية خدمة'}', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900)),
            Text('${operation['phone'] ?? ''} • ${operation['created_at'] ?? operation['date'] ?? ''}', style: const TextStyle(fontSize: 8, color: AppColors.muted)),
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
