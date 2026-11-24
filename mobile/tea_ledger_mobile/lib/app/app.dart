import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/auth/auth_providers.dart';
import 'routes.dart';
import 'theme.dart';

class TeaLedgerApp extends ConsumerStatefulWidget {
  const TeaLedgerApp({super.key});

  @override
  ConsumerState<TeaLedgerApp> createState() => _TeaLedgerAppState();
}

class _TeaLedgerAppState extends ConsumerState<TeaLedgerApp> {
  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      ref.read(authControllerProvider).restoreSession();
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'TeaLedger',
      debugShowCheckedModeBanner: false,
      theme: TeaLedgerTheme.light,
      routerConfig: router,
    );
  }
}
