import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'tea_ready_controller.dart';
import 'tea_ready_model.dart';

class TeaReadyScreen extends ConsumerStatefulWidget {
  const TeaReadyScreen({super.key});

  @override
  ConsumerState<TeaReadyScreen> createState() => _TeaReadyScreenState();
}

class _TeaReadyScreenState extends ConsumerState<TeaReadyScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController();

  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      if (mounted) {
        ref.read(teaReadyControllerProvider).loadRequests();
      }
    });
  }

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) return;

    final quantity = double.parse(_quantityController.text.trim());

    final success = await ref
        .read(teaReadyControllerProvider)
        .submitRequest(estimatedQuantityKg: quantity);

    if (!mounted) return;

    if (success) {
      _quantityController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tea-ready request submitted successfully.'),
          backgroundColor: Color(0xFF28683A),
        ),
      );
    } else {
      final message =
          ref.read(teaReadyControllerProvider).errorMessage ??
          'Request could not be submitted.';

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red.shade700),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = ref.watch(teaReadyControllerProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: AppBar(
        title: const Text(
          'Tea Ready',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF17231A),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(teaReadyControllerProvider).loadRequests(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildIntroCard(),
            const SizedBox(height: 18),
            _buildRequestForm(controller),
            const SizedBox(height: 24),
            _buildHistory(controller),
          ],
        ),
      ),
    );
  }

  Widget _buildIntroCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F2E8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD6E8D7)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.eco_outlined, color: Color(0xFF28683A), size: 32),
          SizedBox(height: 12),
          Text(
            'Is your tea ready for collection?',
            style: TextStyle(
              color: Color(0xFF17231A),
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Enter the estimated quantity of tea leaves. '
            'Your collector will receive your request.',
            style: TextStyle(
              color: Color(0xFF596B5C),
              height: 1.5,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestForm(TeaReadyController controller) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'New collection request',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: Color(0xFF17231A),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Estimated tea quantity',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _quantityController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                hintText: 'Enter quantity',
                suffixText: 'kg',
                prefixIcon: const Icon(Icons.scale_outlined),
                filled: true,
                fillColor: const Color(0xFFF7F9F7),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE1E8E1)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE1E8E1)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF28683A),
                    width: 1.5,
                  ),
                ),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the estimated quantity.';
                }

                final quantity = double.tryParse(value.trim());

                if (quantity == null) {
                  return 'Enter a valid number.';
                }

                if (quantity <= 0) {
                  return 'Quantity must be greater than 0.';
                }

                if (quantity > 10000) {
                  return 'Maximum quantity is 10,000 kg.';
                }

                return null;
              },
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: controller.isSubmitting ? null : _submitRequest,
                icon: controller.isSubmitting
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_outlined),
                label: Text(
                  controller.isSubmitting
                      ? 'Submitting...'
                      : 'Submit tea-ready request',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF28683A),
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: const Color(0xFF91AA96),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistory(TeaReadyController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'My collection requests',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: Color(0xFF17231A),
          ),
        ),
        const SizedBox(height: 12),
        if (controller.isLoading)
          const Padding(
            padding: EdgeInsets.all(30),
            child: Center(
              child: CircularProgressIndicator(color: Color(0xFF28683A)),
            ),
          )
        else if (controller.errorMessage != null && controller.requests.isEmpty)
          _buildError(controller)
        else if (controller.requests.isEmpty)
          _buildEmptyState()
        else
          ...controller.requests.map(_buildRequestCard),
      ],
    );
  }

  Widget _buildRequestCard(TeaReadyRequest request) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Tea collection request',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
              ),
              _statusBadge(request.status),
            ],
          ),
          const SizedBox(height: 14),
          _detailRow(
            'Estimated quantity',
            '${request.estimatedQuantityKg.toStringAsFixed(2)} kg',
          ),
          const SizedBox(height: 8),
          _detailRow('Requested on', _formatDate(request.requestedAt)),
          if (request.respondedAt != null) ...[
            const SizedBox(height: 8),
            _detailRow('Responded on', _formatDate(request.respondedAt!)),
          ],
          if (request.collectorNote != null &&
              request.collectorNote!.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF7F9F7),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'Collector note: ${request.collectorNote}',
                style: const TextStyle(fontSize: 12, color: Color(0xFF596B5C)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _statusBadge(CollectionRequestStatus status) {
    final Color color;
    final Color background;

    switch (status) {
      case CollectionRequestStatus.pending:
        color = const Color(0xFF9A6700);
        background = const Color(0xFFFFF4D6);
      case CollectionRequestStatus.accepted:
        color = const Color(0xFF28683A);
        background = const Color(0xFFE8F5E9);
      case CollectionRequestStatus.collected:
        color = const Color(0xFF176B87);
        background = const Color(0xFFE1F3F8);
      case CollectionRequestStatus.rejected:
      case CollectionRequestStatus.cancelled:
      case CollectionRequestStatus.notCollected:
        color = const Color(0xFFB42318);
        background = const Color(0xFFFDECEA);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
          fontSize: 10,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: _cardDecoration(),
      child: const Column(
        children: [
          Icon(Icons.inbox_outlined, size: 40, color: Color(0xFF91A091)),
          SizedBox(height: 12),
          Text(
            'No collection requests yet',
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: Color(0xFF17231A),
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Your submitted tea-ready requests will appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: Color(0xFF758075)),
          ),
        ],
      ),
    );
  }

  Widget _buildError(TeaReadyController controller) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        children: [
          const Icon(Icons.cloud_off_outlined, size: 34, color: Colors.red),
          const SizedBox(height: 10),
          Text(
            controller.errorMessage ?? 'Unable to load requests.',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: controller.loadRequests,
            icon: const Icon(Icons.refresh),
            label: const Text('Try again'),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF758075)),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF17231A),
          ),
        ),
      ],
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: const Color(0xFFE8EDE8)),
    );
  }

  String _formatDate(DateTime date) {
    final local = date.toLocal();
    final day = local.day.toString().padLeft(2, '0');
    final month = local.month.toString().padLeft(2, '0');
    final year = local.year.toString();

    return '$day/$month/$year';
  }
}
