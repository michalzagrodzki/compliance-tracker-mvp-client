import React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface ReportBasicInfoFieldsProps {
  reportTitle: string;
  onTitleChange: (value: string) => void;
  selectedComplianceDomain: string;
  onComplianceDomainChange: (domain: string) => void;
  complianceDomains: Array<{ value: string; label: string }>;
  selectedAuditSession: string;
  onAuditSessionChange: (sessionId: string) => void;
  sessions: Array<{ id: string; session_name: string }>;
  sessionId?: string;
  isLoadingSessions: boolean;
}

export default function ReportBasicInfoFields({
  reportTitle,
  onTitleChange,
  selectedComplianceDomain,
  onComplianceDomainChange,
  complianceDomains,
  selectedAuditSession,
  onAuditSessionChange,
  sessions,
  sessionId,
  isLoadingSessions
}: ReportBasicInfoFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label htmlFor="report_title" className="text-sm font-medium">Report Title *</label>
        <Input
          id="report_title"
          value={reportTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter report title..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Descriptive title for the audit report
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="compliance_domain" className="text-sm font-medium">Compliance Domain *</label>
        <select
          id="compliance_domain"
          value={selectedComplianceDomain}
          onChange={(e) => onComplianceDomainChange(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          disabled={!!sessionId}
          required
        >
          <option value="">Select a compliance framework...</option>
          {complianceDomains.map((domain) => (
            <option key={domain.value} value={domain.value}>
              {domain.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Compliance framework this report addresses
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="audit_session" className="text-sm font-medium">Audit Session *</label>
        <select
          id="audit_session"
          value={selectedAuditSession}
          onChange={(e) => onAuditSessionChange(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!!sessionId || !selectedComplianceDomain || isLoadingSessions}
          required
        >
          <option value="">
            {!selectedComplianceDomain ? 'Select compliance domain first...' : 
             isLoadingSessions ? 'Loading sessions...' : 
             'Select an audit session...'}
          </option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.session_name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {isLoadingSessions ? (
            <span className="flex items-center space-x-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading available sessions...</span>
            </span>
          ) : (
            'Audit session this report is based on'
          )}
        </p>
      </div>
    </div>
  );
}