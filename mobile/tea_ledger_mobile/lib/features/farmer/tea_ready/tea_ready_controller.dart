import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart' show ChangeNotifierProvider;

import '../../../core/auth/auth_providers.dart';
import 'tea_ready_model.dart';
import 'tea_ready_repository.dart';

final teaReadyRepositoryProvider = Provider<TeaReadyRepository>((ref) {
  return TeaReadyRepository(ref.read(apiClientProvider));
});

final teaReadyControllerProvider = ChangeNotifierProvider<TeaReadyController>((
  ref,
) {
  return TeaReadyController(ref.read(teaReadyRepositoryProvider));
});

class TeaReadyController extends ChangeNotifier {
  TeaReadyController(this._repository);

  final TeaReadyRepository _repository;

  List<TeaReadyRequest> _requests = [];

  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;
  String? _successMessage;

  List<TeaReadyRequest> get requests => List.unmodifiable(_requests);

  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;

  String? get errorMessage => _errorMessage;
  String? get successMessage => _successMessage;

  Future<void> loadRequests() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _requests = await _repository.getMyRequests();
    } catch (error) {
      _errorMessage = _repository.getErrorMessage(error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> submitRequest({required double estimatedQuantityKg}) async {
    if (_isSubmitting) return false;

    if (estimatedQuantityKg <= 0 || estimatedQuantityKg > 10000) {
      _errorMessage =
          'Quantity must be greater than 0 and no more than 10,000 kg.';
      notifyListeners();
      return false;
    }

    _isSubmitting = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      final createdRequest = await _repository.createRequest(
        estimatedQuantityKg: estimatedQuantityKg,
      );

      _requests = [
        createdRequest,
        ..._requests.where((item) => item.id != createdRequest.id),
      ];

      _successMessage = 'Your tea-ready request was submitted successfully.';
      return true;
    } catch (error) {
      _errorMessage = _repository.getErrorMessage(error);
      return false;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }
}
