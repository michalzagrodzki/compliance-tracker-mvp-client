import React from 'react';
import type { DetectionMethod } from '../../types';

const DETECTION_METHOD_OPTIONS: Array<{
  value: DetectionMethod;
  label: string;
}> = [
  { value: 'query_analysis', label: 'Query Analysis' },
  { value: 'periodic_scan', label: 'Periodic Scan' },
  { value: 'document_upload', label: 'Document Upload' },
  { value: 'manual_review', label: 'Manual Review' },
  { value: 'external_audit', label: 'External Audit' }
];

interface DetectionMethodChipsProps {
  value?: DetectionMethod;
  onChange: (value: DetectionMethod) => void;
  disabled?: boolean;
}

const DetectionMethodChips: React.FC<DetectionMethodChipsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Detection Method</label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {DETECTION_METHOD_OPTIONS.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
              value === option.value
                ? 'border-blue-400 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        How this compliance gap was initially discovered or identified
      </p>
    </div>
  );
};

export default DetectionMethodChips;