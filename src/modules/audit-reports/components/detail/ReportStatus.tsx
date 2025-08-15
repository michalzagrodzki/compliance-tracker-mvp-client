import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditReport } from '../../types';
import { Calendar, CheckCircle, Edit, Eye } from 'lucide-react';
import { formatDate } from '@/lib/documents';

export default function ReportStatus({ report }: { report: AuditReport }) {
  const statuses = {
    draft: { icon: Edit, label: 'Draft', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', description: 'Report is in draft status' },
    completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-600 bg-green-50 border-green-200', description: 'Report has been finalized' },
    in_review: { icon: Eye, label: 'Under Review', color: 'text-blue-600 bg-blue-50 border-blue-200', description: 'Report is being reviewed' },
    approved: { icon: CheckCircle, label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', description: 'Report has been approved' },
  } as const;

  const info = statuses[(report.report_status || 'draft') as keyof typeof statuses] || statuses.draft;
  const StatusIcon = info.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Report Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Current Status</h4>
          <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${info.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {info.label}
          </div>
          <p className="text-xs text-muted-foreground">{info.description}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Generated</h4>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDate(report.report_generated_at)}</span>
          </div>
        </div>
        {report.report_finalized_at && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Finalized</h4>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(report.report_finalized_at)}</span>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Last Modified</h4>
          <p className="text-sm text-muted-foreground">{formatDate(report.last_modified_at)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
