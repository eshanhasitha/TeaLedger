import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/auth/auth_controller.dart';
import '../core/auth/auth_providers.dart';
import '../features/authentication/presentation/login_screen.dart';
import '../features/farmer/dashboard/farmer_dashboard_screen.dart';
import '../features/collector/dashboard/collector_dashboard_screen.dart';
import '../shared/widgets/app_loading.dart';
import '../shared/widgets/dashboard_section_placeholder.dart';
import '../features/farmer/tea_ready/tea_ready_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: auth,
    redirect: (context, state) {
      final location = state.matchedLocation;

      if (auth.status == AuthStatus.loading) {
        return location == '/splash' ? null : '/splash';
      }

      if (!auth.isAuthenticated) {
        return location == '/login' ? null : '/login';
      }

      if (location == '/login' || location == '/splash') {
        return auth.isFarmer ? '/farmer' : '/collector';
      }

      if (location.startsWith('/farmer') && !auth.isFarmer) {
        return '/collector';
      }

      if (location.startsWith('/collector') && !auth.isCollector) {
        return '/farmer';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const AppLoading()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),

      GoRoute(
        path: '/farmer',
        builder: (context, state) => const FarmerDashboardScreen(),
      ),
      GoRoute(
        path: '/farmer/tea-ready',
        builder: (context, state) => const TeaReadyScreen(),
      ),
      GoRoute(
        path: '/farmer/passbook',
        builder: (context, state) =>
            _farmerSection(context, auth, 'Digital Passbook', 1),
      ),
      GoRoute(
        path: '/farmer/earnings',
        builder: (context, state) =>
            _farmerSection(context, auth, 'Earnings', 2),
      ),
      GoRoute(
        path: '/farmer/finance',
        builder: (context, state) =>
            _farmerSection(context, auth, 'Finance', 3),
      ),
      GoRoute(
        path: '/farmer/settlement',
        builder: (context, state) =>
            _farmerSection(context, auth, 'Settlements', 4),
      ),

      GoRoute(
        path: '/collector',
        builder: (context, state) => const CollectorDashboardScreen(),
      ),
      GoRoute(
        path: '/collector/farmers',
        builder: (context, state) =>
            _collectorSection(context, auth, 'My Farmers', 1),
      ),
      GoRoute(
        path: '/collector/finance',
        builder: (context, state) =>
            _collectorSection(context, auth, 'Finance', 2),
      ),
      GoRoute(
        path: '/collector/settlement',
        builder: (context, state) =>
            _collectorSection(context, auth, 'Settlements', 3),
      ),
      GoRoute(
        path: '/collector/reports',
        builder: (context, state) =>
            _collectorSection(context, auth, 'Reports', 4),
      ),
    ],
  );
});

DashboardSectionPlaceholder _farmerSection(
  BuildContext context,
  AuthController auth,
  String title,
  int selectedIndex,
) {
  return DashboardSectionPlaceholder(
    title: title,
    roleLabel: 'Farmer Portal',
    fullName: auth.user?.fullName ?? 'Farmer',
    items: FarmerDashboardScreen.navItems,
    selectedIndex: selectedIndex,
    onNavigation: (index) {
      context.go(FarmerDashboardScreen.navItems[index].route);
    },
  );
}

DashboardSectionPlaceholder _collectorSection(
  BuildContext context,
  AuthController auth,
  String title,
  int selectedIndex,
) {
  return DashboardSectionPlaceholder(
    title: title,
    roleLabel: 'Collector Portal',
    fullName: auth.user?.fullName ?? 'Collector',
    items: CollectorDashboardScreen.navItems,
    selectedIndex: selectedIndex,
    onNavigation: (index) {
      context.go(CollectorDashboardScreen.navItems[index].route);
    },
  );
}
