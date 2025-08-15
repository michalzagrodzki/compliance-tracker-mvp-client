import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditReport } from '../../types';
import { Activity, AlertTriangle, FileText } from 'lucide-react';

export default function AssessmentMetrics({ report }: { report: AuditReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Assessment Metrics</span>
        </CardTitle>
        <CardDescription>
          Key performance indicators from the audit process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Questions Asked</h4>
            <p className="text-xl font-bold">{report.total_questions_asked}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Satisfactory Answers</h4>
            <p className="text-xl font-bold text-green-600">{report.questions_answered_satisfactorily}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Success Rate</h4>
            <p className="text-xl font-bold">
              {report.total_questions_asked > 0
                ? Math.round((report.questions_answered_satisfactorily / report.total_questions_asked) * 100)
                : 0}%
            </p>
          </div>
        </div>
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Documents Analyzed</h4>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{report.document_ids.length} documents</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Compliance Gaps</h4>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>{report.compliance_gap_ids.length} gaps identified</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
