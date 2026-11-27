import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import 'tea_ready_model.dart';

class TeaReadyRepository {
  TeaReadyRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<TeaReadyRequest> createRequest({
    required double estimatedQuantityKg,
  }) async {
    final response = await _apiClient.dio.post(
      ApiEndpoints.createTeaReadyRequest,
      data: {'estimatedQuantityKg': estimatedQuantityKg},
    );

    return TeaReadyRequest.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  Future<List<TeaReadyRequest>> getMyRequests() async {
    final response = await _apiClient.dio.get(ApiEndpoints.myTeaReadyRequests);

    final data = response.data;

    if (data is! List) {
      throw const FormatException('Unexpected tea-ready request response.');
    }

    return data
        .map(
          (item) =>
              TeaReadyRequest.fromJson(Map<String, dynamic>.from(item as Map)),
        )
        .toList();
  }

  String getErrorMessage(Object error) {
    if (error is DioException) {
      final responseData = error.response?.data;

      if (responseData is Map && responseData['message'] != null) {
        return responseData['message'].toString();
      }

      switch (error.response?.statusCode) {
        case 400:
          return 'Please enter a valid tea quantity.';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'Only farmer accounts can submit tea-ready requests.';
        case 409:
          return 'You already have an active tea-ready request.';
        case 500:
          return 'Server error. Please try again later.';
      }

      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.connectionError) {
        return 'Cannot connect to TeaLedger. Check your internet connection.';
      }
    }

    return 'Something went wrong. Please try again.';
  }
}
