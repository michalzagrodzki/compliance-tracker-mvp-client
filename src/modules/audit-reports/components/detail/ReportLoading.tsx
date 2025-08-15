import { Loader2 } from 'lucide-react';

export default function ReportLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading audit report...</span>
      </div>
    </div>
  );
}

