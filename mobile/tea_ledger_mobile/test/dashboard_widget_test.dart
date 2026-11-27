import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

import 'package:tea_ledger_mobile/features/farmer/dashboard/farmer_dashboard_screen.dart';
import 'package:tea_ledger_mobile/features/collector/dashboard/collector_dashboard_screen.dart';

void main() {
  group('Farmer dashboard', () {
    testWidgets('displays farmer dashboard content', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: FarmerDashboardScreen())),
      );

      expect(find.text('TeaLedger'), findsOneWidget);
      expect(find.text('FARMER PORTAL'), findsOneWidget);
      expect(find.text('Is your tea ready?'), findsOneWidget);
      expect(find.text('THIS MONTH'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Latest passbook entry'),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Latest passbook entry'), findsOneWidget);
    });

    testWidgets('displays farmer bottom navigation', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: FarmerDashboardScreen())),
      );

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Passbook'), findsOneWidget);
      expect(find.text('Earnings'), findsOneWidget);
      expect(find.text('Finance'), findsOneWidget);
      expect(find.text('Settlement'), findsOneWidget);
    });
  });

  group('Collector dashboard', () {
    testWidgets('displays collector dashboard content', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: CollectorDashboardScreen()),
        ),
      );

      expect(find.text('TeaLedger'), findsOneWidget);
      expect(find.text('COLLECTOR PORTAL'), findsOneWidget);
      expect(find.text('TODAY AT A GLANCE'), findsOneWidget);
      expect(find.text('Collection requests'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Quick actions'),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Quick actions'), findsOneWidget);
    });

    testWidgets('displays collector bottom navigation', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: CollectorDashboardScreen()),
        ),
      );

      expect(find.text('Today'), findsOneWidget);
      expect(find.text('Farmers'), findsOneWidget);
      expect(find.text('Finance'), findsOneWidget);
      expect(find.text('Settlement'), findsOneWidget);
      expect(find.text('Reports'), findsOneWidget);
    });
  });
}
