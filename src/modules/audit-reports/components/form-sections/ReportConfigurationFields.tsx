import React from 'react';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

interface ReportConfigurationFieldsProps {
  templateUsed: string;
  onTemplateChange: (value: string) => void;
  includeTechnicalDetails: boolean;
  onTechnicalDetailsChange: (value: boolean) => void;
  includeSourceCitations: boolean;
  onSourceCitationsChange: (value: boolean) => void;
  includeConfidenceScores: boolean;
  onConfidenceScoresChange: (value: boolean) => void;
  externalAuditorAccess: boolean;
  onExternalAuditorAccessChange: (value: boolean) => void;
}

export default function ReportConfigurationFields({
  templateUsed,
  onTemplateChange,
  includeTechnicalDetails,
  onTechnicalDetailsChange,
  includeSourceCitations,
  onSourceCitationsChange,
  includeConfidenceScores,
  onConfidenceScoresChange,
  externalAuditorAccess,
  onExternalAuditorAccessChange
}: ReportConfigurationFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="template_used" className="text-sm font-medium">Template Used</label>
        <Input
          id="template_used"
          value={templateUsed}
          onChange={(e) => onTemplateChange(e.target.value)}
          placeholder="Optional: specify template name or version"
        />
        <p className="text-xs text-muted-foreground">
          Optional template reference for report formatting
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">Content Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include_technical_details"
              checked={includeTechnicalDetails}
              onChange={(e) => onTechnicalDetailsChange(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label htmlFor="include_technical_details" className="text-sm font-medium">
              Include Technical Details
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include_source_citations"
              checked={includeSourceCitations}
              onChange={(e) => onSourceCitationsChange(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label htmlFor="include_source_citations" className="text-sm font-medium">
              Include Source Citations
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include_confidence_scores"
              checked={includeConfidenceScores}
              onChange={(e) => onConfidenceScoresChange(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label htmlFor="include_confidence_scores" className="text-sm font-medium">
              Include Confidence Scores
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t">
        <input
          type="checkbox"
          id="external_auditor_access"
          checked={externalAuditorAccess}
          onChange={(e) => onExternalAuditorAccessChange(e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
        />
        <label htmlFor="external_auditor_access" className="text-sm font-medium">
          Allow External Auditor Access
        </label>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}