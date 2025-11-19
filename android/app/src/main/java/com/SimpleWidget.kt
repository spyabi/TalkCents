package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews

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

        // Talk button → launches RecordingStarterActivity
        val micIntent = Intent(context, RecordingStarterActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val micPending = PendingIntent.getActivity(
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

        val views: RemoteViews = when (intent.action) {

            "com.talkcents.GRAPH_CLICK" ->
                AnalyticsWidget(context).buildRemoteViews(appWidgetId)

            "com.talkcents.CANCEL_CLICK" ->
                buildMainWidgetRemoteViews(context, appWidgetId)

            else ->
                buildMainWidgetRemoteViews(context, appWidgetId)
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

}
