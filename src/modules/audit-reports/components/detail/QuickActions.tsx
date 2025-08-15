import { Button } from '@/components/ui/button';
import { Download, Edit, Eye, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickActions({ reportId, sessionId }: { reportId: string; sessionId: string }) {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full" asChild>
        <Link to={`/audit-reports/${reportId}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Report
        </Link>
      </Button>
      <Button className="w-full" asChild>
        <Link to={`/audit-sessions/${sessionId}`}>
          <Eye className="h-4 w-4 mr-2" />
          View Audit Session
        </Link>
      </Button>
      <Button disabled variant="outline" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
      <Button disabled variant="outline" className="w-full">
        <Mail className="h-4 w-4 mr-2" />
        Email Report
      </Button>
    </div>
  );
}
