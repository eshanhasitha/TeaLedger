import 'package:flutter_test/flutter_test.dart';
import 'package:tea_ledger_mobile/features/farmer/tea_ready/tea_ready_model.dart';

void main() {
  group('TeaReadyRequest model', () {
    test('parses a backend response with numeric status', () {
      final request = TeaReadyRequest.fromJson({
        'id': 'request-001',
        'farmerId': 'farmer-001',
        'farmerName': 'Test Farmer',
        'farmerCode': 'F001',
        'estimatedQuantityKg': 25.5,
        'status': 0,
        'requestedAt': '2026-11-26T08:30:00Z',
        'respondedAt': null,
        'collectorNote': null,
      });

      expect(request.id, 'request-001');
      expect(request.estimatedQuantityKg, 25.5);
      expect(request.status, CollectionRequestStatus.pending);
      expect(request.respondedAt, isNull);
    });

    test('parses a backend response with string status', () {
      final request = TeaReadyRequest.fromJson({
        'id': 'request-002',
        'farmerId': 'farmer-001',
        'farmerName': 'Test Farmer',
        'farmerCode': 'F001',
        'estimatedQuantityKg': 30,
        'status': 'Accepted',
        'requestedAt': '2026-11-26T08:30:00Z',
        'respondedAt': '2026-11-26T09:00:00Z',
        'collectorNote': 'Collection scheduled.',
      });

      expect(request.status, CollectionRequestStatus.accepted);
      expect(request.collectorNote, 'Collection scheduled.');
      expect(request.respondedAt, isNotNull);
    });

    test('displays readable status labels', () {
      expect(CollectionRequestStatus.notCollected.displayName, 'Not Collected');
    });
  });
}
