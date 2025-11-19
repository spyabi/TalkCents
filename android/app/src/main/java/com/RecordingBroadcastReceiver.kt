package com.talkcents

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log

class RecordingBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == RecordingService.BROADCAST_UPDATE) {
            val status = intent.getStringExtra("result_status") ?: "Expense Recorded"
            val detail = intent.getStringExtra("result_detail") ?: ""
            Log.d("Widget-LOG-RecordingReceiver", "Received recording finished broadcast")

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, SimpleWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            // Update all widgets to show TalkResultWidget
            appWidgetIds.forEach { widgetId ->
                val views = TalkResultWidget(context).buildRemoteViews(widgetId, status, detail)
                appWidgetManager.updateAppWidget(widgetId, views)
                Log.d("Widget-LOG-RecordingReceiver", "TalkResultWidget updated for widgetId=$widgetId")
            }
        }
    }
}
