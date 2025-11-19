package com.talkcents

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log

class RecordingStarterActivity : Activity() {

    private val TAG = "RecordingStarterActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.d(TAG, "RecordingStarterActivity launched")

        // 1. Runtime mic permission (required pre-Android 14)
        if (Build.VERSION.SDK_INT < 34) {
            handleRecordAudioPermissionLegacy()
        } else {
            handleAudioPermissionAndroid14Plus()
        }
    }

    private fun handleRecordAudioPermissionLegacy() {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED
        ) {
            Log.d(TAG, "RECORD_AUDIO already granted (<Android 14) — starting service")
            startRecordingServiceAndUpdateWidget()
        } else {
            Log.d(TAG, "Requesting RECORD_AUDIO permission (<Android 14)")
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), 1001)
        }
    }

    private fun handleAudioPermissionAndroid14Plus() {
        val granted = checkSelfPermission(Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED

        if (granted) {
            Log.d(TAG, "RECORD_AUDIO granted (Android 14+) — starting service")
            startRecordingServiceAndUpdateWidget()
        } else {
            Log.w(TAG, "Android 14+: cannot request mic permission from widget flow — showing dialog")

            AlertDialog.Builder(this)
                .setTitle("Permission Required")
                .setMessage("TalkCents needs microphone permission to start recording. Open the app to grant it.")
                .setPositiveButton("Open App") { _, _ ->
                    startActivity(Intent(this, MainActivity::class.java)
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                    finish()
                }
                .setNegativeButton("Cancel") { _, _ -> finish() }
                .setOnCancelListener { finish() }
                .show()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        if (requestCode == 1001) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d(TAG, "RECORD_AUDIO granted — starting service")
                startRecordingServiceAndUpdateWidget()
            } else {
                Log.w(TAG, "RECORD_AUDIO denied")
                finish()
            }
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }

    /**
     * Start the Foreground RecordingService and update the widget UI to TalkWidget
     */
    private fun startRecordingServiceAndUpdateWidget() {
        try {
            val intent = Intent(this, RecordingService::class.java).apply {
                action = RecordingService.ACTION_START
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }

            // Update all widgets to show recording UI
            val appWidgetManager = AppWidgetManager.getInstance(this)
            val componentName = ComponentName(this, SimpleWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            appWidgetIds.forEach { widgetId ->
                val views = TalkWidget(this).buildRecordingRemoteViews(widgetId)
                appWidgetManager.updateAppWidget(widgetId, views)
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error starting RecordingService", e)
        } finally {
            finish() // Always close this activity
        }
    }
}
