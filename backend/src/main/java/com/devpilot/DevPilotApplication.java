package com.devpilot;

import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableCaching
public class DevPilotApplication {

    public static void main(String[] args) {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl != null && dbUrl.startsWith("postgres://")) {
            try {
                URI uri = new URI(dbUrl);
                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath();
                
                String newUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (uri.getQuery() != null) {
                    newUrl += "?" + uri.getQuery();
                }
                
                System.setProperty("spring.datasource.url", newUrl);
                
                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    if (userInfo.length > 0) {
                        System.setProperty("spring.datasource.username", userInfo[0]);
                    }
                    if (userInfo.length > 1) {
                        System.setProperty("spring.datasource.password", userInfo[1]);
                    }
                }
            } catch (URISyntaxException e) {
                // Ignore and let Spring Boot handle the malformed URL
            }
        }

        SpringApplication.run(DevPilotApplication.class, args);
    }
}
