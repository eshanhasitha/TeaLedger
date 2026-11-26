import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_providers.dart';
import '../../../shared/widgets/dashboard_bottom_nav.dart';
import '../../../shared/widgets/dashboard_header.dart';
import '../../../shared/widgets/dashboard_stat_card.dart';

class CollectorDashboardScreen extends ConsumerWidget {
  const CollectorDashboardScreen({super.key});

  static const List<DashboardNavItem> navItems = [
    DashboardNavItem(
      label: 'Today',
      icon: Icons.list_alt_outlined,
      route: '/collector',
    ),
    DashboardNavItem(
      label: 'Farmers',
      icon: Icons.people_outline,
      route: '/collector/farmers',
    ),
    DashboardNavItem(
      label: 'Finance',
      icon: Icons.currency_rupee,
      route: '/collector/finance',
    ),
    DashboardNavItem(
      label: 'Settlement',
      icon: Icons.bar_chart_outlined,
      route: '/collector/settlement',
    ),
    DashboardNavItem(
      label: 'Reports',
      icon: Icons.description_outlined,
      route: '/collector/reports',
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
    final user = ref.watch(authControllerProvider).user;
    final fullName = user?.fullName ?? 'Collector';

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      body: Column(
        children: [
          DashboardHeader(
            roleLabel: 'Collector Portal',
            fullName: fullName,
            onNotifications: () {
              _showComingSoon(context, 'Notifications');
            },
            onProfile: () {
              _showComingSoon(context, 'Collector profile');
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
                const SizedBox(height: 18),

                const Text(
                  'TODAY AT A GLANCE',
                  style: TextStyle(
                    color: Color(0xFF758075),
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 12),

                _buildStatistics(),
                const SizedBox(height: 20),

                _buildRequestsCard(context),
                const SizedBox(height: 14),

                _buildQuickActions(context),
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
        ? 'Collector'
        : fullName.trim().split(RegExp(r'\s+')).first;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EDE8)),
      ),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 22,
            backgroundColor: Color(0xFFE8F2E8),
            child: Icon(Icons.agriculture_outlined, color: Color(0xFF28683A)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good day, $firstName',
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
                  'Your collection operations',
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

  Widget _buildStatistics() {
    return Column(
      children: [
        Row(
          children: const [
            Expanded(
              child: DashboardStatCard(
                title: 'Assigned farmers',
                value: '—',
                subtitle: 'Assigned to you',
                icon: Icons.people_outline,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: DashboardStatCard(
                title: 'Pending requests',
                value: '—',
                subtitle: 'Awaiting collection',
                icon: Icons.pending_actions_outlined,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: const [
            Expanded(
              child: DashboardStatCard(
                title: 'Collected today',
                value: '— kg',
                subtitle: 'Verified net weight',
                icon: Icons.scale_outlined,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: DashboardStatCard(
                title: 'Collections today',
                value: '—',
                subtitle: 'Completed records',
                icon: Icons.inventory_2_outlined,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRequestsCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EDE8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Collection requests',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF17231A),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Review tea-ready requests submitted by your assigned farmers.',
            style: TextStyle(
              height: 1.4,
              fontSize: 12,
              color: Color(0xFF758075),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: OutlinedButton.icon(
              onPressed: () {
                _showComingSoon(context, 'Collection requests');
              },
              icon: const Icon(Icons.assignment_outlined),
              label: const Text('View requests'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF28683A),
                side: const BorderSide(color: Color(0xFF28683A)),
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

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick actions',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w800,
            color: Color(0xFF17231A),
          ),
        ),
        const SizedBox(height: 12),
        _actionTile(
          icon: Icons.people_outline,
          title: 'My farmers',
          subtitle: 'View assigned farmers',
          onTap: () => context.go('/collector/farmers'),
        ),
        _actionTile(
          icon: Icons.scale_outlined,
          title: 'Record collection',
          subtitle: 'Record and verify tea weight',
          onTap: () => _showComingSoon(context, 'Record collection'),
        ),
        _actionTile(
          icon: Icons.account_balance_wallet_outlined,
          title: 'Finance',
          subtitle: 'View financial activity',
          onTap: () => context.go('/collector/finance'),
        ),
      ],
    );
  }

  Widget _actionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 9),
      child: ListTile(
        onTap: onTap,
        leading: Container(
          height: 42,
          width: 42,
          decoration: BoxDecoration(
            color: const Color(0xFFE8F2E8),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: const Color(0xFF28683A)),
        ),
        title: Text(
          title,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11)),
        trailing: const Icon(Icons.chevron_right, color: Color(0xFF899389)),
      ),
    );
  }

  /*  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature will be implemented in an upcoming day.'),
      ),
    );
  }*/
}
