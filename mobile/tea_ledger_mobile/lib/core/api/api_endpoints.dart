class ApiEndpoints {
  ApiEndpoints._();

  static const String login = '/api/Auth/login';
  static const String currentUser = '/api/Auth/me';
  static const String profile = '/api/Profile/me';
  static const String changePassword = '/api/Auth/change-password';

  static const String farmerDashboard = '/api/dashboard/farmer';
  static const String collectorDashboard = '/api/dashboard/collector';

  // Farmer tea-ready requests
  static const String createTeaReadyRequest = '/api/collection-requests';
  static const String myTeaReadyRequests = '/api/collection-requests/my';
}
