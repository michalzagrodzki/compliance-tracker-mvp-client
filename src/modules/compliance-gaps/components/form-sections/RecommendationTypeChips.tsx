 
import React from 'react';
import type { RecommendationType } from '../../types';
import { RECOMMENDATION_TYPE_OPTIONS } from '../../types';

interface RecommendationTypeChipsProps {
  value?: RecommendationType;
  onChange: (value?: RecommendationType) => void;
}

const RecommendationTypeChips: React.FC<RecommendationTypeChipsProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Recommendation Type</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {RECOMMENDATION_TYPE_OPTIONS.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(value === option.value ? undefined : option.value)}
            className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
              value === option.value
                ? 'border-blue-400 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className="font-medium">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendationTypeChips;

