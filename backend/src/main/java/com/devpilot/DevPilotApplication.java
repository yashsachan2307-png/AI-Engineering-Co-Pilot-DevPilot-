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
        if (dbUrl != null && !dbUrl.startsWith("jdbc:")) {
            try {
                URI uri = new URI(dbUrl);
                String scheme = uri.getScheme();
                
                if (scheme != null && scheme.startsWith("postgres")) {
                    String host = uri.getHost();
                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String path = uri.getPath();
                    
                    String newUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    if (uri.getQuery() != null) {
                        newUrl += "?" + uri.getQuery();
                        if (!newUrl.contains("sslmode=")) {
                            newUrl += "&sslmode=require";
                        }
                    } else {
                        newUrl += "?sslmode=require";
                    }
                    
                    System.setProperty("spring.datasource.url", newUrl);
                    System.setProperty("DATABASE_URL", newUrl);
                    
                    if (uri.getUserInfo() != null) {
                        String[] userInfo = uri.getUserInfo().split(":");
                        if (userInfo.length > 0) {
                            System.setProperty("spring.datasource.username", userInfo[0]);
                            System.setProperty("DATABASE_USERNAME", userInfo[0]);
                        }
                        if (userInfo.length > 1) {
                            System.setProperty("spring.datasource.password", userInfo[1]);
                            System.setProperty("DATABASE_PASSWORD", userInfo[1]);
                        }
                    }
                }
            } catch (URISyntaxException e) {
                // Ignore and let Spring Boot handle the malformed URL
            }
        }

        SpringApplication.run(DevPilotApplication.class, args);
    }
}
