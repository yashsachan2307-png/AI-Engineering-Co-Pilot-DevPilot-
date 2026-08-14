package com.devpilot.ingestion;

import java.util.Set;

public class FileFilterUtils {

    private static final Set<String> IGNORED_DIRECTORIES = Set.of(
            ".git", "node_modules", "target", "build", "dist", ".idea", ".vscode", "__pycache__"
    );

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(
            "java", "js", "jsx", "ts", "tsx", "py", "cpp", "cc", "hpp", "h", "c", "html", "htm", "css", "sql", "json", "xml"
    );

    public static boolean isPathAllowed(String path) {
        String[] parts = path.split("/");
        for (String part : parts) {
            if (IGNORED_DIRECTORIES.contains(part)) {
                return false;
            }
        }
        return true;
    }

    public static boolean isExtensionSupported(String filename) {
        String ext = getExtension(filename);
        return ext != null && SUPPORTED_EXTENSIONS.contains(ext.toLowerCase());
    }

    public static String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return null;
    }

    public static String getLanguage(String extension) {
        if (extension == null) return "unknown";
        switch (extension.toLowerCase()) {
            case "java": return "Java";
            case "js": case "jsx": return "JavaScript";
            case "ts": case "tsx": return "TypeScript";
            case "py": return "Python";
            case "cpp": case "cc": case "hpp": return "C++";
            case "c": case "h": return "C";
            case "html": case "htm": return "HTML";
            case "css": return "CSS";
            case "sql": return "SQL";
            case "json": return "JSON";
            case "xml": return "XML";
            default: return "unknown";
        }
    }
}
