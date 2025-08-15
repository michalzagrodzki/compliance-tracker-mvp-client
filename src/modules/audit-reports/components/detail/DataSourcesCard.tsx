import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Database, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { AuditReport } from '../../types';

export default function DataSourcesCard({ report }: { report: AuditReport }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Documents</span>
            </div>
            <span className="text-sm font-bold">{report.document_ids.length}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Compliance Gaps</span>
            </div>
            <span className="text-sm font-bold">{report.compliance_gap_ids.length}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Chat History</span>
            </div>
            <span className="text-sm font-bold">{report.chat_history_ids.length}</span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/audit-sessions/${report.audit_session_id}`}>
            <Database className="h-4 w-4 mr-2" />
            View Source Data
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

