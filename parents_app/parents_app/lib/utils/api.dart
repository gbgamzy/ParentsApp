import 'dart:convert';

import 'package:parents_app/utils/models.dart';
import 'package:http/http.dart' as http;

class API {
  // Private constructor to prevent external instantiation
  API._();

  static final API _instance = API._();
  factory API() => _instance;
  static const String BASE_URL = "http://www.docnbook.in/parents/user";

  dynamic getHeader([String? username, String password = "password"]) async {
    String credentials = "";
    credentials = "$username:$password";
    String encoded = base64.encode(utf8.encode(credentials));

    dynamic header = {
      'Authorization': 'Basic $encoded',
      // 'Cookie': 'sessionid=$sessionId',
      'Content-Type': 'application/json'
    };
    return header;
  }

  dynamic handleResponse(dynamic res) {
    try {
      if (res.statusCode != 500) {
        print(res.body);
        var jsonResponse = jsonDecode(res.body);
        // print(jsonResponse);
        jsonResponse['statusCode'] = res.statusCode;
        print(jsonResponse);
        return jsonResponse;
      } else {
        return {
          'statusCode': 500,
          'message': 'Internal Server Error',
          'body': {}
        };
      }
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> createUser(UserModel user) async {
    var url = "$BASE_URL/login";
    try {
      var res = await http.post(Uri.parse(url),
          headers: await getHeader(), body: user.toJson());
      return handleResponse(res);
    } catch (e) {
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> getOtp(String phone) async {
    var url = "$BASE_URL/$phone/otp";
    try {
      var res = await http.get(Uri.parse(url));
      return handleResponse(res);
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> verifyOtp(String phone, String otp) async {
    var url = "$BASE_URL/$phone/otp";
    try {
      var res = await http.post(Uri.parse(url),
          headers: await getHeader(), 
          body: jsonEncode({
            "otp": otp 
          })
      );
      return handleResponse(res);
    } catch (e) {
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> userExists(String phone, String email) async {
    var url = "$BASE_URL/userexists";
    try {
      var res = await http.post(Uri.parse(url),
          headers: await getHeader(), 
          body: jsonEncode({
            "phone": phone,
            "email": email
          })
      );
      return handleResponse(res);
    } catch (e) {
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> getDevices(String userId) async {
    var url = "$BASE_URL/$userId/device";
    try {
      var res = await http.get(Uri.parse(url));
      return handleResponse(res);
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> getDevice(String userId, String deviceId) async {
    var url = "$BASE_URL/$userId/device/$deviceId";
    try {
      var res = await http.get(Uri.parse(url));
      return handleResponse(res);
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> updatePolicy(String userId, String deviceId, String policyId, PolicyModel policy) async {
    var url = "$BASE_URL/$userId/device/$deviceId/policy/$policyId";
    try {
      var res = await http.put(Uri.parse(url),
        headers: await getHeader(), 
        body: jsonEncode({
          "policyItself": policy.toJson()
        })
      );
      return handleResponse(res);
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> updateDevice(String userId, String deviceId, DeviceModel device) async {
    var url = "$BASE_URL/$userId/device/$deviceId";
    try {
      var res = await http.put(Uri.parse(url),
        headers: await getHeader(), 
        body: device.toJson()
      );
      return handleResponse(res);
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

  Future<dynamic> updateUser(String userId, UserModel user) async {
    var url = "$BASE_URL/$userId";
    try {
      var res = await http.put(Uri.parse(url),
        headers: await getHeader(), 
        body: user.toJson()
      );
      return handleResponse(res);
    } catch (e) {
      print(e);
      return {'statusCode': 500, 'message': 'Server not available', 'body': {}};
    }
  }

}
