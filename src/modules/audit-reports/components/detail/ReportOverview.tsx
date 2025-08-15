import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditReport } from '../../types';
import { Building, FileCheck, Shield as ShieldIcon, Users as UsersIcon } from 'lucide-react';

export default function ReportOverview({ report }: { report: AuditReport }) {
  const types = {
    compliance_audit: {
      label: 'Compliance Audit',
      icon: ShieldIcon,
      description: 'Comprehensive compliance assessment',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    gap_analysis: {
      label: 'Gap Analysis',
      icon: FileCheck,
      description: 'Analysis of compliance gaps',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
    },
    regulatory_review: {
      label: 'Regulatory Review',
      icon: FileCheck,
      description: 'Review of regulatory requirements',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    external_audit: {
      label: 'External Audit',
      icon: Building,
      description: 'External auditor review report',
      color: 'text-red-600 bg-red-50 border-red-200',
    },
    internal_review: {
      label: 'Internal Review',
      icon: UsersIcon,
      description: 'Internal assessment report',
      color: 'text-green-600 bg-green-50 border-green-200',
    },
  } as const;

  const audiences = {
    executives: { label: 'Executive Leadership', icon: UsersIcon },
    compliance_team: { label: 'Compliance Team', icon: ShieldIcon },
    auditors: { label: 'Auditors', icon: FileCheck },
    regulators: { label: 'Regulatory Bodies', icon: Building },
  } as const;

  const typeInfo = types[report.report_type as keyof typeof types] || types.compliance_audit;
  const audienceInfo = audiences[report.target_audience as keyof typeof audiences] || audiences.compliance_team;
  const ReportTypeIcon = typeInfo.icon;
  const AudienceIcon = audienceInfo.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ReportTypeIcon className="h-5 w-5" />
          <span>Report Overview</span>
        </CardTitle>
        <CardDescription>
          {typeInfo.description} for {report.compliance_domain}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Report Type</h4>
            <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${typeInfo.color}`}>
              <ReportTypeIcon className="h-3 w-3 mr-1" />
              {typeInfo.label}
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Compliance Domain</h4>
            <div className="flex items-center space-x-2">
              <ShieldIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{report.compliance_domain}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Target Audience</h4>
            <div className="flex items-center space-x-2">
              <AudienceIcon className="h-4 w-4 text-muted-foreground" />
              <span>{audienceInfo.label}</span>
            </div>
          </div>
        </div>
        {report.external_auditor_access && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">External Auditor Access Enabled</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
