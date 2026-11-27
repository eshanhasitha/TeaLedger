enum CollectionRequestStatus {
  pending,
  accepted,
  rejected,
  cancelled,
  notCollected,
  collected;

  static CollectionRequestStatus fromJson(Object value) {
    if (value is int) {
      const statuses = CollectionRequestStatus.values;

      if (value >= 0 && value < statuses.length) {
        return statuses[value];
      }

      throw FormatException('Unknown collection request status: $value');
    }

    final normalized = value
        .toString()
        .toLowerCase()
        .replaceAll('_', '')
        .replaceAll('-', '');

    switch (normalized) {
      case 'pending':
        return CollectionRequestStatus.pending;
      case 'accepted':
        return CollectionRequestStatus.accepted;
      case 'rejected':
        return CollectionRequestStatus.rejected;
      case 'cancelled':
        return CollectionRequestStatus.cancelled;
      case 'notcollected':
        return CollectionRequestStatus.notCollected;
      case 'collected':
        return CollectionRequestStatus.collected;
      default:
        throw FormatException('Unknown collection request status: $value');
    }
  }

  String get displayName {
    switch (this) {
      case CollectionRequestStatus.pending:
        return 'Pending';
      case CollectionRequestStatus.accepted:
        return 'Accepted';
      case CollectionRequestStatus.rejected:
        return 'Rejected';
      case CollectionRequestStatus.cancelled:
        return 'Cancelled';
      case CollectionRequestStatus.notCollected:
        return 'Not Collected';
      case CollectionRequestStatus.collected:
        return 'Collected';
    }
  }
}

class TeaReadyRequest {
  const TeaReadyRequest({
    required this.id,
    required this.farmerId,
    required this.farmerName,
    required this.farmerCode,
    required this.estimatedQuantityKg,
    required this.status,
    required this.requestedAt,
    this.respondedAt,
    this.collectorNote,
  });

  final String id;
  final String farmerId;
  final String farmerName;
  final String farmerCode;
  final double estimatedQuantityKg;
  final CollectionRequestStatus status;
  final DateTime requestedAt;
  final DateTime? respondedAt;
  final String? collectorNote;

  factory TeaReadyRequest.fromJson(Map<String, dynamic> json) {
    return TeaReadyRequest(
      id: json['id'].toString(),
      farmerId: json['farmerId'].toString(),
      farmerName: json['farmerName']?.toString() ?? '',
      farmerCode: json['farmerCode']?.toString() ?? '',
      estimatedQuantityKg: (json['estimatedQuantityKg'] as num).toDouble(),
      status: CollectionRequestStatus.fromJson(json['status'] as Object),
      requestedAt: DateTime.parse(json['requestedAt'].toString()),
      respondedAt: json['respondedAt'] == null
          ? null
          : DateTime.parse(json['respondedAt'].toString()),
      collectorNote: json['collectorNote']?.toString(),
    );
  }
}
