package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews

class TalkWidget(private val context: Context) {

    init {
        Log.d("Widget-LOG-Talk", "TalkWidget init")
    }

    fun buildRemoteViews(appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)

        // Initial UI (not used anymore for immediate record start)
        views.setTextViewText(R.id.record_status_text, "Start Recording")

        // Cancel → return to SimpleWidget
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val cancelPending = PendingIntent.getBroadcast(
            context,
            appWidgetId * 10 + 0, // unique per widgetId
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

        return views
    }

    fun buildRecordingRemoteViews(appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)

        // Show Recording text
        views.setTextViewText(R.id.record_status_text, "Recording...")

        // Cancel → return to SimpleWidget
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val cancelPending = PendingIntent.getBroadcast(
            context,
            appWidgetId * 10 + 1, // unique per widgetId
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

        // Stop recording → Service STOP
        val stopIntent = Intent(context, RecordingService::class.java).apply {
            action = RecordingService.ACTION_STOP
        }
        val stopPending = PendingIntent.getService(
            context,
            appWidgetId * 10 + 2, // unique per widgetId
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.talk_stop_button, stopPending)

        return views
    }
}
