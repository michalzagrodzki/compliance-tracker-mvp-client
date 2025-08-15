import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { formatRecommendationContent } from './formatting';

export default function ReportTextSection({
  title,
  icon: Icon,
  content,
}: {
  title: string;
  icon: LucideIcon;
  content: string;
}) {
  if (!content) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-md">
          <div className="prose prose-sm max-w-none">
            {formatRecommendationContent(content)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

