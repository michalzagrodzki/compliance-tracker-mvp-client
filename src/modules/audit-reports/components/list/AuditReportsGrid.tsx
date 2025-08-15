import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import type { AuditReport } from '../../types';
import AuditReportCard from './AuditReportCard';

type Props = {
  reports: AuditReport[];
  filteredReports: AuditReport[];
  onCreateFirstReport: () => void;
};

export default function AuditReportsGrid({ reports, filteredReports, onCreateFirstReport }: Props) {
  if (filteredReports.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            {reports.length === 0 ? 'No audit reports found' : 'No reports match your filters'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {reports.length === 0
              ? 'Create your first audit report from an audit session.'
              : 'Try adjusting your search criteria or filters.'}
          </p>
          {reports.length === 0 && (
            <Button onClick={onCreateFirstReport} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create First Report</span>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <AuditReportCard key={report.id} report={report} />
        ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredReports.length} of {reports.length} audit reports
      </div>
    </>
  );
}

