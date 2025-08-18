import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, User, Shield, CheckCircle, AlertCircle, Files } from 'lucide-react';
import type { AuditReport, ReportType, TargetAudience, ConfidentialityLevel } from '../../types';
import { REPORT_TYPE_OPTIONS, TARGET_AUDIENCE_OPTIONS, CONFIDENTIALITY_LEVEL_OPTIONS } from '../../types';
import { formatDate } from '@/lib/documents';

function getReportTypeInfo(reportType: ReportType) {
  return (
    REPORT_TYPE_OPTIONS.find((option) => option.value === reportType) || {
      value: reportType,
      label: reportType,
      description: '',
    }
  );
}

function getTargetAudienceInfo(audience: TargetAudience) {
  return (
    TARGET_AUDIENCE_OPTIONS.find((option) => option.value === audience) || {
      value: audience,
      label: audience,
      description: '',
    }
  );
}

function getConfidentialityInfo(level: ConfidentialityLevel) {
  return (
    CONFIDENTIALITY_LEVEL_OPTIONS.find((option) => option.value === level) || {
      value: level,
      label: level,
      description: '',
      color: 'bg-gray-100 text-gray-800',
    }
  );
}

export default function AuditReportCard({ report }: { report: AuditReport }) {
  const reportTypeInfo = getReportTypeInfo(report.report_type);
  const audienceInfo = getTargetAudienceInfo(report.target_audience);
  const confidentialityInfo = getConfidentialityInfo(report.confidentiality_level);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{report.report_title}</CardTitle>
            <CardDescription>
              {report.compliance_domain} • {reportTypeInfo.label}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 ml-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidentialityInfo.color}`}>
              {confidentialityInfo.label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              report.report_status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              report.report_status === 'finalized' ? 'bg-green-100 text-green-800' :
              report.report_status === 'approved' ? 'bg-blue-100 text-blue-800' :
              report.report_status === 'distributed' ? 'bg-purple-100 text-purple-800' :
              report.report_status === 'archived' ? 'bg-gray-100 text-gray-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {report.report_status.charAt(0).toUpperCase() + report.report_status.slice(1).replace('_', ' ')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Audience:</span>
            <span>{audienceInfo.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Report type:</span>
            <span>{reportTypeInfo.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Compliance Gaps:</span>
            <span className="font-medium">{report.compliance_gap_ids?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Files className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Documents:</span>
            <span className="font-medium">{report.pdf_ingestion_ids?.length || 0}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">External Access:</span>
          {report.external_auditor_access ? (
            <span className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Enabled</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Disabled</span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Includes:</span>
          <div className="flex flex-wrap gap-1">
            {report.include_source_citations && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Citations</span>
            )}
            {report.include_technical_details && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">Technical</span>
            )}
            {report.include_confidence_scores && (
              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Confidence</span>
            )}
          </div>
        </div>

        {report.template_used && (
          <div className="text-sm text-muted-foreground">Template: {report.template_used}</div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">Report ID: {report.id.slice(0, 8)}...</div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild className="flex items-center space-x-1">
              <Link to={`/audit-reports/${report.id}`}>
                <Eye className="h-3 w-3" />
                <span>View</span>
              </Link>
            </Button>
            {report.download_url && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => window.open(report.download_url!, '_blank')}
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

