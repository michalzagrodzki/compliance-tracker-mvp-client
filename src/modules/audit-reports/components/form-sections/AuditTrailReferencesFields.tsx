import React from 'react';
import { Input } from '@/components/ui/input';

interface AuditTrailReferencesFieldsProps {
  externalAuditReference: string | undefined;
  onExternalAuditReferenceChange: (value: string) => void;
  scheduledFollowupDate: string | null | undefined;
  onScheduledFollowupDateChange: (value: string | null) => void;
  regulatorySubmissionDate: string | null | undefined;
  onRegulatorySubmissionDateChange: (value: string | null) => void;
  regulatoryResponseReceived: boolean;
  onRegulatoryResponseReceivedChange: (value: boolean) => void;
}

export default function AuditTrailReferencesFields({
  externalAuditReference,
  onExternalAuditReferenceChange,
  scheduledFollowupDate,
  onScheduledFollowupDateChange,
  regulatorySubmissionDate,
  onRegulatorySubmissionDateChange,
  regulatoryResponseReceived,
  onRegulatoryResponseReceivedChange
}: AuditTrailReferencesFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="external_audit_reference" className="text-sm font-medium">
            External Audit Reference
          </label>
          <Input
            id="external_audit_reference"
            value={externalAuditReference || ''}
            onChange={(e) => onExternalAuditReferenceChange(e.target.value)}
            placeholder="External audit reference number"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="scheduled_followup_date" className="text-sm font-medium">
            Scheduled Follow-up Date
          </label>
          <Input
            id="scheduled_followup_date"
            type="datetime-local"
            value={scheduledFollowupDate ? new Date(scheduledFollowupDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => onScheduledFollowupDateChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="regulatory_submission_date" className="text-sm font-medium">
          Regulatory Submission Date
        </label>
        <Input
          id="regulatory_submission_date"
          type="datetime-local"
          value={regulatorySubmissionDate ? new Date(regulatorySubmissionDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => onRegulatorySubmissionDateChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="regulatory_response_received"
          checked={regulatoryResponseReceived}
          onChange={(e) => onRegulatoryResponseReceivedChange(e.target.checked)}
          className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
        />
        <label htmlFor="regulatory_response_received" className="text-sm font-medium">
          Regulatory Response Received
        </label>
      </div>
    </div>
  );
}