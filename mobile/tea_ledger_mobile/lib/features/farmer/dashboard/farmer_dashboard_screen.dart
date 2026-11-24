import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_providers.dart';

class FarmerDashboardScreen extends ConsumerWidget {
  const FarmerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('TeaLedger'),
        actions: [
          IconButton(
            onPressed: () async {
              await ref.read(authControllerProvider).logout();
              if (context.mounted) context.go('/login');
            },
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text(
            'Farmer Dashboard',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Welcome, ${user?.fullName ?? 'Farmer'}',
            style: const TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 25),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.eco, size: 35, color: Color(0xFF2E7D32)),
                SizedBox(height: 12),
                Text(
                  'Your tea farming account',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                SizedBox(height: 5),
                Text('Your farmer services will appear here.'),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Your services',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 19),
          ),
          const SizedBox(height: 15),
          _serviceTile(Icons.local_shipping, 'Tea collections'),
          _serviceTile(Icons.account_balance_wallet, 'Earnings'),
          _serviceTile(Icons.menu_book, 'Passbook'),
          _serviceTile(Icons.request_quote, 'Loans and deductions'),
          _serviceTile(Icons.notifications_outlined, 'Notifications'),
        ],
      ),
    );
  }

  Widget _serviceTile(IconData icon, String title) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF2E7D32)),
        title: Text(title),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}
