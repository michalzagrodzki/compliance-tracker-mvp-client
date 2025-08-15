import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AuditReportsError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-center space-x-2 pt-6">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-red-700">{message}</span>
      </CardContent>
    </Card>
  );
}

