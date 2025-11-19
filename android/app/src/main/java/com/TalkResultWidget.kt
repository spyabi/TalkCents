package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews

class TalkResultWidget(private val context: Context) {

    init {
        Log.d("Widget-LOG-TalkResult", "TalkResultWidget init")
    }

    fun buildRemoteViews(appWidgetId: Int, status: String, detail: String): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.talk_result_widget_layout)

        views.setTextViewText(R.id.result_status, status)
        views.setTextViewText(R.id.result_detail, detail)
        views.setTextViewText(R.id.result_status_pending, "Pending")

        // Cancel button → back to SimpleWidget
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val cancelPending = PendingIntent.getBroadcast(
            context, 0, cancelIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

        return views
    }
}
