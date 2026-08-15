import React from 'react';

interface ReviewSummaryCardProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const ReviewSummaryCard: React.FC<ReviewSummaryCardProps> = ({ critical, high, medium, low }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <h4 className="text-red-800 text-sm font-semibold mb-1">Critical</h4>
        <span className="text-3xl font-bold text-red-600">{critical}</span>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
        <h4 className="text-orange-800 text-sm font-semibold mb-1">High</h4>
        <span className="text-3xl font-bold text-orange-600">{high}</span>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <h4 className="text-yellow-800 text-sm font-semibold mb-1">Medium</h4>
        <span className="text-3xl font-bold text-yellow-600">{medium}</span>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <h4 className="text-blue-800 text-sm font-semibold mb-1">Low</h4>
        <span className="text-3xl font-bold text-blue-600">{low}</span>
      </div>
    </div>
  );
};
