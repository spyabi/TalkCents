package com.talkcents

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import java.net.HttpURLConnection
import java.net.URL
import android.util.Log

class MySecureStorageAndroid(private val context: Context) {

    // Create the encrypted shared prefs
    private fun getPrefs(): SharedPreferences {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        return EncryptedSharedPreferences.create(
                "secure_prefs",             // Must match React Native
                masterKeyAlias,
                context,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    // Get the stored token
    fun getToken(): String? {
        val prefs = getPrefs()
        return prefs.getString("user_token", null)
    }

    // Check if token is valid by calling your API
    fun checkAuthStatus(callback: (Boolean) -> Unit) {
        val token = getToken() ?: run {
            callback(false)
            return
        }

        Thread {
            val isValid = try {
                val url = URL("https://talkcents-backend-7r52622dga-as.a.run.app/api/user/me")
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    setRequestProperty("Authorization", "Bearer $token")
                    connectTimeout = 5000
                    readTimeout = 5000
                }
                val valid = conn.responseCode == 200
                conn.disconnect()
                valid
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }

            // Call the callback with result
            callback(isValid)
        }.start()
    }
}