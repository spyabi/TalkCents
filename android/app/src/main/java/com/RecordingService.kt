package com.talkcents

import android.app.*
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat
import android.appwidget.AppWidgetManager
import android.widget.RemoteViews
import java.io.File

class RecordingService : Service() {

    companion object {
        const val ACTION_START = "com.talkcents.RECORDING_SERVICE_START"
        const val ACTION_STOP = "com.talkcents.RECORDING_SERVICE_STOP"
        const val NOTIF_CHANNEL_ID = "RecordingServiceChannel"
        const val NOTIF_ID = 101
        const val BROADCAST_UPDATE = "com.talkcents.RECORDING_UPDATE"
    }

    private var isRecording = false
    private var secondsElapsed = 0
    private var recordingThread: Thread? = null
    private var mediaRecorder: MediaRecorder? = null
    private var audioFilePath: String = ""

    override fun onCreate() {
        super.onCreate()
        Log.d("Widget-LOG-RecordingService", "Service created")
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startRecording()
            ACTION_STOP -> stopRecording()
            else -> Log.d("Widget-LOG-RecordingService", "Unknown action: ${intent?.action}")
        }
        return START_STICKY
    }

    private fun startRecording() {
        if (isRecording) return

        // Start foreground immediately to avoid ForegroundServiceDidNotStartInTimeException
        startForeground(NOTIF_ID, buildNotification("Starting recording…"))

        val hasRecordPermission = ContextCompat.checkSelfPermission(
            this,
            android.Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        // Skip storage permission; saving in cacheDir doesn't need it
        if (!hasRecordPermission) {
            Log.e("Widget-LOG-RecordingService", "Missing RECORD_AUDIO permission")
            stopSelf()
            return
        }

        // Save in app's cache directory
        val file = File(cacheDir, "talkcents_recording_${System.currentTimeMillis()}.m4a")
        audioFilePath = file.absolutePath

        mediaRecorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setOutputFile(audioFilePath)
            try {
                prepare()
                start()
            } catch (ex: Exception) {
                Log.e("Widget-LOG-RecordingService", "Failed to start MediaRecorder", ex)
                stopSelf()
                return
            }
        }

        isRecording = true
        secondsElapsed = 0
        Log.d("Widget-LOG-RecordingService", "Recording started. File: $audioFilePath")

        // Thread to track elapsed time
        recordingThread = Thread {
            while (isRecording) {
                secondsElapsed++
                Log.d("Widget-LOG-RecordingService", "Recording… $secondsElapsed s")
                try {
                    Thread.sleep(1000)
                } catch (ie: InterruptedException) {
                    Thread.currentThread().interrupt()
                    break
                }
            }
        }.apply { start() }
    }

    private fun stopRecording() {
        if (!isRecording) return
        isRecording = false

        // Stop the recorder
        try {
            mediaRecorder?.stop()
            mediaRecorder?.release()
        } catch (_: Exception) {}
        mediaRecorder = null

        // Stop recording thread
        recordingThread?.interrupt()
        recordingThread = null

        Log.d("Widget-LOG-RecordingService", "Recording stopped. Saved to: $audioFilePath")

        // Update widgets to show result
        val appWidgetManager = AppWidgetManager.getInstance(this)
        val componentName = ComponentName(this, SimpleWidget::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

        appWidgetIds.forEach { widgetId ->
            val views = TalkResultWidget(this).buildRemoteViews(
                widgetId,
                "Recording Saved",
                audioFilePath
            )
            appWidgetManager.updateAppWidget(widgetId, views)
            Log.d("Widget-LOG-RecordingService", "TalkResultWidget updated for widgetId=$widgetId")
        }

        // Send broadcast for external listeners if needed
        val broadcast = Intent(BROADCAST_UPDATE).apply {
            putExtra("result_status", "Recording Saved")
            putExtra("result_detail", audioFilePath)
        }
        sendBroadcast(broadcast)

        stopForeground(true)
        stopSelf()
    }

    private fun buildNotification(contentText: String): Notification {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, NOTIF_CHANNEL_ID)
                .setContentTitle("TalkCents Recording")
                .setContentText(contentText)
                .setSmallIcon(R.drawable.icon_record_start)
                .build()
        } else {
            Notification.Builder(this)
                .setContentTitle("TalkCents Recording")
                .setContentText(contentText)
                .setSmallIcon(R.drawable.icon_record_start)
                .build()
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIF_CHANNEL_ID,
                "Recording Service Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
