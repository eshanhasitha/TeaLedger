import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/auth/auth_controller.dart';
import '../core/auth/auth_providers.dart';
import '../features/authentication/presentation/login_screen.dart';
import '../features/farmer/dashboard/farmer_dashboard_screen.dart';
import '../features/collector/dashboard/collector_dashboard_screen.dart';
import '../shared/widgets/app_loading.dart';

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
        path: '/collector',
        builder: (context, state) => const CollectorDashboardScreen(),
      ),
    ],
  );
});
