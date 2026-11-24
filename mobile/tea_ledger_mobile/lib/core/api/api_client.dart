import 'package:dio/dio.dart';
import '../../config/api_config.dart';
import '../auth/token_storage.dart';
import 'api_interceptors.dart';

class ApiClient {
  ApiClient(TokenStorage tokenStorage) {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: ApiConfig.connectTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
        sendTimeout: ApiConfig.sendTimeout,
        responseType: ResponseType.json,
      ),
    );

    dio.interceptors.add(ApiInterceptors(tokenStorage));
  }

  late final Dio dio;
}
