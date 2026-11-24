import 'package:flutter_test/flutter_test.dart';

import 'package:tea_ledger_mobile/features/authentication/data/auth_models.dart';

void main() {
  group('TeaLedger authentication models', () {
    test('LoginRequest serializes using backend property names', () {
      const request = LoginRequest(
        phoneNumber: '0771234567',
        password: 'TestPassword123!',
      );

      final json = request.toJson();

      expect(json['phoneNumber'], '0771234567');
      expect(json['password'], 'TestPassword123!');
    });

    test('LoginResponse parses backend response', () {
      final response = LoginResponse.fromJson({
        'accessToken': 'test-jwt',
        'expiresAt': '2026-11-24T12:30:00Z',
        'userId': '11111111-1111-1111-1111-111111111111',
        'fullName': 'Test Farmer',
        'phoneNumber': '0771234567',
        'role': 'Farmer',
      });

      expect(response.accessToken, 'test-jwt');
      expect(response.fullName, 'Test Farmer');
      expect(response.role, 'Farmer');
    });

    test('CurrentUser parses farmer role', () {
      final user = CurrentUser.fromJson({
        'userId': '11111111-1111-1111-1111-111111111111',
        'fullName': 'Test Farmer',
        'phoneNumber': '0771234567',
        'role': 'Farmer',
        'isActive': true,
      });

      expect(user.role, 'Farmer');
      expect(user.isActive, true);
    });

    test('CurrentUser parses collector role', () {
      final user = CurrentUser.fromJson({
        'userId': '22222222-2222-2222-2222-222222222222',
        'fullName': 'Test Collector',
        'phoneNumber': '0771234568',
        'role': 'Collector',
        'isActive': true,
      });

      expect(user.role, 'Collector');
      expect(user.isActive, true);
    });

    test('Inactive user is identified', () {
      final user = CurrentUser.fromJson({
        'userId': '11111111-1111-1111-1111-111111111111',
        'fullName': 'Inactive Farmer',
        'phoneNumber': '0771234567',
        'role': 'Farmer',
        'isActive': false,
      });

      expect(user.isActive, false);
    });
  });
}
