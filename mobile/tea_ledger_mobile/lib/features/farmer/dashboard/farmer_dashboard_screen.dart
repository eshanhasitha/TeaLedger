import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_providers.dart';
import '../../../shared/widgets/dashboard_bottom_nav.dart';
import '../../../shared/widgets/dashboard_header.dart';
import '../../../shared/widgets/dashboard_stat_card.dart';

class FarmerDashboardScreen extends ConsumerWidget {
  const FarmerDashboardScreen({super.key});

  static const List<DashboardNavItem> navItems = [
    DashboardNavItem(
      label: 'Home',
      icon: Icons.home_outlined,
      route: '/farmer',
    ),
    DashboardNavItem(
      label: 'Passbook',
      icon: Icons.menu_book_outlined,
      route: '/farmer/passbook',
    ),
    DashboardNavItem(
      label: 'Earnings',
      icon: Icons.currency_rupee,
      route: '/farmer/earnings',
    ),
    DashboardNavItem(
      label: 'Finance',
      icon: Icons.description_outlined,
      route: '/farmer/finance',
    ),
    DashboardNavItem(
      label: 'Settlement',
      icon: Icons.bar_chart_outlined,
      route: '/farmer/settlement',
    ),
  ];

  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature will be implemented in an upcoming day.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;

    final fullName = user?.fullName ?? 'Farmer';

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      body: Column(
        children: [
          DashboardHeader(
            roleLabel: 'Farmer Portal',
            fullName: fullName,
            onNotifications: () {
              _showComingSoon(context, 'Notifications');
            },
            onProfile: () {
              _showComingSoon(context, 'Farmer profile');
            },
            onLogout: () async {
              await ref.read(authControllerProvider).logout();

              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
              children: [
                _buildGreeting(fullName),
                const SizedBox(height: 16),

                _buildTeaReadyCard(context),
                const SizedBox(height: 18),

                const Text(
                  'THIS MONTH',
                  style: TextStyle(
                    color: Color(0xFF758075),
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 12),

                _buildStatistics(),
                const SizedBox(height: 18),

                _buildLatestPassbookEntry(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: DashboardBottomNav(
        items: navItems,
        selectedIndex: 0,
        onTap: (index) {
          context.go(navItems[index].route);
        },
      ),
    );
  }

  Widget _buildGreeting(String fullName) {
    final firstName = fullName.trim().isEmpty
        ? 'Farmer'
        : fullName.trim().split(RegExp(r'\s+')).first;

    final initials = fullName.trim().isEmpty
        ? 'F'
        : fullName.trim().split(RegExp(r'\s+')).length > 1
        ? '${fullName.trim().split(RegExp(r'\s+')).first[0]}'
              '${fullName.trim().split(RegExp(r'\s+')).last[0]}'
        : fullName.trim()[0].toUpperCase();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EDE8)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: const Color(0xFFE8F2E8),
            child: Text(
              initials.toUpperCase(),
              style: const TextStyle(
                color: Color(0xFF28683A),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, $firstName',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: Color(0xFF17231A),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Your farmer account',
                  style: TextStyle(fontSize: 11, color: Color(0xFF758075)),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'Active',
              style: TextStyle(
                color: Color(0xFF28683A),
                fontWeight: FontWeight.w700,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTeaReadyCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F2E8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD6E8D7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Is your tea ready?',
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w800,
              color: Color(0xFF17231A),
            ),
          ),
          const SizedBox(height: 7),
          const Text(
            'Tell your collector when your tea leaves '
            'are ready for collection.',
            style: TextStyle(
              height: 1.4,
              fontSize: 12,
              color: Color(0xFF596B5C),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                context.go('/farmer/tea-ready');
              },
              icon: const Icon(Icons.eco_outlined, size: 19),
              label: const Text(
                'Tea is ready',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF28683A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatistics() {
    return Column(
      children: [
        Row(
          children: const [
            Expanded(
              child: DashboardStatCard(
                title: 'Last collection',
                value: '— kg',
                subtitle: 'Awaiting collection data',
                icon: Icons.scale_outlined,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: DashboardStatCard(
                title: 'Collected so far',
                value: '— kg',
                subtitle: 'This month',
                icon: Icons.inventory_2_outlined,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: const [
            Expanded(
              child: DashboardStatCard(
                title: 'Earnings so far',
                value: 'Rs. —',
                subtitle: 'This month',
                icon: Icons.currency_rupee,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: DashboardStatCard(
                title: 'Loan balance',
                value: 'Rs. —',
                subtitle: 'Outstanding balance',
                icon: Icons.account_balance_outlined,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLatestPassbookEntry() {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EDE8)),
      ),
      child: Column(
        children: [
          Row(
            children: const [
              Expanded(
                child: Text(
                  'Latest passbook entry',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF17231A),
                  ),
                ),
              ),
              Text(
                '—',
                style: TextStyle(color: Color(0xFF758075), fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 18),
          _passbookRow('Gross weight', '— kg'),
          const SizedBox(height: 12),
          _passbookRow('Reductions', '— kg'),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1, color: Color(0xFFE8EDE8)),
          ),
          _passbookRow('Final weight', '— kg', isFinal: true),
          const SizedBox(height: 8),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Passbook values will appear when the collection '
              'history API is connected.',
              style: TextStyle(fontSize: 10, color: Color(0xFF899389)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _passbookRow(String label, String value, {bool isFinal = false}) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isFinal ? FontWeight.w800 : FontWeight.w500,
              color: const Color(0xFF687468),
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: isFinal ? const Color(0xFF28683A) : const Color(0xFF17231A),
          ),
        ),
      ],
    );
  }
}
