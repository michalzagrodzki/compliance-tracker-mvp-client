import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function ReportError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex items-center space-x-2 pt-6">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-destructive">{message}</span>
      </CardContent>
    </Card>
  );
}

