package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.talkcents.MySecureStorageAndroid

class SimpleWidget : AppWidgetProvider() {
    init {
        Log.d("Widget-LOG-Simple", "SimpleWidget init")
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val storage = MySecureStorageAndroid(context)
        val token = storage.getToken()
        Log.d("Permissions", "I have a token: ${token ?: "null"}")

        storage.checkAuthStatus { isAuthenticated ->
            for (appWidgetId in appWidgetIds) {
                val views = if (isAuthenticated) {
                    buildMainWidgetRemoteViews(context, appWidgetId)
                } else {
                    buildUnauthenticatedWidgetRemoteViews(context, appWidgetId)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
                Log.d("Widget-LOG-Simple", "Updated widgetId=$appWidgetId")
            }
        }
    }

    private fun buildUnauthenticatedWidgetRemoteViews(context: Context, appWidgetId: Int): RemoteViews {
        return RemoteViews(context.packageName, R.layout.widget_unauthenticated)
    }

    private fun buildMainWidgetRemoteViews(context: Context, appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_layout)

        // Graph button
        val graphIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.GRAPH_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val graphPending = PendingIntent.getBroadcast(
            context,
            0,
            graphIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_graph_button, graphPending)

        // Talk button
        val micIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.MIC_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val micPending = PendingIntent.getBroadcast(
            context,
            1,
            micIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_mic_button, micPending)

        return views
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        val appWidgetManager = AppWidgetManager.getInstance(context)
        val appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, -1)
        if (appWidgetId == -1) return

        val talkWidget = TalkWidget(context)

        // Make the when expression exhaustive by adding an else branch
        val views: RemoteViews = when (intent.action) {

            "com.talkcents.GRAPH_CLICK" -> {
                AnalyticsWidget(context).buildRemoteViews(appWidgetId)
            }

            "com.talkcents.MIC_CLICK" -> {
                talkWidget.buildRemoteViews(appWidgetId)
            }

            "com.talkcents.RECORD_START_CLICK" -> {
                talkWidget.startRecording(appWidgetId)
                talkWidget.buildRemoteViews(appWidgetId)
            }

            "com.talkcents.RECORD_STOP_CLICK" -> {
                // Stop handler so it does not keep updating widget
                talkWidget.stopRecording()
                Log.d("Widget-LOG-Simple", "RECORD_STOP_CLICK → Showing result widget")
                TalkResultWidget(context).buildRemoteViews(
                    appWidgetId,
                    "Expense Recorded",
                    "Mac's Lunch $10"
                )
            }

            "com.talkcents.CANCEL_CLICK" -> {
                buildMainWidgetRemoteViews(context, appWidgetId)
            }

            else -> {
                Log.d("Widget-LOG-Simple", "Unknown action=${intent.action}, defaulting to main layout")
                buildMainWidgetRemoteViews(context, appWidgetId)
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
        Log.d("Widget-LOG-Simple", "updateAppWidget applied for widgetId=$appWidgetId")
    }
}
