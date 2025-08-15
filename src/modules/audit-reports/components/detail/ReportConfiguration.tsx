import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditReport } from '../../types';

export default function ReportConfiguration({ report }: { report: AuditReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Report Configuration</CardTitle>
        <CardDescription>Content settings and generation options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${report.include_technical_details ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Technical Details</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${report.include_source_citations ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Source Citations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${report.include_confidence_scores ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Confidence Scores</span>
          </div>
        </div>
        {report.template_used && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Template Used</h4>
            <p className="text-sm">{report.template_used}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
