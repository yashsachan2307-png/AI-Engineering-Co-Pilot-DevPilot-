import React, { useState } from 'react';
import { ReviewFinding } from '../../../services/reviewService';

interface FindingDetailProps {
  finding: ReviewFinding;
  onUpdateStatus: (findingId: number, status: 'PENDING' | 'REVIEWED' | 'DISMISSED') => void;
}

export const FindingDetail: React.FC<FindingDetailProps> = ({ finding, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: 'REVIEWED' | 'DISMISSED') => {
    setUpdating(true);
    try {
      await onUpdateStatus(finding.id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm sticky top-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{finding.title}</h3>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          {finding.category}
        </span>
      </div>
      
      <p className="text-gray-700 mb-6">{finding.description}</p>
      
      {finding.evidence && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Evidence / Snippet</h4>
          <pre className="bg-gray-50 p-4 rounded text-sm text-gray-800 overflow-x-auto border">
            <code>{finding.evidence}</code>
          </pre>
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendation</h4>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded text-blue-900">
          {finding.recommendation}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 pt-4 border-t">
        <span className="text-sm text-gray-500 mr-auto">Current Status: <strong className="text-gray-900">{finding.status}</strong></span>
        {finding.status !== 'REVIEWED' && (
          <button 
            disabled={updating}
            onClick={() => handleStatusChange('REVIEWED')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50 transition-colors"
          >
            Mark as Fixed/Reviewed
          </button>
        )}
        {finding.status !== 'DISMISSED' && (
          <button 
            disabled={updating}
            onClick={() => handleStatusChange('DISMISSED')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium disabled:opacity-50 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
