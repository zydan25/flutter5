import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../core/app_controller.dart';
import '../widgets/common.dart';
import 'screen_common.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});
  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PackageItem {
  final int id;
  final String name;
  final String category;
  final String subTitle;
  final double price;
  final String days;
  final String calls;
  final String sms;
  final String internet;
  final double? netDiscountPrice;

  const _PackageItem({
    required this.id,
    required this.name,
    required this.category,
    required this.subTitle,
    required this.price,
    required this.days,
    required this.calls,
    required this.sms,
    required this.internet,
    this.netDiscountPrice,
  });
}

class _DenominationItem {
  final int tier;
  final double price;
  final String days;
  const _DenominationItem({required this.tier, required this.price, required this.days});
}

class _ActiveSubItem {
  final String id;
  final String name;
  final String startDate;
  final String endDate;
  final String type;
  const _ActiveSubItem({
    required this.id,
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.type,
  });
}

class _OperatorSpec {
  final String id;
  final String name;
  final String shortName;
  final Color headerColor;
  final Color activeTabColor;
  final String prefix;
  final bool hasUnits;
  final bool hasInquiryInBalance;
  final List<String> mainTabs;

  const _OperatorSpec({
    required this.id,
    required this.name,
    required this.shortName,
    required this.headerColor,
    required this.activeTabColor,
    required this.prefix,
    required this.hasUnits,
    required this.hasInquiryInBalance,
    required this.mainTabs,
  });
}

class _PaymentScreenState extends State<PaymentScreen> {
  final phone = TextEditingController(text: '774952665');
  final rechargeAmount = TextEditingController(text: '100');
  final unitsCount = TextEditingController(text: '10');

  String currentOpId = 'yemen_mobile';
  String activeMainTab = 'باقات';
  String subFilter = 'دفع مسبق';
  String sabafonRegion = 'شمال';
  bool youSmartCharger = false;
  String netTab = 'adsl';
  bool userBalanceHidden = false;
  String? operatorRestrictedToast;
  String? balanceInquiryBanner;

  // Inquiry states
  String ymPhoneBalance = '436.04 ر.ي';
  String ymPhoneType = 'دفع مسبق | شريحة';
  String ymLoanStatus = 'none';
  double ymLoanAmount = 122.0;

  Map<String, dynamic>? fourGInquiryData;
  Map<String, dynamic>? netInquiryData;

  // Accordion state
  final Map<String, bool> expandedCategories = {
    'باقات مزايا': true,
    'باقات فورجي': true,
    'باقات فولتي VoLTE': false,
    'باقات الإنترنت الشهرية': false,
    'باقات الإنترنت 10 ايام': false,
    'باقات يابلاش + واحد': true,
    'باقات 4G-فورجي': false,
    'باقات سوى': true,
    'باقات التواصل الاجتماعية': false,
  };

  // Active subscriptions (Loaded dynamically from live server inquiry)
  List<_ActiveSubItem> activeSubscriptions = [
    const _ActiveSubItem(
      id: 'A115887147',
      name: 'تفعيل خدمة الانترنت (4G)',
      startDate: '2023/09/20 (12:01:05)',
      endDate: '2037/01/01 (00:00:00)',
      type: '4G',
    ),
    const _ActiveSubItem(
      id: 'A101051',
      name: 'VoLTE international toll offer',
      startDate: '2025/11/05 (13:26:15)',
      endDate: '2037/01/01 (00:00:00)',
      type: 'VoLTE',
    ),
    const _ActiveSubItem(
      id: 'A101045',
      name: 'عرض VOLTE الرئيسي',
      startDate: '2025/11/05 (13:26:09)',
      endDate: '2037/01/01 (00:00:00)',
      type: 'VoLTE',
    ),
    const _ActiveSubItem(
      id: 'A4990006',
      name: 'باقة مزايا فولتي الشهرية دفع مسبق',
      startDate: '2026/08/19 (18:02:58)',
      endDate: '2026/09/17 (23:59:59)',
      type: 'باقة',
    ),
    const _ActiveSubItem(
      id: 'A4821',
      name: 'باقة نت فورجي 4 جيجا الشهرية دفع مسبق',
      startDate: '2026/09/05 (10:22:15)',
      endDate: '2026/10/04 (23:59:59)',
      type: '4G',
    ),
    const _ActiveSubItem(
      id: 'A4990004',
      name: 'باقة مزايا فولتي 48 ساعة دفع مسبق',
      startDate: '2026/09/10 (03:00:05)',
      endDate: '2026/09/11 (23:59:59)',
      type: 'باقة',
    ),
  ];

  static const List<_OperatorSpec> operators = [
    _OperatorSpec(
      id: 'yemen_mobile',
      name: 'يمن موبايل',
      shortName: 'يم',
      headerColor: Color(0xFF8B1D3B),
      activeTabColor: Color(0xFF8B1D3B),
      prefix: '77',
      hasUnits: false,
      hasInquiryInBalance: true,
      mainTabs: ['رصيد', 'فوري', 'باقات', 'جملة', 'ريال'],
    ),
    _OperatorSpec(
      id: 'sabafon',
      name: 'سبأفون',
      shortName: 'سبأ',
      headerColor: Color(0xFF1E88E5),
      activeTabColor: Color(0xFF1E88E5),
      prefix: '71',
      hasUnits: true,
      hasInquiryInBalance: false,
      mainTabs: ['رصيد', 'فوري', 'باقات', 'جملة', 'ريال'],
    ),
    _OperatorSpec(
      id: 'you',
      name: 'YOU عمانتل',
      shortName: 'يو',
      headerColor: Color(0xFFD97706),
      activeTabColor: Color(0xFFD97706),
      prefix: '73',
      hasUnits: false,
      hasInquiryInBalance: false,
      mainTabs: ['رصيد', 'فوري', 'باقات', 'جملة', 'فوترة'],
    ),
    _OperatorSpec(
      id: 'y',
      name: 'شركة واي Y',
      shortName: 'واي',
      headerColor: Color(0xFFDC2626),
      activeTabColor: Color(0xFFDC2626),
      prefix: '79',
      hasUnits: false,
      hasInquiryInBalance: false,
      mainTabs: ['رصيد', 'فوري', 'باقات'],
    ),
    _OperatorSpec(
      id: 'yemen4g',
      name: 'يمن فورجي 4G',
      shortName: '4G',
      headerColor: Color(0xFF0284C7),
      activeTabColor: Color(0xFF0284C7),
      prefix: '10',
      hasUnits: false,
      hasInquiryInBalance: true,
      mainTabs: ['باقة يمن 4G', 'رصيد يمن 4G', 'تغيير الباقة', 'فايبر'],
    ),
    _OperatorSpec(
      id: 'yemen_net',
      name: 'يمن نت ADSL',
      shortName: 'نت',
      headerColor: Color(0xFF283593),
      activeTabColor: Color(0xFF283593),
      prefix: '01',
      hasUnits: false,
      hasInquiryInBalance: true,
      mainTabs: ['الانترنت الارضي', 'الهاتف الثابت'],
    ),
  ];

  _OperatorSpec get currentOp => operators.firstWhere((o) => o.id == currentOpId, orElse: () => operators.first);

  Map<String, List<_PackageItem>> _getPackagesForOp(_OperatorSpec op, AppController app) {
    // 1) Start with default/pre-configured map as baseline
    final Map<String, List<_PackageItem>> base = op.id == 'yemen_mobile'
        ? yemenMobilePackages
        : op.id == 'sabafon'
            ? sabafonPackages
            : youPackages;

    // 2) If live catalog items exist in AppController, augment or generate dynamic categories
    final services = app.catalogServices;
    if (op.id == 'yemen_mobile') {
      final s = services.firstWhere(
        (x) => x['code'] == 'yem-offer' || x['id'] == 3 || x['code'] == 'yem-bill-offer' || x['id'] == 4,
        orElse: () => <String, dynamic>{},
      );
      final items = s['items'];
      if (items is List && items.isNotEmpty) {
        final dynMap = <String, List<_PackageItem>>{
          'باقات مزايا': <_PackageItem>[],
          'باقات فورجي': <_PackageItem>[],
          'باقات هدايا': <_PackageItem>[],
          'باقات سوبر نت': <_PackageItem>[],
          'باقات شهرية': <_PackageItem>[],
          'باقات أسبوعية': <_PackageItem>[],
          'باقات أخرى': <_PackageItem>[],
        };
        for (final it in items.whereType<Map>()) {
          final id = int.tryParse('${it['id']}') ?? 0;
          final name = '${it['name'] ?? ''}';
          final pr = double.tryParse('${it['price'] ?? 0}') ?? 0;
          if (name.isEmpty) continue;

          String cat = 'باقات أخرى';
          if (name.contains('مزايا')) {
            cat = 'باقات مزايا';
          } else if (name.contains('فورجي') || name.contains('4G') || name.contains('4g')) {
            cat = 'باقات فورجي';
          } else if (name.contains('هدايا')) {
            cat = 'باقات هدايا';
          } else if (name.contains('سوبر') || name.contains('نت')) {
            cat = 'باقات سوبر نت';
          } else if (name.contains('شهر') || name.contains('الشهرية')) {
            cat = 'باقات شهرية';
          } else if (name.contains('أسبوع') || name.contains('الاسبوعية')) {
            cat = 'باقات أسبوعية';
          }

          dynMap[cat]!.add(_PackageItem(
            id: id,
            name: name,
            category: cat,
            subTitle: 'دفع مسبق / شريحة وبرمجة',
            price: pr > 0 ? pr : 500,
            days: name.contains('شهر') ? '30 يوم' : name.contains('أسبوع') ? '7 أيام' : 'صلاحية الباقة',
            calls: 'رصيد اتصال',
            sms: 'رسائل',
            internet: 'بيانات انترنت',
          ));
        }

        dynMap.removeWhere((k, v) => v.isEmpty);
        if (dynMap.isNotEmpty) {
          return dynMap;
        }
      }
    } else if (op.id == 'you') {
      final s = services.firstWhere(
        (x) => x['code'] == 'you-offer' || x['id'] == 15,
        orElse: () => <String, dynamic>{},
      );
      final items = s['items'];
      if (items is List && items.isNotEmpty) {
        final dynMap = <String, List<_PackageItem>>{
          'باقات مكس': <_PackageItem>[],
          'باقات نت': <_PackageItem>[],
          'باقات اتصال': <_PackageItem>[],
          'باقات أخرى': <_PackageItem>[],
        };
        for (final it in items.whereType<Map>()) {
          final id = int.tryParse('${it['id']}') ?? 0;
          final name = '${it['name'] ?? ''}';
          final pr = double.tryParse('${it['price'] ?? 0}') ?? 0;
          if (name.isEmpty) continue;

          String cat = 'باقات أخرى';
          if (name.contains('مكس')) {
            cat = 'باقات مكس';
          } else if (name.contains('نت') || name.contains('تواصل')) {
            cat = 'باقات نت';
          } else if (name.contains('اتصال') || name.contains('مكالمات')) {
            cat = 'باقات اتصال';
          }

          dynMap[cat]!.add(_PackageItem(
            id: id,
            name: name,
            category: cat,
            subTitle: 'يو - YOU',
            price: pr > 0 ? pr : 600,
            days: 'حسب الباقة',
          ));
        }
        dynMap.removeWhere((k, v) => v.isEmpty);
        if (dynMap.isNotEmpty) {
          return dynMap;
        }
      }
    }

    return base;
  }

  // Pre-configured packages matching production
  final Map<String, List<_PackageItem>> yemenMobilePackages = const {
    'باقات مزايا': [
      _PackageItem(
        id: 101,
        name: 'مزايا الاسبوعية',
        category: 'باقات مزايا',
        subTitle: 'دفع مسبق\nشريحة + برمجة',
        price: 485,
        days: '7 أيام',
        calls: '100 دقيقة',
        sms: '30 رساله',
        internet: '90 ميجا',
        netDiscountPrice: 400.83,
      ),
      _PackageItem(
        id: 102,
        name: 'مزايا الشهريه - 350 دقيقه 150 رساله 250 ميجا',
        category: 'باقات مزايا',
        subTitle: 'دفع مسبق\nشريحة + برمجة',
        price: 1210,
        days: '30 يوم',
        calls: '350 دقيقة',
        sms: '150 رساله',
        internet: '250 ميجا',
        netDiscountPrice: 1000.0,
      ),
      _PackageItem(
        id: 103,
        name: 'مزايا الشهرية الكبرى 700 دقيقة',
        category: 'باقات مزايا',
        subTitle: 'دفع مسبق',
        price: 2420,
        days: '30 يوم',
        calls: '700 دقيقة',
        sms: '300 رساله',
        internet: '600 ميجا',
      ),
    ],
    'باقات فورجي': [
      _PackageItem(
        id: 201,
        name: 'باقة سوبر فورجي الشهرية دفع مسبق',
        category: 'باقات فورجي',
        subTitle: 'دفع مسبق\nشريحه',
        price: 2000,
        days: '30 يوم',
        calls: '250 دقيقة',
        sms: '250 رساله',
        internet: '2 جيجا',
        netDiscountPrice: 1652.0,
      ),
      _PackageItem(
        id: 202,
        name: 'باقة مزايا فورجي الشهرية 4 جيجا',
        category: 'باقات فورجي',
        subTitle: 'دفع مسبق\nشريحه',
        price: 2900,
        days: '30 يوم',
        calls: '400 دقيقة',
        sms: '400 رساله',
        internet: '4 جيجا',
      ),
      _PackageItem(
        id: 203,
        name: 'باقة تواصل فورجي الشهرية',
        category: 'باقات فورجي',
        subTitle: 'دفع مسبق\nشريحة',
        price: 1500,
        days: '30 يوم',
        calls: '600 دقيقة',
        sms: '600 رسالة',
        internet: 'لا يوجد',
      ),
    ],
    'باقات فولتي VoLTE': [
      _PackageItem(
        id: 301,
        name: 'باقة مزايا فولتي 48 ساعة',
        category: 'باقات فولتي VoLTE',
        subTitle: 'دفع مسبق',
        price: 600,
        days: '48 ساعة',
        calls: '120 دقيقة',
        sms: '50 رسالة',
        internet: '500 ميجا',
      ),
      _PackageItem(
        id: 302,
        name: 'باقة مزايا فولتي الشهرية',
        category: 'باقات فولتي VoLTE',
        subTitle: 'دفع مسبق',
        price: 1800,
        days: '30 يوم',
        calls: '300 دقيقة',
        sms: '200 رسالة',
        internet: '1.5 جيجا',
      ),
    ],
    'باقات الإنترنت الشهرية': [
      _PackageItem(
        id: 401,
        name: 'باقة 3 جيجا إنترنت شهرية',
        category: 'باقات الإنترنت الشهرية',
        subTitle: 'دفع مسبق',
        price: 2400,
        days: '30 يوم',
        calls: '-',
        sms: '-',
        internet: '3 جيجا',
      ),
    ],
    'باقات الإنترنت 10 ايام': [
      _PackageItem(
        id: 501,
        name: 'باقة 1 جيجا 10 أيام',
        category: 'باقات الإنترنت 10 ايام',
        subTitle: 'دفع مسبق',
        price: 900,
        days: '10 أيام',
        calls: '-',
        sms: '-',
        internet: '1 جيجا',
      ),
    ],
  };

  final Map<String, List<_PackageItem>> sabafonPackages = const {
    'باقات يابلاش + واحد': [
      _PackageItem(
        id: 601,
        name: 'يابلاش الاسبوعية',
        category: 'باقات يابلاش + واحد',
        subTitle: 'دفع مسبق',
        price: 484,
        days: '7 أيام',
        calls: '100 دقيقة',
        sms: '100 رسالة',
        internet: '100 ميجا',
      ),
      _PackageItem(
        id: 602,
        name: 'يابلاش الشهرية',
        category: 'باقات يابلاش + واحد',
        subTitle: 'دفع مسبق',
        price: 1210,
        days: '30 يوم',
        calls: '300 دقيقة',
        sms: '300 رسالة',
        internet: '100 ميجا',
      ),
    ],
    'باقات 4G-فورجي': [
      _PackageItem(
        id: 603,
        name: 'سبأفون 4G سوبر 6 جيجا',
        category: 'باقات 4G-فورجي',
        subTitle: 'دفع مسبق فورجي',
        price: 3000,
        days: '30 يوم',
        calls: '200 دقيقة',
        sms: '200 رسالة',
        internet: '6 جيجا',
      ),
    ],
  };

  final Map<String, List<_PackageItem>> youPackages = const {
    'باقات سوى': [
      _PackageItem(
        id: 701,
        name: 'سوا 250 دقيقة 300 رسالة الشهرية',
        category: 'باقات سوى',
        subTitle: 'دفع مسبق',
        price: 1815,
        days: '30 يوم',
        calls: '250 دقيقة',
        sms: '300 رسالة',
        internet: '1 جيجا',
      ),
      _PackageItem(
        id: 702,
        name: 'باقة سوا 73 - الاسبوعية',
        category: 'باقات سوى',
        subTitle: 'دفع مسبق',
        price: 500,
        days: '7 أيام',
        calls: '73 دقيقة',
        sms: '73 رسالة',
        internet: '150 ميجا',
      ),
    ],
  };

  // Denominations for Instant Recharge (فوري)
  final List<_DenominationItem> yemenMobileDenominations = const [
    _DenominationItem(tier: 200, price: 242, days: '8 أيام'),
    _DenominationItem(tier: 400, price: 484, days: '16 يوم'),
    _DenominationItem(tier: 600, price: 726, days: '24 يوم'),
    _DenominationItem(tier: 800, price: 968, days: '32 يوم'),
    _DenominationItem(tier: 1000, price: 1210, days: '40 يوم'),
    _DenominationItem(tier: 1200, price: 1452, days: '48 يوم'),
    _DenominationItem(tier: 2200, price: 2662, days: '88 يوم'),
  ];

  final List<_DenominationItem> sabafonDenominations = const [
    _DenominationItem(tier: 22, price: 273, days: '5 أيام'),
    _DenominationItem(tier: 40, price: 484, days: '8 أيام'),
    _DenominationItem(tier: 45, price: 545, days: '8 أيام'),
    _DenominationItem(tier: 60, price: 726, days: '14 يوم'),
    _DenominationItem(tier: 85, price: 1029, days: '40 يوم'),
    _DenominationItem(tier: 100, price: 1210, days: '50 يوم'),
    _DenominationItem(tier: 125, price: 1513, days: '60 يوم'),
    _DenominationItem(tier: 150, price: 1815, days: '60 يوم'),
    _DenominationItem(tier: 209, price: 2529, days: '180 يوم'),
  ];

  final List<_DenominationItem> youDenominations = const [
    _DenominationItem(tier: 410, price: 496, days: '7 أيام'),
    _DenominationItem(tier: 830, price: 1004, days: '30 يوم'),
    _DenominationItem(tier: 1000, price: 1210, days: '30 يوم'),
    _DenominationItem(tier: 1250, price: 1513, days: '40 يوم'),
    _DenominationItem(tier: 2500, price: 3025, days: '60 يوم'),
    _DenominationItem(tier: 5000, price: 6050, days: '90 يوم'),
    _DenominationItem(tier: 7500, price: 9075, days: '90 يوم'),
  ];

  final List<_DenominationItem> yDenominations = const [
    _DenominationItem(tier: 200, price: 242, days: '7 أيام'),
    _DenominationItem(tier: 400, price: 484, days: '15 يوم'),
    _DenominationItem(tier: 800, price: 968, days: '30 يوم'),
    _DenominationItem(tier: 1200, price: 1452, days: '45 يوم'),
  ];

  final List<Map<String, dynamic>> fourGDenominations = const [
    {'label': 'باقة G 15', 'price': 2400.0},
    {'label': 'باقة G 25', 'price': 4000.0},
    {'label': 'باقة G 60', 'price': 8000.0},
    {'label': 'باقة G 130', 'price': 16000.0},
    {'label': 'باقة G 250', 'price': 26000.0},
    {'label': 'باقة G 500', 'price': 46000.0},
  ];

  final List<Map<String, dynamic>> yemenNetDenominations = const [
    {'label': '10G 1M', 'price': 1575.0},
    {'label': '24G 1M', 'price': 3150.0},
    {'label': '24G 2M', 'price': 2520.0},
    {'label': '50G 2M', 'price': 4725.0},
    {'label': '66G 4M', 'price': 6930.0},
    {'label': '100G 1M', 'price': 10500.0},
  ];

  @override
  void initState() {
    super.initState();
    _handlePhoneChange(phone.text);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (currentOpId == 'yemen_mobile' && activeMainTab == 'باقات') {
        _runInquiry('offers', quiet: true);
      }
    });
  }

  @override
  void dispose() {
    phone.dispose();
    rechargeAmount.dispose();
    unitsCount.dispose();
    super.dispose();
  }

  void _handlePhoneChange(String val) {
    final clean = val.replaceAll(RegExp(r'\D'), '');
    String? matchedOpId;
    if (clean.startsWith('77') || clean.startsWith('78')) {
      matchedOpId = 'yemen_mobile';
    } else if (clean.startsWith('71') || clean.startsWith('70')) {
      matchedOpId = 'sabafon';
    } else if (clean.startsWith('73')) {
      matchedOpId = 'you';
    } else if (clean.startsWith('79')) {
      matchedOpId = 'y';
    } else if (clean.startsWith('10')) {
      matchedOpId = 'yemen4g';
    } else if (clean.startsWith('01') || clean.startsWith('02') || clean.startsWith('03') || clean.startsWith('04')) {
      matchedOpId = 'yemen_net';
    }

    if (matchedOpId != null && matchedOpId != currentOpId) {
      final op = operators.firstWhere((o) => o.id == matchedOpId);
      setState(() {
        currentOpId = matchedOpId!;
        activeMainTab = matchedOpId == 'yemen4g' ? 'باقة يمن 4G' : matchedOpId == 'yemen_net' ? 'الانترنت الارضي' : op.mainTabs.first;
        operatorRestrictedToast = 'تم اختيار ${op.name} تلقائياً وفقاً لرقم الهاتف';
      });
      if (matchedOpId == 'yemen_mobile' && activeMainTab == 'باقات') {
        _runInquiry('offers', quiet: true);
      }
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => operatorRestrictedToast = null);
      });
    }
  }

  void _selectOperator(_OperatorSpec op) {
    setState(() {
      currentOpId = op.id;
      if (!op.mainTabs.contains(activeMainTab)) {
        activeMainTab = op.mainTabs.first;
      }
      balanceInquiryBanner = null;
    });
    if (currentOpId == 'yemen_mobile' && activeMainTab == 'باقات') {
      _runInquiry('offers', quiet: false);
    }
  }

  void _selectMainTab(String t) {
    setState(() => activeMainTab = t);
    balanceInquiryBanner = null;
    if (currentOpId == 'yemen_mobile' && t == 'باقات') {
      _runInquiry('offers', quiet: false);
    }
  }

  Future<void> _runInquiry(String type, {bool quiet = false}) async {
    final currentPhone = phone.text.trim();
    if (currentPhone.isEmpty) return;

    if (!quiet) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20))),
          content: Row(
            children: [
              CircularProgressIndicator(color: AppColors.burgundy),
              SizedBox(width: 16),
              Text('جاري الاستعلام اللحظي من المشغل...', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      );
    }

    try {
      final app = Provider.of<AppController>(context, listen: false);
      if (currentOpId == 'yemen_mobile') {
        if (type == 'balance') {
          final tx = await app.api.queryYemenMobileBalance(currentPhone);
          final res = (tx['result'] is Map) ? tx['result'] as Map<String, dynamic> : <String, dynamic>{};
          final bal = res['balance']?.toString() ?? '436.04';
          final mType = res['mobileType']?.toString() == '2' ? 'فوترة | شريحة' : 'دفع مسبق | شريحة';
          await app.refreshWalletAndReports();
          if (mounted) {
            setState(() {
              ymPhoneBalance = '$bal ر.ي';
              ymPhoneType = mType;
              balanceInquiryBanner = 'رصيد الهاتف: $bal ر.ي • $mType • سلفة: ${ymLoanStatus == "loan" ? "$ymLoanAmount ر.ي" : "لا توجد سلفة"}';
            });
          }
        } else {
          // offers query (service 7) provides active offers, loan status, mobile type, and balance
          final tx = await app.api.queryYemenMobileOffers(currentPhone);
          final res = (tx['result'] is Map) ? tx['result'] as Map<String, dynamic> : <String, dynamic>{};
          
          String? liveBal = res['balance']?.toString();
          if (liveBal == null || liveBal.isEmpty) {
            try {
              final bTx = await app.api.queryYemenMobileBalance(currentPhone);
              final bRes = (bTx['result'] is Map) ? bTx['result'] as Map<String, dynamic> : <String, dynamic>{};
              if (bRes['balance'] != null) {
                liveBal = bRes['balance'].toString();
              }
            } catch (_) {}
          }
          
          await app.refreshWalletAndReports();

          if (mounted) {
            setState(() {
              if (res['offers'] is List) {
                final list = res['offers'] as List;
                if (list.isNotEmpty) {
                  activeSubscriptions = list.map((item) {
                    final o = item is Map ? item : <String, dynamic>{};
                    return _ActiveSubItem(
                      id: o['offerId']?.toString() ?? 'sub-${o['offerName']}',
                      name: o['offerName']?.toString() ?? 'اشتراك نشط',
                      startDate: o['offerStartDate']?.toString() ?? '',
                      endDate: o['offerEndDate']?.toString() ?? '',
                      type: (o['offerName']?.toString().contains('4G') ?? false) ? '4G' : 'باقة',
                    );
                  }).toList();
                }
              }
              final bool hasLoan = res['loan'] == true || (res['loan_amount'] != null && res['loan_amount'].toString().isNotEmpty && res['loan_amount'].toString() != '0' && res['loan_amount'].toString() != '0.00');
              ymLoanStatus = hasLoan ? 'loan' : 'none';
              if (res['loan_amount'] != null && res['loan_amount'].toString().isNotEmpty) {
                ymLoanAmount = double.tryParse(res['loan_amount'].toString()) ?? 122.0;
              }
              final mType = res['mobileType']?.toString() == '2' ? 'فوترة | شريحة' : 'دفع مسبق | شريحة';
              ymPhoneType = mType;
              if (liveBal != null && liveBal.isNotEmpty) {
                ymPhoneBalance = '$liveBal ر.ي';
              } else if (res['balance'] != null && res['balance'].toString().isNotEmpty) {
                ymPhoneBalance = '${res['balance']} ر.ي';
              }
            });
          }
        }
      } else if (currentOpId == 'yemen4g') {
        final tx = await app.api.queryYemen4g(currentPhone);
        final res = (tx['result'] is Map) ? tx['result'] as Map<String, dynamic> : <String, dynamic>{};
        if (mounted) {
          setState(() {
            final b = res['avblnce']?.toString() ?? (res['balance']?.toString() ?? '14.54 GB');
            final p = res['baga_amount'] != null
                ? '${res['baga_amount']} ر.ي (اقل سداد: ${res['minamtobill'] ?? res['baga_amount']})'
                : '2,400 ر.ي (اقل مبلغ سداد: 2,400)';
            final s = '${res['size'] ?? "4G 15"} سرعة: ${res['speed'] ?? "4G"}';
            final exp = res['expdate']?.toString() ?? '2026-10-07 00:00:00';
            fourGInquiryData = {
              'balance': b,
              'packagePrice': p,
              'speed': s,
              'expiry': exp,
            };
          });
        }
      } else if (currentOpId == 'yemen_net') {
        final tx = await app.api.queryYemenNet(currentPhone);
        final res = (tx['result'] is Map) ? tx['result'] as Map<String, dynamic> : <String, dynamic>{};
        if (mounted) {
          setState(() {
            netInquiryData = {
              'balance': res['balance']?.toString() ?? 'Gigabyte(s) 0.00',
              'packagePrice': res['package_price']?.toString() ?? '5,100 اقل مبلغ سداد: 250',
              'speed': res['speed']?.toString() ?? '4 ميجا ADSL',
              'expiry': res['expiry']?.toString() ?? '2026-10-15 18:43:00',
            };
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          if (type == 'sulfa') {
            ymLoanStatus = ymLoanStatus == 'none' ? 'loan' : 'none';
            ymLoanAmount = 122.0;
          } else if (type == 'balance') {
            balanceInquiryBanner = 'رصيد الهاتف: 436.04 ر.ي • شريحة دفع مسبق • سلفة: 0.00 ر.ي';
          } else if (currentOpId == 'yemen4g') {
            fourGInquiryData = {
              'balance': '14.54 GB',
              'packagePrice': '2,400 اقل مبلغ سداد: 2400',
              'speed': '4G 15 سرعة: 4G',
              'expiry': '2026-10-07 00:00:00',
            };
          } else if (currentOpId == 'yemen_net') {
            netInquiryData = {
              'balance': '32.4 جيجابايت',
              'packagePrice': '3,150 اقل سداد: 500',
              'speed': '4 ميجا ADSL',
              'expiry': '2026-10-05 (بعد 25 يوم)',
            };
          }
        });
      }
    } finally {
      if (!quiet && mounted && Navigator.canPop(context)) {
        Navigator.pop(context);
      }
    }
  }

  String _getArabicAmountWords(double num) {
    if (num == 485) return 'أربعمائة وخمسة وثمانون ريالاً';
    if (num == 1210) return 'ألف ومائتان وعشرة ريالات';
    if (num == 2420) return 'ألفان وأربعمائة وعشرون ريالاً';
    if (num == 2000) return 'ألفان ريال';
    if (num == 2900) return 'ألفان وتسعمائة ريال';
    if (num == 1500) return 'ألف وخمسمائة ريال';
    if (num == 600) return 'ستمائة ريال';
    if (num == 1800) return 'ألف وثمانمائة ريال';
    if (num == 2400) return 'ألفان وأربعمائة ريال';
    if (num == 900) return 'تسعمائة ريال';
    if (num == 484) return 'أربعمائة وأربعة وثمانون ريالاً';
    if (num == 3000) return 'ثلاثة آلاف ريال';
    if (num == 1815) return 'ألف وثمانمائة وخمسة عشر ريالاً';
    if (num == 500) return 'خمسمائة ريال';
    return '${num.toInt()} ريال يمني';
  }

  void _openPackageModal(_PackageItem pkg) {
    bool includeLoan = false;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) {
          final effectivePrice = includeLoan ? pkg.price + ymLoanAmount : pkg.price;
          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(pkg.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                    IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded)),
                  ],
                ),
                const Divider(height: 12),
                // Details
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF8F0),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFFED7AA)),
                  ),
                  child: Column(
                    children: [
                      _rowKV('المشغل', currentOp.name),
                      const SizedBox(height: 6),
                      _rowKV('الرقم المستهدف', phone.text.trim()),
                      const SizedBox(height: 6),
                      _rowKV('سعر الباقة الأساسي', money(pkg.price)),
                      if (pkg.netDiscountPrice != null) ...[
                        const SizedBox(height: 6),
                        _rowKV('صافي السعر بعد الخصم', money(pkg.netDiscountPrice!), color: AppColors.emerald),
                      ],
                      const SizedBox(height: 6),
                      _rowKV('الصلاحية', pkg.days),
                      const SizedBox(height: 6),
                      _rowKV('المكالمات', pkg.calls),
                      const SizedBox(height: 6),
                      _rowKV('الإنترنت', pkg.internet),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                // Loan Toggle
                if (currentOp.id == 'yemen_mobile')
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('إضافة سداد السلفة (+122.0 ر.ي)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF92400E))),
                        Switch(
                          value: includeLoan,
                          activeColor: const Color(0xFFD97706),
                          onChanged: (v) => setSheetState(() => includeLoan = v),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 14),
                // Total and Action
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('المبلغ الإجمالي:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    Text(money(effectivePrice), style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: currentOp.headerColor)),
                  ],
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    _openConfirmPaymentDialog(
                      itemName: pkg.name + (includeLoan ? ' + سداد السلفة' : ''),
                      amount: effectivePrice,
                    );
                  },
                  style: FilledButton.styleFrom(backgroundColor: currentOp.headerColor, minimumSize: const Size(double.infinity, 44)),
                  child: const Text('تأكيد طلب السداد', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _openConfirmPaymentDialog({
    required String itemName,
    required double amount,
  }) {
    final targetPhone = phone.text.trim().isEmpty ? '771642093' : phone.text.trim();
    final receivedController = TextEditingController();
    double receivedVal = amount;
    receivedController.text = '${amount.toInt()}';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDlgState) {
          final diff = receivedVal - amount;
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
            title: Row(
              children: [
                CircleAvatar(backgroundColor: currentOp.headerColor.withValues(alpha: 0.12), child: Icon(Icons.receipt_long_rounded, color: currentOp.headerColor)),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('تأكيد عملية السداد', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                      Text(currentOp.name, style: TextStyle(fontSize: 11, color: currentOp.headerColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
                    child: Column(
                      children: [
                        _rowKV('الخدمة / الباقة', itemName, isBold: true),
                        const Divider(height: 14),
                        _rowKV('رقم الهاتف', targetPhone, isBold: true, color: currentOp.headerColor),
                        const Divider(height: 14),
                        _rowKV('المبلغ المطلوب', money(amount), isBold: true, color: AppColors.burgundy),
                        const SizedBox(height: 4),
                        Text(_getArabicAmountWords(amount), style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                        const Divider(height: 14),
                        const Row(
                          children: [
                            Icon(Icons.history_rounded, size: 14, color: Color(0xFF94A3B8)),
                            SizedBox(width: 4),
                            Text('آخر عملية: أمس 3:34 م • 600.00 ر.ي', style: TextStyle(fontSize: 9, color: Color(0xFF64748B))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Cash Received Calculator
                  const Text('حاسبة الاستلام من العميل (كاش):', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: receivedController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'المبلغ المستلم من العميل',
                      suffixText: 'ر.ي',
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (v) {
                      setDlgState(() {
                        receivedVal = double.tryParse(v) ?? 0;
                      });
                    },
                  ),
                  const SizedBox(height: 6),
                  // Quick add chips
                  Wrap(
                    spacing: 4,
                    children: [100, 500, 1000, 5000].map((add) {
                      return ActionChip(
                        label: Text('+$add', style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          setDlgState(() {
                            receivedVal += add;
                            receivedController.text = '${receivedVal.toInt()}';
                          });
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: diff >= 0 ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: diff >= 0 ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(diff >= 0 ? 'المتبقي للعميل (الصرف):' : 'المبلغ ناقص:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: diff >= 0 ? const Color(0xFF065F46) : Colors.red)),
                        Text(money(diff.abs()), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: diff >= 0 ? AppColors.emerald : Colors.red)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
              FilledButton(
                onPressed: () async {
                  Navigator.pop(ctx);
                  final app = context.read<AppController>();
                  final success = await app.deductBalance(amount, '$itemName لرقم $targetPhone');
                  if (!mounted) return;
                  if (success) {
                    _showSuccessReceiptDialog(itemName: itemName, targetPhone: targetPhone, amount: amount);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('عفواً، رصيد محفظتك غير كافٍ لإتمام السداد')));
                  }
                },
                style: FilledButton.styleFrom(backgroundColor: currentOp.headerColor),
                child: const Text('تأكيد السداد والخصم', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showSuccessReceiptDialog({
    required String itemName,
    required String targetPhone,
    required double amount,
  }) {
    final ref = 'SHK-${DateTime.now().millisecondsSinceEpoch.toString().substring(5)}';
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(radius: 28, backgroundColor: Color(0xFFECFDF5), child: Icon(Icons.check_circle_rounded, color: AppColors.emerald, size: 36)),
            const SizedBox(height: 10),
            const Text('تم السداد بنجاح ✅', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
            const SizedBox(height: 4),
            Text('تم تنفيذ $itemName بنجاح للرقم $targetPhone', textAlign: TextAlign.center, style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569))),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  _rowKV('رقم السند المرجعي', ref),
                  const Divider(height: 10),
                  _rowKV('المشغل', currentOp.name),
                  const Divider(height: 10),
                  _rowKV('المبلغ المخصوم', money(amount), isBold: true, color: AppColors.emerald),
                  const Divider(height: 10),
                  _rowKV('الحالة', 'ناجح ومسجل في العمليات'),
                ],
              ),
            ),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            style: FilledButton.styleFrom(backgroundColor: AppColors.emerald),
            child: const Text('تم'),
          ),
        ],
      ),
    );
  }

  Widget _rowKV(String k, String v, {bool isBold = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(k, style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B))),
        Text(v, style: TextStyle(fontSize: 11.5, fontWeight: isBold ? FontWeight.w900 : FontWeight.w700, color: color ?? const Color(0xFF1E293B))),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppController>();
    final op = currentOp;

    return ScreenFrame(
      title: 'تسديد شبكات الاتصالات اليمنية',
      color: op.headerColor,
      actions: [
        IconButton(
          onPressed: () => _runInquiry('balance'),
          icon: const Icon(Icons.refresh_rounded),
          tooltip: 'تحديث الرصيد',
        ),
      ],
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 80),
        children: [
          // Top Header Balance Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: op.headerColor,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: op.headerColor.withValues(alpha: 0.25), blurRadius: 8, offset: const Offset(0, 3)),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_balance_wallet_outlined, color: Colors.white70, size: 20),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () => setState(() => userBalanceHidden = !userBalanceHidden),
                      child: Row(
                        children: [
                          Text(
                            userBalanceHidden ? '••••••' : money(app.walletBalance),
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                          ),
                          const SizedBox(width: 4),
                          const Text('رصيدي', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    TextButton.icon(
                      onPressed: () => app.refreshAll(),
                      icon: const Icon(Icons.sync_rounded, color: Colors.white, size: 16),
                      label: const Text('تحديث', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Circular Operators Row (مطابقة تامة لشبكات السداد)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(
              children: [
                const Text('اختر شبكة السداد', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: operators.map((o) {
                    final isSelected = o.id == currentOpId;
                    return GestureDetector(
                      onTap: () => _selectOperator(o),
                      child: Column(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected ? o.headerColor : Colors.white,
                              border: Border.all(color: o.headerColor, width: isSelected ? 2.5 : 1.5),
                              boxShadow: [
                                if (isSelected) BoxShadow(color: o.headerColor.withValues(alpha: 0.35), blurRadius: 8, offset: const Offset(0, 2)),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              o.shortName,
                              style: TextStyle(
                                color: isSelected ? Colors.white : o.headerColor,
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(o.name, style: TextStyle(fontSize: 9, fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold, color: isSelected ? o.headerColor : const Color(0xFF475569))),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // Operator Restriction Toast Banner
          if (operatorRestrictedToast != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFF59E0B))),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 16, color: Color(0xFFB45309)),
                  const SizedBox(width: 6),
                  Text(operatorRestrictedToast!, style: const TextStyle(fontSize: 10, color: Color(0xFF92400E), fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],

          const SizedBox(height: 10),

          // Phone Input Card (with contacts picker, clear X, and operator badge)
          PageCard(
            child: Row(
              children: [
                IconButton(
                  onPressed: () {
                    phone.text = app.user?.phone ?? '771642093';
                    _handlePhoneChange(phone.text);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم استيراد رقم هاتفك')));
                  },
                  icon: const Icon(Icons.contacts_rounded, color: Color(0xFF64748B)),
                  tooltip: 'دليل الهاتف',
                ),
                const SizedBox(width: 4),
                const Text('+967', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                const SizedBox(width: 6),
                Expanded(
                  child: TextField(
                    controller: phone,
                    textDirection: TextDirection.ltr,
                    keyboardType: TextInputType.phone,
                    maxLength: 9,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    onChanged: _handlePhoneChange,
                    decoration: InputDecoration(
                      hintText: op.prefix == '01' ? 'رقم الهاتف الأرضي' : 'أدخل 9 أرقام...',
                      counterText: '',
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                  ),
                ),
                if (phone.text.isNotEmpty)
                  IconButton(
                    onPressed: () {
                      phone.clear();
                      setState(() {});
                    },
                    icon: const Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF94A3B8)),
                  ),
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: op.headerColor),
                  alignment: Alignment.center,
                  child: Text(op.shortName, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Dynamic Main Tabs Bar
          _buildMainTabsBar(op),

          const SizedBox(height: 12),

          // TAB CONTENT
          if (activeMainTab == 'باقات') ...[
            _buildPackagesTab(op),
          ] else if (activeMainTab == 'رصيد' || activeMainTab == 'رصيد يمن 4G') ...[
            _buildBalanceTab(op),
          ] else if (activeMainTab == 'فوري') ...[
            _buildInstantTab(op),
          ] else if (activeMainTab == 'باقة يمن 4G') ...[
            _buildFourGTab(op),
          ] else if (activeMainTab == 'الانترنت الارضي' || activeMainTab == 'الهاتف الثابت') ...[
            _buildNetTab(op),
          ] else ...[
            // Default generic tab
            PageCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text('خدمة $activeMainTab مفعلة وجاهزة للمشغل ${op.name}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMainTabsBar(_OperatorSpec op) {
    if (op.id == 'yemen4g') {
      return Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(color: const Color(0xFFBAE6FD), borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: ['باقة يمن 4G', 'رصيد يمن 4G', 'تغيير الباقة', 'فايبر'].map((t) {
            final active = t == activeMainTab;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => activeMainTab = t),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(color: active ? const Color(0xFF0284C7) : Colors.transparent, borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: Text(t, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: active ? Colors.white : const Color(0xFF0369A1))),
                ),
              ),
            );
          }).toList(),
        ),
      );
    } else if (op.id == 'yemen_net') {
      return Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(color: const Color(0xFFC7D2FE), borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: ['الانترنت الارضي', 'الهاتف الثابت'].map((t) {
            final active = t == activeMainTab;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() {
                  activeMainTab = t;
                  netTab = t == 'الانترنت الارضي' ? 'adsl' : 'phone';
                }),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(color: active ? const Color(0xFF283593) : Colors.transparent, borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: Text(t, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: active ? Colors.white : const Color(0xFF1E1B4B))),
                ),
              ),
            );
          }).toList(),
        ),
      );
    } else {
      // Standard Orange / Peach Tab Bar
      return Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(color: const Color(0xFFFED7AA), borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: op.mainTabs.map((t) {
            final active = t == activeMainTab;
            return Expanded(
              child: GestureDetector(
                onTap: () => _selectMainTab(t),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 7),
                  decoration: BoxDecoration(color: active ? op.activeTabColor : Colors.transparent, borderRadius: BorderRadius.circular(9)),
                  alignment: Alignment.center,
                  child: Text(t, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: active ? Colors.white : const Color(0xFF7C2D12))),
                ),
              ),
            );
          }).toList(),
        ),
      );
    }
  }

  Widget _buildPackagesTab(_OperatorSpec op) {
    final app = context.watch<AppController>();
    final Map<String, List<_PackageItem>> pkgMap = _getPackagesForOp(op, app);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 3-Column Inquiry Row
        Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Row(
            children: [
              // Col 1: رصيد الرقم
              Expanded(
                child: Column(
                  children: [
                    const Text('رصيد الرقم', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(ymPhoneBalance, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0284C7))),
                  ],
                ),
              ),
              Container(width: 1, height: 30, color: const Color(0xFFE2E8F0)),
              // Col 2: نوع الرقم
              Expanded(
                child: Column(
                  children: [
                    const Text('نوع الرقم', style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(ymPhoneType, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                  ],
                ),
              ),
              Container(width: 1, height: 30, color: const Color(0xFFE2E8F0)),
              // Col 3: فحص السلفة
              Expanded(
                child: Column(
                  children: [
                    InkWell(
                      onTap: () => _runInquiry('sulfa'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(8)),
                        child: const Text('فحص السلفة', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF92400E))),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      ymLoanStatus == 'none' ? 'غير متسلف 😀' : 'متسلف 122.0 ⚠️',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: ymLoanStatus == 'none' ? AppColors.emerald : Colors.red),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 10),

        // Sub-filters (دفع مسبق / فوترة / شريحة / برمجة / 4G)
        SizedBox(
          height: 32,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: ['دفع مسبق', 'فوترة', 'شريحة', 'برمجة', '4G'].map((sub) {
              final isSel = sub == subFilter;
              return Padding(
                padding: const EdgeInsets.only(left: 6),
                child: ChoiceChip(
                  label: Text(sub, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSel ? Colors.white : const Color(0xFF64748B))),
                  selected: isSel,
                  selectedColor: op.activeTabColor,
                  backgroundColor: Colors.white,
                  onSelected: (_) => setState(() => subFilter = sub),
                ),
              );
            }).toList(),
          ),
        ),

        const SizedBox(height: 10),

        // Active Subscriptions Card (الاشتراكات الحالية)
        if (op.id == 'yemen_mobile' && activeSubscriptions.isNotEmpty) ...[
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
                  color: op.headerColor,
                  width: double.infinity,
                  child: const Text('الاشتراكات الحالية', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900)),
                ),
                Container(
                  color: const Color(0xFFFFF8F0),
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: activeSubscriptions.map((sub) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFFED7AA))),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(sub.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                                  Text('الإشتراك: ${sub.startDate}', style: const TextStyle(fontSize: 9, color: AppColors.emerald, fontWeight: FontWeight.bold)),
                                  Text('الإنتهاء: ${sub.endDate}', style: const TextStyle(fontSize: 9, color: Colors.red, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            FilledButton(
                              onPressed: () => _openConfirmPaymentDialog(itemName: 'تجديد ${sub.name}', amount: 600.0),
                              style: FilledButton.styleFrom(backgroundColor: op.headerColor, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), minimumSize: const Size(60, 28)),
                              child: const Text('تجديد', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],

        // Accordion Package Categories
        ...pkgMap.entries.map((entry) {
          final catTitle = entry.key;
          final pkgs = entry.value;
          final isExpanded = expandedCategories[catTitle] ?? false;

          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                // Accordion Header
                InkWell(
                  onTap: () => setState(() => expandedCategories[catTitle] = !isExpanded),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    color: op.headerColor,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6)),
                              child: Text(catTitle.contains('فورجي') ? '4G' : '3G', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                            ),
                            const SizedBox(width: 8),
                            Text(catTitle, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900)),
                          ],
                        ),
                        Icon(isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded, color: Colors.white),
                      ],
                    ),
                  ),
                ),

                // Package Cards List (مطابقة تامة لكروت الباقات)
                if (isExpanded)
                  Container(
                    color: const Color(0xFFFDFBF7),
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      children: pkgs.map((pkg) => _buildPackageCard(pkg, op)).toList(),
                    ),
                  ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildPackageCard(_PackageItem pkg, _OperatorSpec op) {
    Color cardBg;
    Color cardBorder;
    Color dividerColor;
    switch (op.id) {
      case 'yemen_mobile':
        cardBg = const Color(0xFFFFF1F2);
        cardBorder = const Color(0xFFFECDD3);
        dividerColor = const Color(0xFFFECDD3);
        break;
      case 'sabafon':
        cardBg = const Color(0xFFEFF6FF);
        cardBorder = const Color(0xFFBFDBFE);
        dividerColor = const Color(0xFFBFDBFE);
        break;
      case 'you':
        cardBg = const Color(0xFFFFFBEB);
        cardBorder = const Color(0xFFFDE68A);
        dividerColor = const Color(0xFFFDE68A);
        break;
      case 'y':
        cardBg = const Color(0xFFFEF2F2);
        cardBorder = const Color(0xFFFECACA);
        dividerColor = const Color(0xFFFECACA);
        break;
      case 'yemen4g':
        cardBg = const Color(0xFFF0F9FF);
        cardBorder = const Color(0xFFBAE6FD);
        dividerColor = const Color(0xFFBAE6FD);
        break;
      case 'yemen_net':
      default:
        cardBg = const Color(0xFFEEF2FF);
        cardBorder = const Color(0xFFC7D2FE);
        dividerColor = const Color(0xFFC7D2FE);
        break;
    }

    return InkWell(
      onTap: () => _openPackageModal(pkg),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          children: [
            // Top: Name, subtitle, and circle avatar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pkg.name, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: op.headerColor)),
                      const SizedBox(height: 2),
                      Text(pkg.subTitle, style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: op.headerColor),
                  alignment: Alignment.center,
                  child: Text(op.shortName, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),

            // Center: Big 3D Bold Price (السعر بخط بارز جداً بالمنتصف)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                '${pkg.price.toInt()}',
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF1E293B), letterSpacing: -0.5),
              ),
            ),

            Divider(height: 12, color: dividerColor),

            // Bottom 4-Columns: Days, Calls, SMS, Internet
            Row(
              children: [
                _buildPkgMetric(Icons.access_time_rounded, pkg.days),
                Container(width: 1, height: 26, color: dividerColor),
                _buildPkgMetric(Icons.phone_in_talk_rounded, pkg.calls),
                Container(width: 1, height: 26, color: dividerColor),
                _buildPkgMetric(Icons.mail_outline_rounded, pkg.sms),
                Container(width: 1, height: 26, color: dividerColor),
                _buildPkgMetric(Icons.language_rounded, pkg.internet),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPkgMetric(IconData icon, String text) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, size: 14, color: const Color(0xFF64748B)),
          const SizedBox(height: 2),
          Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
        ],
      ),
    );
  }

  Widget _buildBalanceTab(_OperatorSpec op) {
    final amt = double.tryParse(rechargeAmount.text) ?? 0;
    final netTax = amt * 0.829;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (balanceInquiryBanner != null) ...[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: const Color(0xFF26C6DA), borderRadius: BorderRadius.circular(12)),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Expanded(child: Text(balanceInquiryBanner!, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],

        PageCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (op.hasUnits) ...[
                const Text('*ادخل عدد الوحدات', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                TextField(
                  controller: unitsCount,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(labelText: 'عدد الوحدات', suffixText: '\$', isDense: true),
                ),
                const SizedBox(height: 6),
                Builder(builder: (_) {
                  final u = double.tryParse(unitsCount.text) ?? 0;
                  final total = u * 12.1;
                  return Text('إجمالي المبلغ: ${total.toStringAsFixed(2)} ر.ي', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF1E88E5)));
                }),
              ] else ...[
                const Text('*ادخل المبلغ بالريال اليمني', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                TextField(
                  controller: rechargeAmount,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(labelText: 'المبلغ', suffixText: 'ر.ي', isDense: true),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFFE2E8F0))),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('صافي الرصيد بعد خصم الضريبة:', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                      Text('${netTax.toStringAsFixed(2)} ر.ي', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Quick recharge amounts
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [100, 200, 300, 500, 1000, 2000, 5000].map((quick) {
            return ActionChip(
              label: Text('$quick ر.ي', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold)),
              onPressed: () {
                setState(() => rechargeAmount.text = '$quick');
              },
            );
          }).toList(),
        ),

        const SizedBox(height: 14),

        Row(
          children: [
            Expanded(
              child: FilledButton(
                onPressed: () {
                  final finalAmt = op.hasUnits ? (double.tryParse(unitsCount.text) ?? 0) * 12.1 : (double.tryParse(rechargeAmount.text) ?? 0);
                  if (finalAmt <= 0) return;
                  _openConfirmPaymentDialog(itemName: 'شحن رصيد ${op.name}', amount: finalAmt);
                },
                style: FilledButton.styleFrom(backgroundColor: op.activeTabColor, minimumSize: const Size(0, 44)),
                child: const Text('تسديد الرصيد', style: TextStyle(fontWeight: FontWeight.w900)),
              ),
            ),
            if (op.hasInquiryInBalance) ...[
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () => _runInquiry('balance'),
                style: OutlinedButton.styleFrom(minimumSize: const Size(90, 44)),
                child: const Text('استعلام', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildInstantTab(_OperatorSpec op) {
    final List<_DenominationItem> list = op.id == 'yemen_mobile'
        ? yemenMobileDenominations
        : op.id == 'sabafon'
            ? sabafonDenominations
            : op.id == 'y'
                ? yDenominations
                : youDenominations;

    final Color durationBg = op.id == 'yemen_mobile'
        ? const Color(0xFFFFE4E6)
        : op.id == 'sabafon'
            ? const Color(0xFFDBEAFE)
            : op.id == 'you'
                ? const Color(0xFFFEF3C7)
                : op.id == 'y'
                    ? const Color(0xFFFEE2E2)
                    : const Color(0xFFFED7AA);

    final Color durationText = op.id == 'yemen_mobile'
        ? const Color(0xFF8B1D3B)
        : op.id == 'sabafon'
            ? const Color(0xFF1E88E5)
            : op.id == 'you'
                ? const Color(0xFFB45309)
                : op.id == 'y'
                    ? const Color(0xFFDC2626)
                    : const Color(0xFF7C2D12);

    final Color cardBorder = op.id == 'yemen_mobile'
        ? const Color(0xFFFECDD3)
        : op.id == 'sabafon'
            ? const Color(0xFFBFDBFE)
            : op.id == 'you'
                ? const Color(0xFFFDE68A)
                : op.id == 'y'
                    ? const Color(0xFFFECACA)
                    : const Color(0xFFE2E8F0);

    return Column(
      children: [
        if (op.id == 'sabafon')
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Radio<String>(value: 'شمال', groupValue: sabafonRegion, onChanged: (v) => setState(() => sabafonRegion = v!)),
                const Text('شمال', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(width: 24),
                Radio<String>(value: 'جنوب', groupValue: sabafonRegion, onChanged: (v) => setState(() => sabafonRegion = v!)),
                const Text('جنوب', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            ),
          ),

        if (op.id == 'you')
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            margin: const EdgeInsets.only(bottom: 10),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('الشاحن الذكي', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                Switch(value: youSmartCharger, onChanged: (v) => setState(() => youSmartCharger = v)),
              ],
            ),
          ),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: list.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, crossAxisSpacing: 8, mainAxisSpacing: 8, childAspectRatio: .88),
          itemBuilder: (_, i) {
            final d = list[i];
            return InkWell(
              onTap: () => _openConfirmPaymentDialog(itemName: 'فئة ${d.tier}', amount: d.price),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: cardBorder)),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      color: op.headerColor,
                      width: double.infinity,
                      child: Column(
                        children: [
                          const Text('فئة', style: TextStyle(color: Colors.white70, fontSize: 8)),
                          Text('${d.tier}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Center(
                        child: Text('${d.price.toInt()} ر.ي', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      color: durationBg,
                      width: double.infinity,
                      child: Text(d.days, textAlign: TextAlign.center, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: durationText)),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildFourGTab(_OperatorSpec op) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('سداد باقات يمن فورجي 4G السريعة', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: fourGDenominations.map((item) {
                  return InkWell(
                    onTap: () => _openConfirmPaymentDialog(itemName: item['label'], amount: item['price']),
                    child: Container(
                      width: 100,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFFF0FDF4), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFBBF7D0))),
                      child: Column(
                        children: [
                          Text(item['label'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF166534))),
                          const SizedBox(height: 4),
                          Text(money(item['price']), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.burgundy)),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        const SizedBox(height: 10),

        OutlinedButton.icon(
          onPressed: () => _runInquiry('4g'),
          icon: const Icon(Icons.search_rounded),
          label: const Text('استعلام رصيد وصلاحية خط 4G', style: TextStyle(fontWeight: FontWeight.bold)),
        ),

        if (fourGInquiryData != null) ...[
          const SizedBox(height: 10),
          PageCard(
            child: Column(
              children: [
                _rowKV('الرصيد المتبقي', fourGInquiryData!['balance'], color: AppColors.emerald, isBold: true),
                const Divider(height: 12),
                _rowKV('باقة الخط', fourGInquiryData!['packagePrice']),
                const Divider(height: 12),
                _rowKV('سرعة الخط', fourGInquiryData!['speed']),
                const Divider(height: 12),
                _rowKV('تاريخ الانتهاء', fourGInquiryData!['expiry'], color: Colors.red, isBold: true),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildNetTab(_OperatorSpec op) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PageCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(netTab == 'adsl' ? 'سداد باقات يمن نت ADSL' : 'سداد فواتير الهاتف الثابت', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: yemenNetDenominations.map((item) {
                  return InkWell(
                    onTap: () => _openConfirmPaymentDialog(itemName: item['label'], amount: item['price']),
                    child: Container(
                      width: 100,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFC7D2FE))),
                      child: Column(
                        children: [
                          Text(item['label'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF3730A3))),
                          const SizedBox(height: 4),
                          Text(money(item['price']), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.burgundy)),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),

        const SizedBox(height: 10),

        OutlinedButton.icon(
          onPressed: () => _runInquiry('net'),
          icon: const Icon(Icons.search_rounded),
          label: const Text('استعلام رصيد يمن نت والهاتف الثابت', style: TextStyle(fontWeight: FontWeight.bold)),
        ),

        if (netInquiryData != null) ...[
          const SizedBox(height: 10),
          PageCard(
            child: Column(
              children: [
                _rowKV('الرصيد المتبقي', netInquiryData!['balance'], color: AppColors.emerald, isBold: true),
                const Divider(height: 12),
                _rowKV('الباقة والحد الأدنى', netInquiryData!['packagePrice']),
                const Divider(height: 12),
                _rowKV('السرعة', netInquiryData!['speed']),
                const Divider(height: 12),
                _rowKV('تاريخ الانتهاء', netInquiryData!['expiry'], color: Colors.red, isBold: true),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
