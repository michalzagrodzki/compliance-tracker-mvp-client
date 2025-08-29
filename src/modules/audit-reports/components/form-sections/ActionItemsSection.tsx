import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, CheckSquare, Save } from 'lucide-react';
import { useAuditReport } from '../../hooks/useAuditReport';
import { formatRecommendationContent } from './formatting';

interface ActionItemsSectionProps {
  sessionId: string;
  reportId?: string;
  currentActionItems?: string | null;
}

export default function ActionItemsSection({
  sessionId,
  reportId,
  currentActionItems
}: ActionItemsSectionProps) {
  const {
    actionItems,
    isGeneratingActionItems,
    actionItemsError,
    generateActionItems,
    saveAndUseActionItems,
    clearActionItemsError,
  } = useAuditReport();

  const handleGenerateActionItems = async () => {
    try {
      clearActionItemsError();
      await generateActionItems(sessionId);
    } catch (error) {
      console.error('Failed to generate action items:', error);
    }
  };

  const handleSaveActionItems = async () => {
    if (!reportId || !actionItems?.action_items) return;
    
    try {
      await saveAndUseActionItems(reportId);
    } catch (error) {
      console.error('Failed to save action items:', error);
    }
  };

  const actionItemsToShow = actionItems?.action_items || currentActionItems;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5" />
          <span>Action Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionItemsError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{actionItemsError}</p>
            </div>
          </div>
        )}

        {!actionItemsToShow && !isGeneratingActionItems && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No action items generated yet</h3>
            <p className="text-sm mb-4">
              Generate specific, actionable tasks based on your compliance gaps and regulatory requirements.
            </p>
            <Button 
              onClick={handleGenerateActionItems}
              disabled={isGeneratingActionItems}
            >
              {isGeneratingActionItems ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Generate Action Items
                </>
              )}
            </Button>
          </div>
        )}

        {isGeneratingActionItems && (
          <div className="flex items-center justify-center py-8 space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Generating actionable tasks...</p>
              <p>Creating specific action items from compliance gaps and regulatory requirements.</p>
            </div>
          </div>
        )}

        {actionItemsToShow && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Action items generated successfully
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Content is always visible now */}
                {reportId && (
                  <Button
                    size="sm"
                    onClick={handleSaveActionItems}
                    disabled={!actionItems?.action_items}
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Save to Report
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateActionItems}
                  disabled={isGeneratingActionItems}
                >
                  {isGeneratingActionItems ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <CheckSquare className="mr-1 h-3 w-3" />
                  )}
                  Regenerate
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="prose prose-sm max-w-none">
                {formatRecommendationContent(actionItemsToShow)}
              </div>
            </div>

            {actionItems && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-900">{actionItems.gaps_analyzed}</div>
                  <div className="text-green-700">Gaps Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">{actionItems.regulatory_gaps}</div>
                  <div className="text-green-700">Regulatory Gaps</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">{actionItems.critical_high_risk_gaps}</div>
                  <div className="text-green-700">Critical/High Risk</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-900">
                    {new Date(actionItems.generated_at).toLocaleDateString()}
                  </div>
                  <div className="text-green-700">Generated</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}