class UserInfo {
  UserInfo({
    required this.id,
    required this.username,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.role,
  });

  final String id;
  final String username;
  final String fullName;
  final String phone;
  final String email;
  final String role;

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      id: json['id'] as String? ?? '',
      username: json['username'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? '',
    );
  }
}

class AuthTokens {
  AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
    );
  }
}

class AuthResult {
  AuthResult({required this.user, required this.tokens});

  final UserInfo user;
  final AuthTokens tokens;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      user: UserInfo.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
      tokens: AuthTokens.fromJson(
        json['tokens'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}

class Court {
  Court({
    required this.id,
    required this.name,
    required this.type,
    required this.basePrice,
  });

  final String id;
  final String name;
  final String type;
  final int basePrice;

  factory Court.fromJson(Map<String, dynamic> json) {
    return Court(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? '',
      basePrice: (json['basePrice'] as num?)?.toInt() ?? 0,
    );
  }
}

class AvailableCourtsResult {
  AvailableCourtsResult({
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.durationMinutes,
    required this.courts,
  });

  final String date;
  final String startTime;
  final String endTime;
  final int durationMinutes;
  final List<Court> courts;

  factory AvailableCourtsResult.fromJson(Map<String, dynamic> json) {
    final courtsJson = json['courts'] as List<dynamic>? ?? [];
    return AvailableCourtsResult(
      date: json['date'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      durationMinutes: (json['durationMinutes'] as num?)?.toInt() ?? 0,
      courts: courtsJson
          .map((item) => Court.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
