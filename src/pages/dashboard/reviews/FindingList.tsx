import React from 'react';
import { ReviewFinding } from '../../../services/reviewService';

interface FindingListProps {
  findings: ReviewFinding[];
  selectedFindingId: number | null;
  onSelect: (finding: ReviewFinding) => void;
}

export const FindingList: React.FC<FindingListProps> = ({ findings, selectedFindingId, onSelect }) => {
  if (findings.length === 0) {
    return <div className="text-gray-500 text-center p-4 border rounded">No findings to display.</div>;
  }

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="border rounded-lg divide-y bg-white">
      {findings.map(finding => (
        <div 
          key={finding.id} 
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${selectedFindingId === finding.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
          onClick={() => onSelect(finding)}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900 truncate pr-4">{finding.title}</h4>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(finding.severity)}`}>
              {finding.severity}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="bg-gray-100 px-2 py-0.5 rounded">{finding.category}</span>
            <span>
              {finding.file} {finding.startLine ? `(L${finding.startLine})` : ''}
            </span>
            {finding.status !== 'PENDING' && (
              <span className={`font-semibold ${finding.status === 'REVIEWED' ? 'text-green-600' : 'text-gray-400'}`}>
                {finding.status}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
