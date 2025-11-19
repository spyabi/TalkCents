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
                // Update widget UI to show recording state
                // 1. Start recording immediately
                talkWidget.startRecording()

                // 2. Build the RemoteViews and return it
                talkWidget.buildRemoteViews(appWidgetId)
            }

            // Both stop and cancel actions go through TalkWidget.stopRecording()
            "com.talkcents.RECORD_STOP_CLICK" -> {
                talkWidget.stopRecording(appWidgetId)
                // stopRecording already updates the widget layout back to SimpleWidget
                // Return dummy views here to satisfy type requirement
                RemoteViews(context.packageName, R.layout.widget_layout)
            }
            "com.talkcents.CANCEL_CLICK" -> {
                Log.d("Widget-LOG-Simple", "CANCEL_CLICK received, restoring main layout for widgetId=$appWidgetId")
                buildMainWidgetRemoteViews(context, appWidgetId)
            }
            // used to bring back after stop click
            "com.talkcents.RESET_WIDGET" -> {
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
