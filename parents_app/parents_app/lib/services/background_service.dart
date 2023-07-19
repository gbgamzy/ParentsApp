import 'dart:async';
import 'dart:ui';

import 'package:android_conversation_shortcut/android_conversation_shortcut.dart';
import 'package:flutter/services.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_background_service_android/flutter_background_service_android.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

Future<void> initializeBackgroundService() async {
  final service = FlutterBackgroundService();
  await service.configure(
      iosConfiguration: IosConfiguration(),
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        isForegroundMode: true,
        autoStart: true,
        autoStartOnBoot: true,
      ));
}

@pragma('vm:entry-point')
onStart(ServiceInstance service) async {
  var channel = const MethodChannel("GautamsApplock");
  DartPluginRegistrant.ensureInitialized();
  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((event) {
      service.setAsForegroundService();
    });
    service.on('setAsBackground').listen((event) {
      service.setAsBackgroundService();
    });
  }
  service.on('stopService').listen((event) {
    service.stopSelf();
  });

  service.on('checkForegroundApp').listen((event) async {
    print("Checking Foreground App");
    checkForegroundApp();
  });

  Timer.periodic(const Duration(seconds: 5), (timer) async {
    if (service is AndroidServiceInstance) {
      if (await service.isForegroundService()) {
        Person person = const Person(
          bot: true,
          important: true,
          key: "GautamKey",
          name: "Gautam",
        );
        var a = AndroidConversationShortcut.createConversationShortcut(person);
        service.setForegroundNotificationInfo(
            title: "Parents App", content: "Haelllo",


        );
        // channel.invokeMethod('getForegroundApp');
        await checkForegroundApp();
        print("Foreground Service");
      }
    }

    print("Background service running");
    // service.invoke('update');
  });
}

checkForegroundApp() async {
  try {
    var channel = const MethodChannel("GautamsApplock");
    channel.invokeMethod('getForegroundApp');
    channel.invokeMethod('getForegroundApp1');
  } on PlatformException catch (e) {
    print("Error getting foreground app: ${e.message}");
    return null;
  }
}
