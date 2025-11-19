package com.talkcents

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import android.app.PendingIntent
import com.talkcents.AudioRecorderService

class TalkWidget(private val context: Context) {

    fun buildRemoteViews(appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)

        // Middle text always shows "Recording…"
        views.setTextViewText(R.id.record_status_text, "Recording…")

        // Middle button acts as STOP
        val stopIntent = Intent(context, SimpleWidget::class.java).apply {
            action = ACTION_STOP
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val stopPending = PendingIntent.getBroadcast(
                context,
                1,
                stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.talk_content_button, stopPending)

        // Cancel button also stops recording
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = ACTION_STOP
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val cancelPending = PendingIntent.getBroadcast(
                context,
                2,
                cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

        return views
    }

    fun startRecording() {
        val intent = Intent(context, AudioRecorderService::class.java).apply {
            action = AudioRecorderService.ACTION_START
        }
        Log.d("permissions", "Recording started")
        context.startForegroundService(intent)
    }

    fun stopRecording(appWidgetId: Int) {
        val intent = Intent(context, AudioRecorderService::class.java).apply {
            action = AudioRecorderService.ACTION_STOP
        }
        context.startService(intent)
        Log.d("permissions", "Recording stopped")

        // Update widget back to SimpleWidget layout
        val resetIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.RESET_WIDGET"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        context.sendBroadcast(resetIntent)
    }

    companion object {
        const val ACTION_STOP = "com.talkcents.RECORD_STOP_CLICK"
    }
}
