package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.RemoteViews

class TalkWidget(private val context: Context) {

    init {
        Log.d("Widget-LOG-Talk", "TalkWidget init")
    }

    private var secondsElapsed = 0
    private val handler = Handler(Looper.getMainLooper())
    private var currentAppWidgetId: Int = -1

    // New: Keep track of active recording run
    private var recordingRunnable: Runnable? = null

    fun buildRemoteViews(appWidgetId: Int): RemoteViews {
        currentAppWidgetId = appWidgetId
        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)

        views.setTextViewText(R.id.record_status_text, "Start Recording")
        views.setImageViewResource(R.id.talk_content_button, R.drawable.icon_record_start)

        // Cancel button
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }

        val cancelPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPendingIntent)

        // Start recording button
        val recordIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.RECORD_START_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }

        val recordPendingIntent = PendingIntent.getBroadcast(
            context,
            1,
            recordIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.talk_content_button, recordPendingIntent)

        return views
    }

    fun startRecording(appWidgetId: Int) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        secondsElapsed = 0

        // Stop any previous handler run if it exists
        recordingRunnable?.let { handler.removeCallbacks(it) }

        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)
        views.setTextViewText(R.id.record_status_text, "Recording…")
        views.setImageViewResource(R.id.talk_content_button, R.drawable.icon_record_stop)

        // Stop recording button → go to TalkResultWidget
        val stopIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.RECORD_STOP_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            context,
            5,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.talk_content_button, stopPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)

        // Start handler loop
        recordingRunnable = object : Runnable {
            override fun run() {
                Log.d("Widget-LOG-Talk", "Recording… still running (${secondsElapsed}s)")

                val updateViews = RemoteViews(context.packageName, R.layout.talk_widget_layout)
                updateViews.setTextViewText(R.id.record_status_text, "Recording…")
                updateViews.setImageViewResource(R.id.talk_content_button, R.drawable.icon_record_stop)
                updateViews.setOnClickPendingIntent(R.id.talk_content_button, stopPendingIntent)

                // Cancel button
                updateViews.setOnClickPendingIntent(
                    R.id.icon_cancel_button,
                    PendingIntent.getBroadcast(
                        context,
                        0,
                        Intent(context, SimpleWidget::class.java).apply {
                            action = "com.talkcents.CANCEL_CLICK"
                            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                        },
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                )

                appWidgetManager.updateAppWidget(appWidgetId, updateViews)
                secondsElapsed++
                handler.postDelayed(this, 1000)
            }
        }

        handler.post(recordingRunnable!!)
    }

    // New: call this to stop the handler loop manually
    fun stopRecording() {
        recordingRunnable?.let { handler.removeCallbacks(it) }
        recordingRunnable = null
        Log.d("Widget-LOG-Talk", "Recording stopped, handler cleared")
    }
}
