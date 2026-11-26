import 'package:flutter/foundation.dart';

import '../../features/authentication/data/auth_models.dart';
import '../../features/authentication/data/auth_repository.dart';

enum AuthStatus { loading, unauthenticated, authenticated }

class AuthController extends ChangeNotifier {
  AuthController(this._repository);

  final AuthRepository _repository;

  AuthStatus _status = AuthStatus.loading;
  CurrentUser? _user;
  String? _errorMessage;

  AuthStatus get status => _status;
  CurrentUser? get user => _user;
  String? get errorMessage => _errorMessage;

  bool get isAuthenticated => _status == AuthStatus.authenticated;

  bool get isFarmer => _user?.role == 'Farmer';
  bool get isCollector => _user?.role == 'Collector';

  Future<void> restoreSession() async {
    _status = AuthStatus.loading;
    notifyListeners();

    try {
      final currentUser = await _repository.getCurrentUser();

      if (!currentUser.isActive) {
        await _repository.logout();
        _setUnauthenticated();
        return;
      }

      if (!_isSupportedRole(currentUser.role)) {
        await _repository.logout();
        _setUnauthenticated();
        return;
      }

      _user = currentUser;
      _status = AuthStatus.authenticated;
      _errorMessage = null;
    } catch (_) {
      await _repository.logout();
      _setUnauthenticated();
    }

    notifyListeners();
  }

  Future<bool> login({
    required String phoneNumber,
    required String password,
  }) async {
    _errorMessage = null;

    try {
      await _repository.login(phoneNumber: phoneNumber, password: password);

      final currentUser = await _repository.getCurrentUser();

      if (!currentUser.isActive) {
        await _repository.logout();
        throw Exception('Your account is inactive.');
      }

      if (!_isSupportedRole(currentUser.role)) {
        await _repository.logout();
        throw Exception('This role cannot access the mobile app.');
      }

      _user = currentUser;
      _status = AuthStatus.authenticated;
      notifyListeners();

      return true;
    } catch (error) {
      await _repository.logout();

      _user = null;
      _status = AuthStatus.unauthenticated;
      _errorMessage = _repository.getErrorMessage(error);

      if (error is Exception && error.toString().contains('inactive')) {
        _errorMessage = 'Your account is inactive.';
      }

      if (error is Exception && error.toString().contains('role cannot')) {
        _errorMessage = 'This role cannot access the mobile app.';
      }

      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    _setUnauthenticated();
    notifyListeners();
  }

  bool _isSupportedRole(String role) {
    return role == 'Farmer' || role == 'Collector';
  }

  void _setUnauthenticated() {
    _user = null;
    _status = AuthStatus.unauthenticated;
    _errorMessage = null;
  }
}
