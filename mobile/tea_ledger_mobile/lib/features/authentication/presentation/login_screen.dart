import 'package:material_ui/material_ui.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/auth/auth_providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final auth = ref.read(authControllerProvider);

    final success = await auth.login(
      phoneNumber: _phoneController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) return;

    setState(() => _isLoading = false);

    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'Login failed.'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 35),

                    Container(
                      height: 82,
                      width: 82,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(
                        Icons.eco,
                        size: 48,
                        color: Color(0xFF2E7D32),
                      ),
                    ),

                    const SizedBox(height: 25),

                    const Text(
                      'TeaLedger',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1B5E20),
                      ),
                    ),

                    const SizedBox(height: 8),

                    const Text(
                      'Your tea collection management platform',
                      style: TextStyle(color: Colors.black54, fontSize: 15),
                    ),

                    const SizedBox(height: 40),

                    const Text(
                      'Welcome back',
                      style: TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 8),

                    const Text(
                      'Sign in to continue to your account.',
                      style: TextStyle(color: Colors.black54),
                    ),

                    const SizedBox(height: 28),

                    const Text(
                      'Phone number',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),

                    const SizedBox(height: 9),

                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        hintText: 'Enter your phone number',
                        prefixIcon: Icon(Icons.phone_outlined),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Phone number is required.';
                        }

                        return null;
                      },
                    ),

                    const SizedBox(height: 20),

                    const Text(
                      'Password',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),

                    const SizedBox(height: 9),

                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        hintText: 'Enter your password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Password is required.';
                        }

                        return null;
                      },
                      onFieldSubmitted: (_) => _login(),
                    ),

                    const SizedBox(height: 30),

                    ElevatedButton(
                      onPressed: _isLoading ? null : _login,
                      child: _isLoading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Sign In',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),

                    const SizedBox(height: 30),

                    const Text(
                      'One app. Two roles. One TeaLedger.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.black54, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
