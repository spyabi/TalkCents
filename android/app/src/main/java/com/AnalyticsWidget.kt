package com.talkcents

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews

//for the api calls
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject
import org.json.JSONArray

import com.talkcents.MySecureStorageAndroid

class AnalyticsWidget(private val context: Context) {
    init {
        Log.d("Widget-LOG-Analytics", "AnalyticsWidget init")
    }

    fun buildRemoteViews(appWidgetId: Int): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.analytics_widget_layout)

        // Placeholder text until data is loaded
        views.setTextViewText(R.id.analytics_today, "Spent today: Loading...")
        views.setTextViewText(R.id.analytics_month, "Monthly expenditure: Loading...")

        // Cancel button to go back to SimpleWidget
        val cancelIntent = Intent(context, SimpleWidget::class.java).apply {
            action = "com.talkcents.CANCEL_CLICK"
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
        }
        val cancelPending = PendingIntent.getBroadcast(
                context, 0, cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

        // Run API calls in a background thread
        Thread {
            try {
                val storage = MySecureStorageAndroid(context)
                val token = storage.getToken() ?: return@Thread

                val today = LocalDate.now()
                val formatter = DateTimeFormatter.ISO_DATE
                val todayStr = today.format(formatter)

                // 1️⃣ Fetch today expenditure
                val todayUrl = URL("https://talkcents-backend-7r52622dga-as.a.run.app/api/expenditure/date_filter?start_date=$todayStr&end_date=$todayStr")
                val todayDataRaw = getApiData(todayUrl, token)
                val todayArray = JSONArray(todayDataRaw)
                var todayTotal = 0
                for (i in 0 until todayArray.length()) {
                    todayTotal += todayArray.getJSONObject(i).optInt("amount", 0)
                }

                // 2️⃣ Fetch this month expenditure
                val firstDay = today.withDayOfMonth(1)
                val lastDay = today.withDayOfMonth(today.lengthOfMonth())
                val monthUrl = URL("https://talkcents-backend-7r52622dga-as.a.run.app/api/expenditure/date_filter?start_date=${firstDay.format(formatter)}&end_date=${lastDay.format(formatter)}")
                val monthDataRaw = getApiData(monthUrl, token)
                val monthArray = JSONArray(monthDataRaw)
                var monthTotal = 0
                for (i in 0 until monthArray.length()) {
                    monthTotal += monthArray.getJSONObject(i).optInt("amount", 0)
                }

                // Build updated RemoteViews
                val updatedViews = RemoteViews(context.packageName, R.layout.analytics_widget_layout)
                updatedViews.setTextViewText(R.id.analytics_today, "Spent today: $todayTotal")
                updatedViews.setTextViewText(R.id.analytics_month, "Monthly expenditure: $monthTotal")
                updatedViews.setOnClickPendingIntent(R.id.icon_cancel_button, cancelPending)

                // Apply to the widget
                val appWidgetManager = AppWidgetManager.getInstance(context)
                appWidgetManager.updateAppWidget(appWidgetId, updatedViews)
                Log.d("AnalyticsWidget", "Widget $appWidgetId updated with totals")

            } catch (e: Exception) {
                e.printStackTrace()
                Log.e("AnalyticsWidget", "Error fetching or parsing API data for widget $appWidgetId")
            }
        }.start()

        return views
    }

    private fun getApiData(url: URL, token: String): String {
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        conn.setRequestProperty("Authorization", "Bearer $token")
        conn.connectTimeout = 5000
        conn.readTimeout = 5000

        val data = conn.inputStream.bufferedReader().readText()
        conn.disconnect()
        return data
    }
}
