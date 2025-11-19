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
//        Log.d("Permissions", "Authenticated? $isAuthenticated")
        Log.d("Permissions", "I have a FUCKINGGGG token: ${token ?: "null"}")
        // Check authentication in background
        storage.checkAuthStatus { isAuthenticated ->
            // Now loop through all widgets
            for (appWidgetId in appWidgetIds) {
                val views = if (isAuthenticated) {
                    buildMainWidgetRemoteViews(context, appWidgetId)
                } else {
                    Log.d("Permissions", "User $appWidgetId is NOT authenticated!")
                    buildUnauthenticatedWidgetRemoteViews(context, appWidgetId)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
                Log.d("Widget-LOG-Simple", "Updated widgetId=$appWidgetId")
            }
        }
    }

    private fun buildUnauthenticatedWidgetRemoteViews(context: Context, appWidgetId: Int): RemoteViews {
        // Use a different layout, e.g., widget_unauthenticated.xml
        val views = RemoteViews(context.packageName, R.layout.widget_unauthenticated)

        Log.d("permissions", "buildUnauthenticatedWidgetRemoteViews for widgetId=$appWidgetId completed")
        return views
    }

    private fun buildMainWidgetRemoteViews(context: Context, appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_layout)

        // Graph button intent
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
        
        // Talk button intent
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

        // Root intent to do nothing when widget is clicked
        val rootIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.DO_NOTHING"
        }
        val rootPending = PendingIntent.getBroadcast(
            context,
            2,
            rootIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_root, rootPending)

        Log.d("Widget-LOG-Simple", "buildMainWidgetRemoteViews for widgetId=$appWidgetId completed")
        return views
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        val appWidgetManager = AppWidgetManager.getInstance(context)
        val appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, -1)
        if (appWidgetId == -1) return

        val views = when (intent.action) {
            "com.talkcents.GRAPH_CLICK" -> {
                Log.d("Widget-LOG-Simple", "GRAPH_CLICK received for widgetId=$appWidgetId")
                AnalyticsWidget(context).buildRemoteViews(appWidgetId)
            }
            "com.talkcents.MIC_CLICK" -> {
                Log.d("Widget-LOG-Simple", "MIC_CLICK received for widgetId=$appWidgetId")
                TalkWidget(context).buildRemoteViews(appWidgetId)
            }
            "com.talkcents.CANCEL_CLICK" -> {
                Log.d("Widget-LOG-Simple", "CANCEL_CLICK received, restoring main layout for widgetId=$appWidgetId")
                buildMainWidgetRemoteViews(context, appWidgetId)
            }
            "com.talkcents.RECORD_START_CLICK" -> {
                Log.d("Widget-LOG-Simple", "RECORD_START_CLICK received for widgetId=$appWidgetId")
                TalkWidget(context).startRecording(appWidgetId)
                buildMainWidgetRemoteViews(context, appWidgetId)
            }
            else -> {
                Log.d("Widget-LOG-Simple", "Unknown action=${intent.action}, defaulting to main layout for widgetId=$appWidgetId")
                buildMainWidgetRemoteViews(context, appWidgetId)
            }
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
        Log.d("Widget-LOG-Simple", "updateAppWidget applied for widgetId=$appWidgetId")
    }
}
