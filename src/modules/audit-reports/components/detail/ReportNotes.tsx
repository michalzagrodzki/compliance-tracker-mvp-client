import { Card, CardContent } from '@/components/ui/card';
import type { AuditReport } from '../../types';

export default function ReportNotes({ report }: { report: AuditReport }) {
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="space-y-3 text-sm">
          <h4 className="font-medium">Report Notes</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>This report was generated using automated analysis of compliance data</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Review findings with subject matter experts before making strategic decisions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              <span>Regular monitoring and follow-up assessments are recommended</span>
            </li>
            {report.confidentiality_level === 'restricted' && (
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-red-600 font-medium">This report contains sensitive information - handle according to confidentiality protocols</span>
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
