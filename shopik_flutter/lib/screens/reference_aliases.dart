import 'package:flutter/material.dart';
import 'reference_home.dart';
import 'reference_store.dart';
import 'reference_account_clean.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) => const MainHomeScreen();
}

class GamesScreen extends StatelessWidget {
  const GamesScreen({super.key});
  @override
  Widget build(BuildContext context) => const GamesServicesScreen();
}

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});
  @override
  Widget build(BuildContext context) => const UserProfileEditScreen();
}

class OperationsScreen extends StatelessWidget {
  const OperationsScreen({super.key});
  @override
  Widget build(BuildContext context) => const OperationsView();
}

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});
  @override
  Widget build(BuildContext context) => const OrdersDetailView();
}

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.product});
  final Map<String, dynamic> product;
  @override
  Widget build(BuildContext context) => ProductDetailView(product: product);
}

class StatementScreen extends StatelessWidget {
  const StatementScreen({super.key});
  @override
  Widget build(BuildContext context) => const AccountStatementScreen();
}

class StoreScreen extends StatelessWidget {
  const StoreScreen({super.key});
  @override
  Widget build(BuildContext context) => const StoreView();
}

class TransferScreen extends StatelessWidget {
  const TransferScreen({super.key});
  @override
  Widget build(BuildContext context) => const SubscriberTransferScreen();
}

class WifiScreen extends StatelessWidget {
  const WifiScreen({super.key});
  @override
  Widget build(BuildContext context) => const WifiNetworksScreen();
}

