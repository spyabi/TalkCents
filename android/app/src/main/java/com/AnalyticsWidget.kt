package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews

class AnalyticsWidget(private val context: Context) {
    init {
        Log.d("Widget-LOG-Analytics", "AnalyticsWidget init")
    }

    fun buildRemoteViews(appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.analytics_widget_layout)

        // stores backend data
        val analyticsData = fetchAnalyticsData()

        // Set cancel button to return to SimpleWidget
        val intent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, pendingIntent)

        return views
    }

    private fun fetchAnalyticsData(): String {
        // Do network call / local computation
        return "Analytics: 123"
    }
}
