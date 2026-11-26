import 'package:material_ui/material_ui.dart';

class DashboardHeader extends StatelessWidget {
  const DashboardHeader({
    super.key,
    required this.roleLabel,
    required this.fullName,
    this.onNotifications,
    this.onProfile,
    this.onLogout,
  });

  final String roleLabel;
  final String fullName;
  final VoidCallback? onNotifications;
  final VoidCallback? onProfile;
  final VoidCallback? onLogout;

  String get initials {
    final parts = fullName.trim().split(RegExp(r'\s+'));

    if (parts.isEmpty || parts.first.isEmpty) {
      return 'TL';
    }

    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }

    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    const green = Color(0xFF28683A);

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE8EDE8))),
      ),
      child: Row(
        children: [
          Container(
            height: 34,
            width: 34,
            decoration: BoxDecoration(
              color: const Color(0xFFE8F2E8),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.eco, color: green, size: 22),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: 'Tea',
                        style: TextStyle(
                          color: green,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      TextSpan(
                        text: 'Ledger',
                        style: TextStyle(
                          color: Color(0xFF17231A),
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  style: TextStyle(fontSize: 17),
                ),
                Text(
                  roleLabel.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 9,
                    letterSpacing: 1.0,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF758075),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onNotifications,
            tooltip: 'Notifications',
            icon: const Icon(
              Icons.notifications_none,
              color: Color(0xFF465348),
            ),
          ),
          InkWell(
            onTap: onProfile,
            borderRadius: BorderRadius.circular(30),
            child: CircleAvatar(
              radius: 17,
              backgroundColor: const Color(0xFFE8F2E8),
              child: Text(
                initials,
                style: const TextStyle(
                  color: green,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ),

          IconButton(
            onPressed: onLogout,
            tooltip: 'Logout',
            icon: const Icon(Icons.logout, color: Color(0xFF465348)),
          ),
        ],
      ),
    );
  }
}
