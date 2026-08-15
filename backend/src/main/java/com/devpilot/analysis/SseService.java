package com.devpilot.analysis;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseService {

    // Map of Job ID to list of connected emitters
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long jobId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hour timeout
        emitters.computeIfAbsent(jobId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(jobId, emitter));
        emitter.onTimeout(() -> removeEmitter(jobId, emitter));
        emitter.onError((e) -> removeEmitter(jobId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("SSE Connected for Job " + jobId));
        } catch (IOException e) {
            removeEmitter(jobId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long jobId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(jobId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                emitters.remove(jobId);
            }
        }
    }

    public void sendProgress(Long jobId, String step, int percentage, String status, String errorMessage) {
        CopyOnWriteArrayList<SseEmitter> list = emitters.get(jobId);
        if (list != null) {
            for (SseEmitter emitter : list) {
                try {
                    Map<String, Object> data = new ConcurrentHashMap<>();
                    data.put("jobId", jobId);
                    data.put("step", step);
                    data.put("percentage", percentage);
                    data.put("status", status);
                    if (errorMessage != null) {
                        data.put("error", errorMessage);
                    }
                    emitter.send(SseEmitter.event().name("progress").data(data));
                    
                    if ("COMPLETED".equals(status) || "FAILED".equals(status)) {
                        emitter.complete();
                    }
                } catch (IOException e) {
                    removeEmitter(jobId, emitter);
                }
            }
        }
    }
}
