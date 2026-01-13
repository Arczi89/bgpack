package com.bgpack.health;

import java.net.HttpURLConnection;
import java.net.URL;

public class HealthCheck {
    public static void main(String[] args) {
        try {
            URL url = new URL("http://localhost:8080/api/test");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(2000);
            connection.connect();

            if (connection.getResponseCode() == 200) {
                System.exit(0); // Healthy
            }
        } catch (Exception e) {
            System.exit(1); // Unhealthy
        }
        System.exit(1);
    }
}