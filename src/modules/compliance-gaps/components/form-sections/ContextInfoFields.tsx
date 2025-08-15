/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input } from '@/components/ui/input';
import DetectionMethodChips from './DetectionMethodChips';
import SearchTermsList from './SearchTermsList';
import type { DetectionMethod } from '../../types';

interface ContextInfoFieldsProps {
  originalQuestion: string;
  expectedAnswerType?: string;
  detectionMethod?: DetectionMethod;
  searchTermsUsed?: string[];
  onChange: (field: 'original_question' | 'expected_answer_type' | 'detection_method' | 'search_terms_used', value: any) => void;
  disabled?: boolean;
  showDetectionMethod?: boolean;
  showSearchTerms?: boolean;
}

const ContextInfoFields: React.FC<ContextInfoFieldsProps> = ({
  originalQuestion,
  expectedAnswerType,
  detectionMethod,
  searchTermsUsed = [],
  onChange,
  disabled = false,
  showDetectionMethod = true,
  showSearchTerms = true,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="original_question" className="text-sm font-medium">Original Question</label>
          <Input
            id="original_question"
            value={originalQuestion}
            onChange={(e) => onChange('original_question', e.target.value)}
            placeholder="Question that led to gap discovery (optional)"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            The original question or query that revealed this gap
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="expected_answer_type" className="text-sm font-medium">Expected Answer Type</label>
          <Input
            id="expected_answer_type"
            value={expectedAnswerType || ''}
            onChange={(e) => onChange('expected_answer_type', e.target.value)}
            placeholder="e.g., policy, procedure, control, documentation"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            What type of information or documentation was expected to exist
          </p>
        </div>
      </div>

      {showDetectionMethod && detectionMethod !== undefined && (
        <DetectionMethodChips
          value={detectionMethod}
          onChange={(value) => onChange('detection_method', value)}
          disabled={disabled}
        />
      )}

      {showSearchTerms && (
        <SearchTermsList
          terms={searchTermsUsed}
          onChange={(terms) => onChange('search_terms_used', terms)}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default ContextInfoFields;

