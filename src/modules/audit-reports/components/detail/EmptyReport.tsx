import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function EmptyReport() {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Report not found</h3>
        <p className="text-muted-foreground">The audit report you're looking for doesn't exist.</p>
      </CardContent>
    </Card>
  );
}
