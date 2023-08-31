import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:parents_app/utils/models.dart';

class AppState {
  // Private constructor to prevent external instantiation
  AppState._();

  static final AppState _instance = AppState._();

  factory AppState() => _instance;

  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Variables that will be stored during runtime
  String? userPhone;
  DeviceModel? device;
  List<DeviceModel>? devices;
  PolicyModel? policy;

  // Persistant Variables
  final String _signInTypeKey = 'signinType';
  String? _singInType = '';

  final String _userKey = 'user';
  UserModel? _user;

  




  // Getters and setters for persistent variable

  String? get signInType => _singInType;
  set signInType(String? value) {
    _singInType = value;
    _secureStorage.write(key: _signInTypeKey, value: value);
  }

  UserModel? get user => _user;
  set user(UserModel? value) {
    _user = value;
    _secureStorage.write(
        key: _signInTypeKey, value: json.encode(value?.toJson()));
  }

  // Initialize the persistent variable from secure storage
  Future<void> initializePersistentVariables() async {
    _singInType = await _secureStorage.read(key: _signInTypeKey);
    _user = UserModel.fromJson(
        json.decode(await _secureStorage.read(key: _userKey) ?? '{}'));
  }
}
