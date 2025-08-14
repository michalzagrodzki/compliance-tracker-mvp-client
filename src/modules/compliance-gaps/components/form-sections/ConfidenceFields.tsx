 
import React from 'react';

interface ConfidenceFieldsProps {
  confidenceScore: number;
  falsePositiveLikelihood: number;
  onChange: (field: 'confidence_score' | 'false_positive_likelihood', value: number) => void;
}

const ConfidenceFields: React.FC<ConfidenceFieldsProps> = ({
  confidenceScore,
  falsePositiveLikelihood,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label htmlFor="confidence_score" className="text-sm font-medium">Confidence Score</label>
        <div className="space-y-2">
          <input
            id="confidence_score"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidenceScore}
            onChange={(e) => onChange('confidence_score', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm text-muted-foreground">
            {Math.round(confidenceScore * 100)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="false_positive_likelihood" className="text-sm font-medium">False Positive Likelihood</label>
        <div className="space-y-2">
          <input
            id="false_positive_likelihood"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={falsePositiveLikelihood}
            onChange={(e) => onChange('false_positive_likelihood', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm text-muted-foreground">
            {Math.round(falsePositiveLikelihood * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceFields;

