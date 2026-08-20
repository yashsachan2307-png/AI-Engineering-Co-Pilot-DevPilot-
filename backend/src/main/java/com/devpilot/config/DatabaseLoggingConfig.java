package com.devpilot.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseLoggingConfig implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseLoggingConfig.class);

    @Value("${spring.datasource.url:No URL configured}")
    private String databaseUrl;

    @Override
    public void run(String... args) {
        if (databaseUrl != null) {
            if (databaseUrl.startsWith("jdbc:h2:")) {
                logger.info("Database provider: H2");
            } else if (databaseUrl.startsWith("jdbc:postgresql:")) {
                logger.info("Database provider: PostgreSQL");
            } else {
                logger.info("Database provider: Other");
            }
        } else {
            logger.info("Database provider: None");
        }
    }
}
