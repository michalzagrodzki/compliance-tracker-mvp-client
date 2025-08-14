 
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface RecommendationTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  error?: string | null;
  helperText?: string;
  label?: string;
}

const RecommendationTextArea: React.FC<RecommendationTextAreaProps> = ({
  value,
  onChange,
  onGenerate,
  isGenerating,
  error,
  helperText,
  label = 'Recommendation Details',
}) => {
  const canGenerate = !!onGenerate && !isGenerating;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="recommendation_text" className="text-sm font-medium">
          {label}
        </label>
        {onGenerate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Recommendation</span>
              </>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {helperText && !onGenerate && (
        <div className="text-xs text-muted-foreground">{helperText}</div>
      )}

      <textarea
        id="recommendation_text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Detailed recommendation for addressing this gap..."
        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
};

export default RecommendationTextArea;

