import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.code, this.status});

  final String message;
  final String? code;
  final int? status;

  @override
  String toString() => 'ApiException(status: $status, code: $code, message: $message)';
}

class ApiClient {
  ApiClient({required this.baseUrl, this.accessToken});

  String baseUrl;
  String? accessToken;

  Map<String, String> _headers() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };
    if (accessToken != null && accessToken!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $accessToken';
    }
    return headers;
  }

  Future<AuthResult> login({required String username, required String password}) async {
    final uri = Uri.parse('$baseUrl/api/auth/login');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'username': username, 'password': password}),
    );
    return _parseAuthResponse(response);
  }

  Future<AuthResult> register({
    required String username,
    required String password,
    required String fullName,
    required String phone,
    required String email,
    required String role,
  }) async {
    final uri = Uri.parse('$baseUrl/api/auth/register');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({
        'username': username,
        'password': password,
        'fullName': fullName,
        'phone': phone,
        'email': email,
        'role': role,
      }),
    );
    return _parseAuthResponse(response);
  }

  Future<AvailableCourtsResult> fetchAvailableCourts({
    required String date,
    required String startTime,
    required String endTime,
  }) async {
    final uri = Uri.parse('$baseUrl/api/courts/available').replace(
      queryParameters: {
        'date': date,
        'startTime': startTime,
        'endTime': endTime,
      },
    );
    final response = await http.get(uri, headers: _headers());
    final payload = _decodeBody(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = payload['data'] as Map<String, dynamic>? ?? {};
      return AvailableCourtsResult.fromJson(data);
    }
    throw _apiErrorFromPayload(payload, response.statusCode);
  }

  AuthResult _parseAuthResponse(http.Response response) {
    final payload = _decodeBody(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = payload['data'] as Map<String, dynamic>? ?? {};
      return AuthResult.fromJson(data);
    }
    throw _apiErrorFromPayload(payload, response.statusCode);
  }

  Map<String, dynamic> _decodeBody(http.Response response) {
    try {
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      return body;
    } catch (_) {
      return {
        'status': 'error',
        'message': 'Invalid response from server',
      };
    }
  }

  ApiException _apiErrorFromPayload(Map<String, dynamic> payload, int status) {
    return ApiException(
      payload['message'] as String? ?? 'Request failed',
      code: payload['code'] as String?,
      status: status,
    );
  }
}
