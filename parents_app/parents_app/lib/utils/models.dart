class ValueModel {
  String? key;
  int? numValue;
  String? stringValue;
  List<String>? listValue;

  ValueModel({
    this.key,
    this.numValue,
    this.stringValue,
    this.listValue,
  });

  factory ValueModel.fromJson(Map<String, dynamic> json) {
    return ValueModel(
      key: json['key'],
      numValue: json['numValue'],
      stringValue: json['stringValue'],
      listValue: List<String>.from(json['listValue']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'numValue': numValue,
      'stringValue': stringValue,
      'listValue': listValue,
    };
  }
}

class PolicyModel {
  String? id;
  String? name;
  List<ApplicationModel>? applications;
  bool? adjustVolumeDisabled;
  bool? installAppsDisabled;
  // bool? factoryResetDisabled;
  bool? mountPhysicalMediaDisabled;
  bool? outgoingCallsDisabled;
  bool? usbFileTransferDisabled;
  bool? bluetoothDisabled;
  String? playStoreMode;
  // Map<String, String>? advancedSecurityOverrides;
  String? locationMode;

  PolicyModel({
    this.id,
    this.name,
    this.applications,
    this.adjustVolumeDisabled,
    this.installAppsDisabled,
    // this.factoryResetDisabled,
    this.mountPhysicalMediaDisabled,
    this.outgoingCallsDisabled,
    this.usbFileTransferDisabled,
    this.bluetoothDisabled,
    this.playStoreMode,
    // this.advancedSecurityOverrides,
    this.locationMode,
  });

  factory PolicyModel.fromJson(Map<String, dynamic> json) {
    return PolicyModel(
      id: json['_id'],
      name: json['name'],
      applications: List<ApplicationModel>.from(
          json['applications'].map((x) => ApplicationModel.fromJson(x))),
      adjustVolumeDisabled: json['adjustVolumeDisabled'],
      installAppsDisabled: json['installAppsDisabled'],
      // factoryResetDisabled: json['factoryResetDisabled'],
      mountPhysicalMediaDisabled: json['mountPhysicalMediaDisabled'],
      outgoingCallsDisabled: json['outgoingCallsDisabled'],
      usbFileTransferDisabled: json['usbFileTransferDisabled'],
      bluetoothDisabled: json['bluetoothDisabled'],
      playStoreMode: json['playStoreMode'],
      // advancedSecurityOverrides: Map<String, String>.from(json['advancedSecurityOverrides']),
      locationMode: json['locationMode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'applications': applications?.map((x) => x.toJson()).toList(),
      'adjustVolumeDisabled': adjustVolumeDisabled,
      'installAppsDisabled': installAppsDisabled,
      // 'factoryResetDisabled': factoryResetDisabled,
      'mountPhysicalMediaDisabled': mountPhysicalMediaDisabled,
      'outgoingCallsDisabled': outgoingCallsDisabled,
      'usbFileTransferDisabled': usbFileTransferDisabled,
      'bluetoothDisabled': bluetoothDisabled,
      'playStoreMode': playStoreMode,
      // 'advancedSecurityOverrides': advancedSecurityOverrides,
      'locationMode': locationMode,
    };
  }
}

class ApplicationModel {
  String? packageName;
  String? installType;
  bool? disabled;

  ApplicationModel({
    this.packageName,
    this.installType,
    this.disabled,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      packageName: json['packageName'],
      installType: json['installType'],
      disabled: json['disabled'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'packageName': packageName,
      'installType': installType,
      'disabled': disabled,
    };
  }
}

class DeviceModel {
  String? id;
  String? name;
  String? brand;
  String? model;
  String? nickname;
  String? qrCode;
  PolicyModel? policy; // Corrected field type
  String? createdOn;
  String? enrolledOn;
  bool? currentlyEnrolled;
  String? otp;

  DeviceModel({
    this.id,
    this.name,
    this.brand,
    this.model,
    this.nickname,
    this.qrCode,
    this.policy,
    this.createdOn,
    this.enrolledOn,
    this.currentlyEnrolled,
    this.otp,
  });

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    return DeviceModel(
      id: json['_id'],
      name: json['name'],
      brand: json['brand'],
      model: json['model'],
      nickname: json['nickname'],
      qrCode: json['qrCode'],
      policy: PolicyModel.fromJson(json['policy']), // Parse the policy object
      createdOn: json['createdOn'],
      enrolledOn: json['enrolledOn'],
      currentlyEnrolled: json['currentlyEnrolled'],
      otp: json['otp'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'brand': brand,
      'model': model,
      'nickname': nickname,
      'qrCode': qrCode,
      'policy': policy?.toJson(), // Serialize the policy object
      'createdOn': createdOn,
      'enrolledOn': enrolledOn,
      'currentlyEnrolled': currentlyEnrolled,
      'otp': otp,
    };
  }
}

class UserModel {
  String? id;
  String? firstName;
  String? lastName;
  String? phone;
  String? email;
  int? tokenCount;
  List<DeviceModel>? devices; // Corrected field type
  String? otp;
  DateTime? otpExpires;
  DateTime? otpTimestamp;

  UserModel({
    this.id,
    this.firstName,
    this.lastName,
    this.phone,
    this.email,
    this.tokenCount,
    this.devices,
    this.otp,
    this.otpExpires,
    this.otpTimestamp,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      phone: json['phone'],
      email: json['email'],
      tokenCount: json['tokenCount'],
      devices: (json['devices'] as List<dynamic>)
          .map((e) => DeviceModel.fromJson(e))
          .toList(),
      otp: json['otp'],
      otpExpires: DateTime.parse(json['otpExpires']),
      otpTimestamp: DateTime.parse(json['otpTimestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'email': email,
      'tokenCount': tokenCount,
      'devices': devices?.map((e) => e.toJson()).toList(),
      'otp': otp,
      'otpExpires': otpExpires.toString(),
      'otpTimestamp': otpTimestamp.toString(),
    };
  }
}
