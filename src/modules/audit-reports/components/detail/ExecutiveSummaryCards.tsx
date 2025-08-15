import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, BarChart3, Database, Target } from 'lucide-react';
import type { AuditReport } from '../../types';

export default function ExecutiveSummaryCards({ report, totalGaps }: { report: AuditReport; totalGaps: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalGaps}</p>
              <p className="text-sm text-muted-foreground">Total Gaps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {report.critical_gaps_count + report.high_risk_gaps_count}
              </p>
              <p className="text-sm text-muted-foreground">Critical & High Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{report.questions_answered_satisfactorily || 0}</p>
              <p className="text-sm text-muted-foreground">Satisfactory Responses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Database className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {report.document_ids.length + report.compliance_gap_ids.length}
              </p>
              <p className="text-sm text-muted-foreground">Data Sources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

