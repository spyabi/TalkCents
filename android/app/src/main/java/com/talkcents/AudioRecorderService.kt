package com.talkcents

import android.app.*
import android.content.Intent
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.os.Environment
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.File
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL

class AudioRecorderService : Service() {

    companion object {
        const val ACTION_START = "START"
        const val ACTION_STOP = "STOP"
        const val CHANNEL_ID = "recorder_channel"
        const val NOTIFICATION_ID = 1
    }

    private var recorder: MediaRecorder? = null
    private var outputFile: String = ""

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> startRecording()
            ACTION_STOP -> stopRecording()
        }
        return START_STICKY
    }

    private fun startRecording() {
        try {
            // Start foreground first
            startForeground(NOTIFICATION_ID, buildNotification("Recording…"))

            // Create file in app-specific Music directory
            val dir = getExternalFilesDir(Environment.DIRECTORY_MUSIC) ?: cacheDir
            if (!dir.exists()) dir.mkdirs()
            val file = File(dir, "recording.mp4")
            outputFile = file.absolutePath
            Log.d("AudioRecorderService", "Recording file: $outputFile")

            // Setup MediaRecorder
            recorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(outputFile)
                prepare()
                start()
            }

            Log.d("AudioRecorderService", "Recording started successfully")
        } catch (e: Exception) {
            Log.e("AudioRecorderService", "Failed to start recording", e)
            stopSelf()
        }
    }

    private fun stopRecording() {
        try {
            recorder?.apply {
                stop()
                release()
            }
        } catch (e: Exception) {
            Log.e("AudioRecorderService", "Error stopping recorder", e)
        } finally {
            recorder = null
        }

        val file = File(outputFile)
        if (file.exists()) {
            Log.d("AudioRecorderService", "Recording stopped, file saved at $outputFile")
            // Upload file asynchronously
            val token = MySecureStorageAndroid(this).getToken()
            token?.let {
                uploadFile(file, it, "http://18.234.224.108:8000/api/llm/audio-to-expenditure") { success, response ->
                    if (success) {
                        Log.d("AudioRecorderService", "Upload successful: $response")
                    } else {
                        Log.e("AudioRecorderService", "Upload failed: $response")
                    }
                }
            }
        } else {
            Log.e("AudioRecorderService", "Recording file does not exist")
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(text: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Audio Recorder")
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Audio Recorder",
                    NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun uploadFile(
            file: File,
            token: String,
            uploadUrl: String,
            onResult: (success: Boolean, response: String) -> Unit
    ) {
        Thread {
            val boundary = "*****" + System.currentTimeMillis() + "*****"
            val lineEnd = "\r\n"
            val twoHyphens = "--"

            try {
                val url = URL(uploadUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.doInput = true
                conn.doOutput = true
                conn.useCaches = false
                conn.requestMethod = "POST"
                conn.setRequestProperty("Connection", "Keep-Alive")
                conn.setRequestProperty("ENCTYPE", "multipart/form-data")
                conn.setRequestProperty("Content-Type", "multipart/form-data;boundary=$boundary")
                conn.setRequestProperty("Authorization", "Bearer $token")

                val outputStream = DataOutputStream(conn.outputStream)
                outputStream.writeBytes(twoHyphens + boundary + lineEnd)
                outputStream.writeBytes(
                        "Content-Disposition: form-data; name=\"file\"; filename=\"${file.name}\"$lineEnd"
                )
                outputStream.writeBytes("Content-Type: audio/mp4$lineEnd")
                outputStream.writeBytes(lineEnd)

                outputStream.write(file.readBytes())

                outputStream.writeBytes(lineEnd)
                outputStream.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd)
                outputStream.flush()
                outputStream.close()

                val responseCode = conn.responseCode
                val response = conn.inputStream.bufferedReader().readText()
                conn.disconnect()

                if (responseCode in 200..299) {
                    onResult(true, response)
                } else {
                    onResult(false, response)
                }
            } catch (e: Exception) {
                Log.e("AudioRecorderService", "Upload error: ${e.message}", e)
                onResult(false, e.message ?: "Unknown error")
            }
        }.start()
    }
}
