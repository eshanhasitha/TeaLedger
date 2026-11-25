import 'package:material_ui/material_ui.dart';

import 'dashboard_bottom_nav.dart';
import 'dashboard_header.dart';

class DashboardSectionPlaceholder extends StatelessWidget {
  const DashboardSectionPlaceholder({
    super.key,
    required this.title,
    required this.roleLabel,
    required this.fullName,
    required this.items,
    required this.selectedIndex,
    required this.onNavigation,
  });

  final String title;
  final String roleLabel;
  final String fullName;
  final List<DashboardNavItem> items;
  final int selectedIndex;
  final ValueChanged<int> onNavigation;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      body: Column(
        children: [
          DashboardHeader(roleLabel: roleLabel, fullName: fullName),
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      height: 76,
                      width: 76,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F2E8),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(
                        Icons.construction_outlined,
                        size: 38,
                        color: Color(0xFF28683A),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF17231A),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'This section will be implemented in an upcoming '
                      'TeaLedger development day.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF758075), height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: DashboardBottomNav(
        items: items,
        selectedIndex: selectedIndex,
        onTap: (index) {
          // This callback is supplied by the route builder.
          onNavigation(index);
        },
      ),
    );
  }
}
