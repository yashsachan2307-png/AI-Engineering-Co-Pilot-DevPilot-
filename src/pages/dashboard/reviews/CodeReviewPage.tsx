import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewSummary, ReviewFinding, reviewService } from '../../../services/reviewService';
import { ReviewSummaryCard } from './ReviewSummaryCard';
import { FindingList } from './FindingList';
import { FindingDetail } from './FindingDetail';

export const CodeReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [fileOrContext, setFileOrContext] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<ReviewFinding | null>(null);
  const [error, setError] = useState('');

  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !fileOrContext.trim()) return;
    
    setLoading(true);
    setError('');
    setSummary(null);
    setSelectedFinding(null);
    
    try {
      const result = await reviewService.createReview(id, fileOrContext, codeSnippet);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (findingId: number, status: 'PENDING' | 'REVIEWED' | 'DISMISSED') => {
    try {
      const updated = await reviewService.updateFindingStatus(findingId, status);
      // Update local state
      if (summary) {
        setSummary({
          ...summary,
          findings: summary.findings.map(f => f.id === findingId ? updated : f)
        });
      }
      if (selectedFinding?.id === findingId) {
        setSelectedFinding(updated);
      }
    } catch (err) {
      console.error('Failed to update finding', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Code Review</h1>
        <p className="text-gray-600">Analyze your code using deterministic tools and LLM context to get precise findings.</p>
      </div>

      {!summary && !loading && (
        <form onSubmit={handleStartReview} className="bg-white p-6 rounded-lg shadow-sm border max-w-3xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">File Name or Context</label>
            <input 
              type="text" 
              required
              value={fileOrContext}
              onChange={e => setFileOrContext(e.target.value)}
              placeholder="e.g. src/main/java/AuthService.java"
              className="w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Code Snippet (Optional)</label>
            <textarea 
              rows={10}
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Review
          </button>
        </form>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">Running static analysis and LLM review...</p>
        </div>
      )}

      {summary && !loading && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Review Results</h2>
            <button 
              onClick={() => { setSummary(null); setFileOrContext(''); setCodeSnippet(''); }}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Start New Review
            </button>
          </div>
          
          <ReviewSummaryCard 
            critical={summary.criticalCount}
            high={summary.highCount}
            medium={summary.mediumCount}
            low={summary.lowCount}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="font-semibold text-lg mb-3">Findings ({summary.findings.length})</h3>
              <FindingList 
                findings={summary.findings} 
                selectedFindingId={selectedFinding?.id || null}
                onSelect={setSelectedFinding}
              />
            </div>
            <div className="col-span-1 lg:col-span-2">
              {selectedFinding ? (
                <FindingDetail finding={selectedFinding} onUpdateStatus={handleUpdateStatus} />
              ) : (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                  Select a finding from the list to view details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
