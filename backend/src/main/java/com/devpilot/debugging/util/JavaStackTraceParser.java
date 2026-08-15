package com.devpilot.debugging.util;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JavaStackTraceParser {

    // Regex to match "at com.example.MyClass.myMethod(MyClass.java:123)"
    private static final Pattern STACK_TRACE_PATTERN = Pattern.compile("^\\s*at\\s+([\\w.$]+)\\.([\\w$<>]+)\\((.*\\.java):(\\d+)\\)");

    public static List<String> extractRelevantClasses(String stackTrace) {
        if (stackTrace == null || stackTrace.trim().isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> relevantClasses = new LinkedHashSet<>();
        String[] lines = stackTrace.split("\\r?\\n");

        for (String line : lines) {
            Matcher matcher = STACK_TRACE_PATTERN.matcher(line);
            if (matcher.find()) {
                String fullClassName = matcher.group(1);
                
                // Filter out standard libraries and frameworks to focus on user code
                if (!isIgnoredPackage(fullClassName)) {
                    relevantClasses.add(fullClassName);
                }
            }
        }
        return new ArrayList<>(relevantClasses);
    }

    private static boolean isIgnoredPackage(String className) {
        return className.startsWith("java.") ||
               className.startsWith("javax.") ||
               className.startsWith("sun.") ||
               className.startsWith("org.springframework.") ||
               className.startsWith("org.apache.") ||
               className.startsWith("org.hibernate.") ||
               className.startsWith("com.sun.") ||
               className.startsWith("jdk.internal.");
    }
}
