import 'package:flutter/material.dart';

import 'app_state.dart';
import 'screens/courts_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const SmartBadmintonApp());
}

class SmartBadmintonApp extends StatefulWidget {
  const SmartBadmintonApp({super.key});

  @override
  State<SmartBadmintonApp> createState() => _SmartBadmintonAppState();
}

class _SmartBadmintonAppState extends State<SmartBadmintonApp> {
  late final AppState _appState;

  @override
  void initState() {
    super.initState();
    const apiBaseUrl = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://localhost:3000',
    );
    _appState = AppState(baseUrl: apiBaseUrl);
    _appState.addListener(_handleStateChange);
  }

  @override
  void dispose() {
    _appState.removeListener(_handleStateChange);
    _appState.dispose();
    super.dispose();
  }

  void _handleStateChange() {
    if (_appState.lastError != null) {
      // Errors are shown on the screen via SnackBars. Keep in state for access.
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _appState,
      builder: (context, _) {
        return MaterialApp(
          title: 'Smart Badminton Manager',
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF1B6B5D),
              brightness: Brightness.light,
            ),
            inputDecorationTheme: InputDecorationTheme(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Colors.white,
            ),
            scaffoldBackgroundColor: const Color(0xFFF6F8FA),
          ),
          home: _appState.isAuthenticated
              ? CourtsScreen(appState: _appState)
              : LoginScreen(appState: _appState),
        );
      },
    );
  }
}
