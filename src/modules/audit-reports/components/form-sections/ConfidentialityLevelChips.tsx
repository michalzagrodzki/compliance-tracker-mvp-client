import React from 'react';
import { type ConfidentialityLevel, CONFIDENTIALITY_LEVEL_OPTIONS } from '../../types';

interface ConfidentialityLevelChipsProps {
  value: ConfidentialityLevel;
  onChange: (level: ConfidentialityLevel) => void;
}

export default function ConfidentialityLevelChips({
  value,
  onChange
}: ConfidentialityLevelChipsProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Confidentiality Level *</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {CONFIDENTIALITY_LEVEL_OPTIONS.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${
              value === option.value
                ? `border-blue-400 ${option.color}`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <div className="font-medium">{option.label}</div>
            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}