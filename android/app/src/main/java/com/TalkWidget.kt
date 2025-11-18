package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.RemoteViews

class TalkWidget(private val context: Context) {
    init {
        Log.d("Widget-LOG-Talk", "TalkWidget init")
    }

    private var secondsElapsed = 0
    private val handler = Handler(Looper.getMainLooper())
    private var currentAppWidgetId: Int = -1


    fun buildRemoteViews(appWidgetId: Int): RemoteViews {
        currentAppWidgetId = appWidgetId
        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)

        // stores backend data
        val talkData = fetchTalkData()

        // Set content button icon to start
        views.setImageViewResource(R.id.talk_content_button, R.drawable.icon_record_start)

        // Set cancel button to return to SimpleWidget
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }

        val cancelPendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            cancelIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPendingIntent)

        // Set content button click to start recording
        val recordIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.RECORD_START_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }

        val recordPendingIntent = PendingIntent.getBroadcast(
            context,
            1,
            recordIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.talk_content_button, recordPendingIntent)

        return views
    }

    fun startRecording(appWidgetId: Int) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        secondsElapsed = 0

        // change icon to stop
        val views = RemoteViews(context.packageName, R.layout.talk_widget_layout)
        views.setImageViewResource(R.id.talk_content_button, R.drawable.icon_record_stop)
        appWidgetManager.updateAppWidget(appWidgetId, views)

        // start timer updates
        handler.post(object : Runnable {
            override fun run() {
                val hours = secondsElapsed / 3600
                val minutes = (secondsElapsed % 3600) / 60
                val seconds = secondsElapsed % 60
                val timeString = String.format("%02d:%02d:%02d", hours, minutes, seconds)

                val updateViews = RemoteViews(context.packageName, R.layout.talk_widget_layout)
                updateViews.setTextViewText(R.id.recording_time, timeString)
                updateViews.setImageViewResource(R.id.talk_content_button, R.drawable.icon_record_stop)
                updateViews.setOnClickPendingIntent(
                    R.id.icon_cancel_button,
                    PendingIntent.getBroadcast(
                        context,
                        0,
                        Intent(context, SimpleWidget::class.java).apply { action = "com.talkcents.CANCEL_CLICK"; putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId) },
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                )

                appWidgetManager.updateAppWidget(appWidgetId, updateViews)
                secondsElapsed++
                handler.postDelayed(this, 1000)
            }
        })
    }

    private fun fetchTalkData(): String {
        // Do network call / local computation
        return "Talk: 123"
    }
}
