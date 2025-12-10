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
import java.io.File
import java.io.FileInputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import com.talkcents.MySecureStorageAndroid

class RecordingService : Service() {

    companion object {
        const val ACTION_START = "com.talkcents.RECORDING_SERVICE_START"
        const val ACTION_STOP = "com.talkcents.RECORDING_SERVICE_STOP"
        const val NOTIF_CHANNEL_ID = "RecordingServiceChannel"
        const val NOTIF_ID = 101
        const val BROADCAST_UPDATE = "com.talkcents.RECORDING_UPDATE"
        const val BACKEND_URL = "https://talkcents-backend-7r52622dga-as.a.run.app/api/llm/audio-to-expenditure"
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

        // Fire-and-forget API call to backend
        Thread {
            try {
                // Retrieve token from secure storage
                val storage = MySecureStorageAndroid(this)
                val token = storage.getToken()

                // Upload audio with token
                uploadAudioToBackend(audioFilePath, token)
            } catch (ex: Exception) {
                Log.e("Widget-LOG-RecordingService", "Failed to upload audio", ex)
            }
        }.start()

        stopForeground(true)
        stopSelf()
    }

    private fun uploadAudioToBackend(filePath: String, token: String?) {
        val boundary = "*****" + System.currentTimeMillis() + "*****"
        val lineEnd = "\r\n"
        val twoHyphens = "--"

        val file = File(filePath)
        if (!file.exists()) {
            Log.e("Widget-LOG-RecordingService", "File does not exist: $filePath")
            return
        }

        val url = URL(BACKEND_URL)
        val connection = url.openConnection() as HttpURLConnection
        connection.apply {
            doInput = true
            doOutput = true
            useCaches = false
            requestMethod = "POST"
            connectTimeout = 15000
            readTimeout = 15000
            setChunkedStreamingMode(0) // <-- important for large files
            setRequestProperty("Connection", "Keep-Alive")
            setRequestProperty("ENCTYPE", "multipart/form-data")
            setRequestProperty("Content-Type", "multipart/form-data;boundary=$boundary")
            setRequestProperty("file", file.name)
            if (!token.isNullOrEmpty()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
        }

        val outputStream = connection.outputStream
        outputStream.apply {
            write((twoHyphens + boundary + lineEnd).toByteArray())
            write(("Content-Disposition: form-data; name=\"file\"; filename=\"${file.name}\"$lineEnd").toByteArray())
            write(("Content-Type: audio/m4a$lineEnd").toByteArray())
            write(lineEnd.toByteArray())

            FileInputStream(file).use { fis ->
                val buffer = ByteArray(4096) // smaller buffer is safer
                var bytesRead: Int
                while (fis.read(buffer).also { bytesRead = it } != -1) {
                    write(buffer, 0, bytesRead)
                }
            }

            write(lineEnd.toByteArray())
            write((twoHyphens + boundary + twoHyphens + lineEnd).toByteArray())
            flush()
            close()
        }

        // Only get response code, don't read body
        try {
            val responseCode = connection.responseCode
            Log.d("Widget-LOG-RecordingService", "Audio uploaded, response code: $responseCode")
        } catch (ex: Exception) {
            Log.e("Widget-LOG-RecordingService", "Upload finished with exception (ignored)", ex)
        } finally {
            connection.disconnect()
        }
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
