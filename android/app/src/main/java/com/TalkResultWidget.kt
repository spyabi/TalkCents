package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews

class TalkResultWidget(private val context: Context) {

    init {
        Log.d("Widget-LOG-Result", "TalkResultWidget init")
    }

    fun buildRemoteViews(appWidgetId: Int, resultStatus: String, resultDetail: String): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.talk_result_widget_layout)

        // Populate API result (placeholder for now)
        views.setTextViewText(R.id.result_status, resultStatus)
        views.setTextViewText(R.id.result_detail, resultDetail)

        // Cancel button → return to SimpleWidget layout
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }

        val cancelPending = PendingIntent.getBroadcast(
            context,
            9,
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

        Log.d("Widget-LOG-Result", "TalkResultWidget loaded for widgetId=$appWidgetId")
        return views
    }
}
