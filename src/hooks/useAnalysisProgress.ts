import { useState, useEffect } from 'react';

export interface AnalysisProgressEvent {
  jobId: number;
  step: string;
  percentage: number;
  status: string;
  error?: string;
}

export function useAnalysisProgress(repositoryId: number | undefined, jobId: number | undefined) {
  const [progress, setProgress] = useState<AnalysisProgressEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repositoryId || !jobId) return;

    // We must connect using the real endpoint since this is SSE.
    // Ensure we handle auth token if your backend requires it for SSE, 
    // but typically SSE with token can be tricky. Often token is passed in query string.
    const token = localStorage.getItem('token');
    
    // In dev mode, Vite proxy should handle this or we can construct full URL
    // Assuming backend is on /api. If token is needed, might need a workaround for EventSource.
    const url = `/api/repositories/${repositoryId}/analyze/progress/${jobId}${token ? `?access_token=${token}` : ''}`;
    
    const eventSource = new EventSource(url);

    eventSource.addEventListener('progress', (e: any) => {
      try {
        const data = JSON.parse(e.data) as AnalysisProgressEvent;
        setProgress(data);
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          eventSource.close();
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    });

    eventSource.addEventListener('connected', (e: any) => {
      console.log('SSE connected:', e.data);
    });

    eventSource.onerror = (e) => {
      console.error('SSE error:', e);
      setError('Connection to server lost. Reconnecting might be required.');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [repositoryId, jobId]);

  return { progress, error };
}
