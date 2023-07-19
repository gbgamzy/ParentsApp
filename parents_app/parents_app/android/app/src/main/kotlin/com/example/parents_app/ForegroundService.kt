package com.example.parents_app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.annotation.Nullable
import androidx.core.app.NotificationCompat
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.engine.dart.DartExecutor
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugins.GeneratedPluginRegistrant

class ForegroundService : Service() {
    private val CHANNEL = "GautamsApplock"
    private val NOTIFICATION_ID = 1
    private val NOTIFICATION_CHANNEL_ID = "1234"
    private val NOTIFICATION_CHANNEL_NAME = "getForegroundApp"
    private val NOTIFICATION_CHANNEL_DESCRIPTION = "Your Channel Description"

    private lateinit var methodChannel: MethodChannel

    override fun onCreate() {
        super.onCreate()
        methodChannel = MethodChannel(getFlutterEngine().dartExecutor.binaryMessenger, CHANNEL)
        methodChannel.setMethodCallHandler { call: MethodCall, result: MethodChannel.Result ->
            if (call.method == "getForegroundApp") {
                // Call your native Android method here
                yourNativeMethod()
                result.success(null) // Return a success result
            } else {
                result.notImplemented() // Method not implemented
            }
        }
    }

    private fun yourNativeMethod() {
        Log.d("Native Method", "Hello");
    }

    override fun onStartCommand(intent: Intent, flags: Int, startId: Int): Int {
        createNotificationChannel()
        val notification: Notification = buildNotification()
        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            )
            channel.description = NOTIFICATION_CHANNEL_DESCRIPTION
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val builder = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("Foreground Service")
            .setContentText("Running")
            .setSmallIcon(R.drawable.launch_background)

        return builder.build()
    }

    @Nullable
    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    private fun getFlutterEngine(): FlutterEngine {
        val flutterEngine = FlutterEngine(this)
        flutterEngine.dartExecutor.executeDartEntrypoint(
            DartExecutor.DartEntrypoint.createDefault()
        )
        return flutterEngine
    }
}
