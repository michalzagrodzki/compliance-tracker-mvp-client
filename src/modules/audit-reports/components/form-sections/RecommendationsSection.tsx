/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, FileText, Save, Eye } from 'lucide-react';
import { useAuditReport } from '../../hooks/useAuditReport';
import { formatRecommendationContent } from './formatting';

interface RecommendationsSectionProps {
  sessionId: string;
  reportId?: string;
  currentRecommendations?: string | null;
}

export default function RecommendationsSection({
  sessionId,
  reportId,
  currentRecommendations
}: RecommendationsSectionProps) {
  const [showPreview, setShowPreview] = useState(false);
  const {
    recommendations,
    isGeneratingRecommendations,
    recommendationsError,
    generateRecommendations,
    saveAndUseRecommendations,
    clearRecommendationsError,
  } = useAuditReport();

  const handleGenerateRecommendations = async () => {
    try {
      clearRecommendationsError();
      await generateRecommendations(sessionId);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    }
  };

  const handleSaveRecommendations = async () => {
    if (!reportId || !recommendations?.recommendations) return;
    
    try {
      await saveAndUseRecommendations(reportId);
    } catch (error) {
      console.error('Failed to save recommendations:', error);
    }
  };

  const recommendationsToShow = recommendations?.recommendations || currentRecommendations;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendationsError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{recommendationsError}</p>
            </div>
          </div>
        )}

        {!recommendationsToShow && !isGeneratingRecommendations && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No recommendations generated yet</h3>
            <p className="text-sm mb-4">
              Generate strategic recommendations based on your audit session data and identified compliance gaps.
            </p>
            <Button 
              onClick={handleGenerateRecommendations}
              disabled={isGeneratingRecommendations}
            >
              {isGeneratingRecommendations ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </>
              )}
            </Button>
          </div>
        )}

        {isGeneratingRecommendations && (
          <div className="flex items-center justify-center py-8 space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Generating strategic recommendations...</p>
              <p>Analyzing compliance gaps and audit data to create actionable recommendations.</p>
            </div>
          </div>
        )}

        {recommendationsToShow && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Recommendations generated successfully
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  {showPreview ? 'Hide' : 'Preview'}
                </Button>
                {reportId && (
                  <Button
                    size="sm"
                    onClick={handleSaveRecommendations}
                    disabled={!recommendations?.recommendations}
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Save to Report
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateRecommendations}
                  disabled={isGeneratingRecommendations}
                >
                  {isGeneratingRecommendations ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="mr-1 h-3 w-3" />
                  )}
                  Regenerate
                </Button>
              </div>
            </div>

            {showPreview && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatRecommendationContent(recommendationsToShow) }}
                />
              </div>
            )}

            {recommendations && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-900">{recommendations.gaps_analyzed}</div>
                  <div className="text-blue-700">Gaps Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-900">{recommendations.chat_sessions_analyzed}</div>
                  <div className="text-blue-700">Sessions Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-900">{recommendations.high_risk_gaps}</div>
                  <div className="text-blue-700">High Risk Gaps</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-900">
                    {new Date(recommendations.generated_at).toLocaleDateString()}
                  </div>
                  <div className="text-blue-700">Generated</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}