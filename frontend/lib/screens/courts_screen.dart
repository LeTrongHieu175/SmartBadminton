import 'package:flutter/material.dart';

import '../app_state.dart';
import '../models.dart';

class CourtsScreen extends StatefulWidget {
  const CourtsScreen({super.key, required this.appState});

  final AppState appState;

  @override
  State<CourtsScreen> createState() => _CourtsScreenState();
}

class _CourtsScreenState extends State<CourtsScreen> {
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 6, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 7, minute: 0);

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickTime({required bool isStart}) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _startTime : _endTime,
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
      });
    }
  }

  Future<void> _search() async {
    final ok = await widget.appState.fetchAvailableCourts(
      date: _formatDate(_selectedDate),
      startTime: _formatTime(_startTime),
      endTime: _formatTime(_endTime),
    );
    if (!mounted) return;
    if (!ok) {
      final message = widget.appState.lastError ?? 'Search failed';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.appState.user;
    final result = widget.appState.availableCourts;
    final isLoading = widget.appState.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Court Management'),
        actions: [
          IconButton(
            onPressed: widget.appState.logout,
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFF8F9FA), Color(0xFFE7EDF3)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildHeader(user),
            const SizedBox(height: 16),
            _buildSearchCard(isLoading),
            const SizedBox(height: 16),
            if (result != null) _buildResultCard(result),
            const SizedBox(height: 16),
            _buildManageSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(UserInfo? user) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: const Color(0xFF2C5364),
              child: Text(
                (user?.fullName.isNotEmpty ?? false)
                    ? user!.fullName[0].toUpperCase()
                    : 'U',
                style: const TextStyle(color: Colors.white, fontSize: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user?.fullName ?? 'Unknown user',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('${user?.username ?? ''} | ${user?.role ?? ''}'),
                ],
              ),
            ),
            Chip(
              label: Text(widget.appState.baseUrl),
              backgroundColor: const Color(0xFFE0E7EF),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchCard(bool isLoading) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Find available courts',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _buildPickerButton(
                  label: 'Date',
                  value: _formatDate(_selectedDate),
                  onTap: _pickDate,
                ),
                _buildPickerButton(
                  label: 'Start time',
                  value: _formatTime(_startTime),
                  onTap: () => _pickTime(isStart: true),
                ),
                _buildPickerButton(
                  label: 'End time',
                  value: _formatTime(_endTime),
                  onTap: () => _pickTime(isStart: false),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isLoading ? null : _search,
                icon: const Icon(Icons.search),
                label: Text(isLoading ? 'Loading...' : 'Search'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPickerButton({
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
          color: Colors.white,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard(AvailableCourtsResult result) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Available courts (${result.courts.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              '${result.date} | ${result.startTime} - ${result.endTime} | ${result.durationMinutes} min',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 12),
            if (result.courts.isEmpty)
              const Text('No courts available')
            else
              Column(
                children: result.courts
                    .map(
                      (court) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(court.name),
                        subtitle: Text('Type: ${court.type}'),
                        trailing: Text('${court.basePrice} VND'),
                      ),
                    )
                    .toList(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildManageSection() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Court management',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Create/edit actions are placeholders until backend APIs are added.',
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              children: [
                OutlinedButton.icon(
                  onPressed: null,
                  icon: const Icon(Icons.add),
                  label: const Text('Add court'),
                ),
                OutlinedButton.icon(
                  onPressed: null,
                  icon: const Icon(Icons.edit),
                  label: const Text('Edit court'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final year = date.year.toString().padLeft(4, '0');
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
