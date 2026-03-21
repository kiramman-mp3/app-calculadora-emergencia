package com.anonymous.Calculadora;

import android.telephony.SmsManager;
import android.Manifest;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import java.util.ArrayList;

public class SMSModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public SMSModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "SMSModule";
    }

    @ReactMethod
    public void sendSMS(String phoneNumber, String message, Promise promise) {
        try {
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.SEND_SMS) 
                != PackageManager.PERMISSION_GRANTED) {
                promise.reject("PERMISSION_DENIED", "Usted no tiene permisos para enviar SMS.");
                return;
            }

            SmsManager smsManager;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                smsManager = reactContext.getSystemService(SmsManager.class);
            } else {
                smsManager = SmsManager.getDefault();
            }

            if (smsManager == null) {
                promise.reject("SMS_ERROR", "No se pudo obtener el servicio de SMS.");
                return;
            }

            // Flag para PendingIntent según versión de Android
            int flags = PendingIntent.FLAG_IMMUTABLE;
            
            // Intent para rastrear el envío (algunos sistemas lo requieren para no dejarlo en borrador)
            PendingIntent sentPI = PendingIntent.getBroadcast(reactContext, 0, new Intent("SMS_SENT"), flags);

            // Dividir mensaje si es muy largo
            ArrayList<String> parts = smsManager.divideMessage(message);
            
            if (parts.size() > 1) {
                ArrayList<PendingIntent> sentIntents = new ArrayList<>();
                for (int i = 0; i < parts.size(); i++) {
                    sentIntents.add(sentPI);
                }
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, sentIntents, null);
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, sentPI, null);
            }

            promise.resolve("SMS Sent Successfully");
        } catch (Exception e) {
            promise.reject("SMS_ERROR", e.getMessage());
        }
    }
}
