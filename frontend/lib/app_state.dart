import 'package:flutter/material.dart';

import 'api_client.dart';
import 'models.dart';

class AppState extends ChangeNotifier {
  AppState({required String baseUrl}) : _baseUrl = baseUrl {
    _client = ApiClient(baseUrl: _baseUrl);
  }

  late ApiClient _client;
  String _baseUrl;
  bool _loading = false;
  UserInfo? _user;
  AuthTokens? _tokens;
  AvailableCourtsResult? _availableCourts;
  String? _lastError;

  String get baseUrl => _baseUrl;
  bool get isLoading => _loading;
  UserInfo? get user => _user;
  AuthTokens? get tokens => _tokens;
  AvailableCourtsResult? get availableCourts => _availableCourts;
  String? get lastError => _lastError;
  bool get isAuthenticated => _tokens != null && _tokens!.accessToken.isNotEmpty;


  Future<bool> login({required String username, required String password}) async {
    return _guarded(() async {
      final result = await _client.login(username: username, password: password);
      _setAuthResult(result);
    });
  }

  Future<bool> register({
    required String username,
    required String password,
    required String fullName,
    required String phone,
    required String email,
    required String role,
  }) async {
    return _guarded(() async {
      final result = await _client.register(
        username: username,
        password: password,
        fullName: fullName,
        phone: phone,
        email: email,
        role: role,
      );
      _setAuthResult(result);
    });
  }

  Future<bool> fetchAvailableCourts({
    required String date,
    required String startTime,
    required String endTime,
  }) async {
    return _guarded(() async {
      _availableCourts = await _client.fetchAvailableCourts(
        date: date,
        startTime: startTime,
        endTime: endTime,
      );
      notifyListeners();
    });
  }

  void logout() {
    _user = null;
    _tokens = null;
    _availableCourts = null;
    _client.accessToken = null;
    notifyListeners();
  }

  void clearError() {
    _lastError = null;
    notifyListeners();
  }

  Future<bool> _guarded(Future<void> Function() action) async {
    _loading = true;
    _lastError = null;
    notifyListeners();
    try {
      await action();
      return true;
    } on ApiException catch (error) {
      _lastError = error.message;
      return false;
    } catch (error) {
      _lastError = 'Unexpected error: $error';
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void _setAuthResult(AuthResult result) {
    _user = result.user;
    _tokens = result.tokens;
    _client.accessToken = result.tokens.accessToken;
  }
}
