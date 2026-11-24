class LoginRequest {
  const LoginRequest({required this.phoneNumber, required this.password});

  final String phoneNumber;
  final String password;

  Map<String, dynamic> toJson() {
    return {'phoneNumber': phoneNumber, 'password': password};
  }
}

class LoginResponse {
  const LoginResponse({
    required this.accessToken,
    required this.expiresAt,
    required this.userId,
    required this.fullName,
    required this.phoneNumber,
    required this.role,
  });

  final String accessToken;
  final DateTime expiresAt;
  final String userId;
  final String fullName;
  final String phoneNumber;
  final String role;

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      accessToken: json['accessToken'] as String,
      expiresAt: DateTime.parse(json['expiresAt'] as String),
      userId: json['userId'].toString(),
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      role: json['role'] as String,
    );
  }
}

class CurrentUser {
  const CurrentUser({
    required this.userId,
    required this.fullName,
    required this.phoneNumber,
    required this.role,
    required this.isActive,
  });

  final String userId;
  final String fullName;
  final String phoneNumber;
  final String role;
  final bool isActive;

  factory CurrentUser.fromJson(Map<String, dynamic> json) {
    return CurrentUser(
      userId: json['userId'].toString(),
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      role: json['role'] as String,
      isActive: json['isActive'] as bool,
    );
  }
}

class UserProfile {
  const UserProfile({
    required this.userId,
    required this.fullName,
    required this.phoneNumber,
    required this.role,
    required this.isActive,
    this.farmerId,
    this.farmerCode,
    this.collectorId,
    this.collectorCode,
  });

  final String userId;
  final String fullName;
  final String phoneNumber;
  final String role;
  final bool isActive;
  final String? farmerId;
  final String? farmerCode;
  final String? collectorId;
  final String? collectorCode;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['userId'].toString(),
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      role: json['role'] as String,
      isActive: json['isActive'] as bool,
      farmerId: json['farmerId']?.toString(),
      farmerCode: json['farmerCode'] as String?,
      collectorId: json['collectorId']?.toString(),
      collectorCode: json['collectorCode'] as String?,
    );
  }
}
