import 'package:dio/dio.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/auth/token_storage.dart';
import 'auth_models.dart';

class AuthRepository {
  AuthRepository(this._apiClient, this._tokenStorage);

  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  Future<LoginResponse> login({
    required String phoneNumber,
    required String password,
  }) async {
    final response = await _apiClient.dio.post(
      ApiEndpoints.login,
      data: LoginRequest(phoneNumber: phoneNumber, password: password).toJson(),
    );

    final result = LoginResponse.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );

    if (result.accessToken.isEmpty) {
      throw Exception('The server returned an empty access token.');
    }

    await _tokenStorage.saveToken(result.accessToken);

    return result;
  }

  Future<CurrentUser> getCurrentUser() async {
    final response = await _apiClient.dio.get(ApiEndpoints.currentUser);

    return CurrentUser.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  Future<UserProfile> getProfile() async {
    final response = await _apiClient.dio.get(ApiEndpoints.profile);

    return UserProfile.fromJson(
      Map<String, dynamic>.from(response.data as Map),
    );
  }

  Future<void> logout() async {
    await _tokenStorage.deleteToken();
  }

  String getErrorMessage(Object error) {
    if (error is DioException) {
      final data = error.response?.data;

      if (data is Map && data['message'] != null) {
        return data['message'].toString();
      }

      switch (error.response?.statusCode) {
        case 400:
          return 'Please check the information you entered.';
        case 401:
          return 'Invalid phone number or password.';
        case 403:
          return 'You do not have permission.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error. Please try again later.';
      }

      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.connectionError) {
        return 'Cannot connect to TeaLedger server.';
      }
    }

    return 'Something went wrong. Please try again.';
  }
}
