import React from 'react';
import { type ReportType, REPORT_TYPE_OPTIONS } from '../../types';

interface ReportTypeChipsProps {
  value: ReportType;
  onChange: (reportType: ReportType) => void;
}

export default function ReportTypeChips({
  value,
  onChange
}: ReportTypeChipsProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Report Type *</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {REPORT_TYPE_OPTIONS.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${
              value === option.value
                ? 'border-blue-400 bg-blue-50 text-blue-800'
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