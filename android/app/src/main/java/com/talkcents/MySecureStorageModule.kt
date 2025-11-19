package com.talkcents

import android.content.SharedPreferences
import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

//to update the widget
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent

class MySecureStorageModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MySecureStorage"
    }

    private fun getPrefs(): SharedPreferences {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        return EncryptedSharedPreferences.create(
                "secure_prefs",
                masterKeyAlias,
                reactApplicationContext,  // <--- use reactApplicationContext
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    @ReactMethod
    fun saveToken(token: String) {
        val prefs = getPrefs()
        prefs.edit().putString("user_token", token).apply()
        notifyWidgetToUpdate()
    }

    @ReactMethod
    fun getToken(promise: Promise) {
        val prefs = getPrefs()
        val token = prefs.getString("user_token", null)
        promise.resolve(token)
    }

    @ReactMethod
    fun removeToken(promise: Promise) {
        try {
            val prefs = getPrefs()
            prefs.edit().remove("user_token").apply()
            promise.resolve(true) // success
            notifyWidgetToUpdate()
        } catch (e: Exception) {
            promise.reject("REMOVE_TOKEN_ERROR", e)
        }
    }

    private fun notifyWidgetToUpdate() {
        val context = reactApplicationContext
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, SimpleWidget::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

        val intent = Intent(context, SimpleWidget::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
        }
        context.sendBroadcast(intent)
    }
}
