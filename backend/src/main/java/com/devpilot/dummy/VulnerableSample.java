package com.devpilot.dummy;

import java.security.MessageDigest;

public class VulnerableSample {
    
    // Hardcoded secrets
    private static final String AWS_KEY = "AKIA1234567890123456";
    private static final String DB_PASSWORD = "password = 'my_super_secret_db_password123'";

    public void queryDatabase(String userInput) {
        // Unsafe SQL
        String query = "SELECT * FROM users WHERE username = '" + userInput + "'";
        System.out.println("Executing: " + query);
    }
    
    public void hashPassword(String password) throws Exception {
        // Weak Hashing
        MessageDigest md = MessageDigest.getInstance("MD5");
        md.update(password.getBytes());
        System.out.println(new String(md.digest()));
    }
}
