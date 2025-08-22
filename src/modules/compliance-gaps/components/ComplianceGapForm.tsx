/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import type { 
  ComplianceGapFromChatHistoryRequest,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
} from '../types';
import { useComplianceGap } from '../hooks/useComplianceGap';
import { stringToInt, extractIsoControlCode, extractWholeNumberFromId } from '@/lib/utils';
import RiskAssessmentFields from './form-sections/RiskAssessmentFields';
import RecommendationTypeChips from './form-sections/RecommendationTypeChips';
import RecommendationTextArea from './form-sections/RecommendationTextArea';
import RecommendedActionsList from './form-sections/RecommendedActionsList';
import ConfidenceFields from './form-sections/ConfidenceFields';
import GapTypeChips from './form-sections/GapTypeChips';
import GapCoreFields from './form-sections/GapCoreFields';
import { AssignmentTimelineFields } from './form-sections/AssignmentTimelineFields';

// Type definitions
export interface ComplianceGapFormData {
  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;
  iso_control: string;
  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount?: number;
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
  recommendation_type?: RecommendationType;
  recommendation_text: string;
  recommended_actions: string[];
  confidence_score: number;
  false_positive_likelihood: number;
}

// Mock service for this example
const complianceGapService = {
  analyzeMessageForGapType: (_message: string): { suggestedType: GapType; confidence: number } => ({
    suggestedType: 'missing_policy' as GapType,
    confidence: 0.8
  }),
  suggestGapCategory: (domain: string) => domain || 'General Compliance',
  extractSearchTerms: (message: string) => message.split(' ').slice(0, 5),
};

interface ComplianceGapFormProps {
  chatHistoryId: string;
  auditSessionId?: string;
  complianceDomain?: string;
  initialMessage?: string;
  sources?: string[];
  onSubmitRequest: (request: ComplianceGapFromChatHistoryRequest) => Promise<void>;
  onCancel: () => void;
}

export const ComplianceGapForm: React.FC<ComplianceGapFormProps> = ({
  chatHistoryId,
  auditSessionId,
  complianceDomain,
  initialMessage = '',
  sources = [],
  onSubmitRequest,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
      recommendationError,
      isGeneratingRecommendation,
      lastGeneratedRecommendation,
      generateRecommendation,
      clearRecommendationError
    } = useComplianceGap();

  const [formData, setFormData] = useState<ComplianceGapFormData>({
    gap_type: 'missing_policy',
    gap_category: '',
    gap_title: '',
    gap_description: '',
    iso_control: '',
    risk_level: 'medium',
    business_impact: 'medium',
    regulatory_requirement: false,
    potential_fine_amount: undefined,
    assigned_to: undefined,
    due_date: undefined,
    resolution_notes: '',
    recommendation_type: undefined,
    recommendation_text: '',
    recommended_actions: [],
    confidence_score: 0.80,
    false_positive_likelihood: 0.20
  });

  // Initialize form with smart defaults
  useEffect(() => {
    if (initialMessage) {
      const analysis = complianceGapService.analyzeMessageForGapType(initialMessage);
      const suggestedCategory = complianceGapService.suggestGapCategory(complianceDomain || '');

      setFormData(prev => ({
        ...prev,
        gap_type: analysis.suggestedType,
        gap_category: suggestedCategory,
        gap_title: `${suggestedCategory} Gap - ${new Date().toLocaleDateString()}`,
        gap_description: `Potential compliance gap identified from user query: "${initialMessage.substring(0, 200)}${initialMessage.length > 200 ? '...' : ''}"`,
        confidence_score: analysis.confidence
      }));
    }
  }, [initialMessage, complianceDomain]);

  useEffect(() => {
      if (lastGeneratedRecommendation) {
        setFormData(prev => ({
          ...prev,
          recommendation_text: lastGeneratedRecommendation.recommendation_text
        }));
      }
  }, [lastGeneratedRecommendation]);
  
  const handleInputChange = (field: keyof ComplianceGapFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateRecommendation = async () => {
    if (!chatHistoryId || !formData.recommendation_type) {
      return;
    }
    try {
      clearRecommendationError();
      await generateRecommendation("", stringToInt(chatHistoryId), formData.recommendation_type, formData.iso_control || undefined);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    }
  };
  
  const isGenerateRecommendationEnabled = () => {
    return chatHistoryId && formData.recommendation_type && !isGeneratingRecommendation;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: ComplianceGapFromChatHistoryRequest = {
        creation_method: "from_chat_history",
        chat_history_id: extractWholeNumberFromId(chatHistoryId),
        original_question: initialMessage || (formData.gap_description ?? ""),
        audit_session_id: auditSessionId,
        compliance_domain: complianceDomain,
        search_terms_used: complianceGapService.extractSearchTerms(initialMessage),
        related_documents: sources,
        gap_type: formData.gap_type,
        gap_category: formData.gap_category,
        gap_title: formData.gap_title,
        gap_description: formData.gap_description,
        risk_level: formData.risk_level,
        business_impact: formData.business_impact,
        regulatory_requirement: formData.regulatory_requirement,
        potential_fine_amount: formData.potential_fine_amount,
        recommendation_type: formData.recommendation_type,
        recommendation_text: formData.recommendation_text,
        recommended_actions: formData.recommended_actions,
        confidence_score: formData.confidence_score,
        false_positive_likelihood: formData.false_positive_likelihood,
        iso_control: extractIsoControlCode(formData.iso_control)
      };
      await onSubmitRequest(request);
    } catch (err: any) {
      setError(err.message || 'Failed to create compliance gap');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.gap_type &&
      formData.gap_category.trim() &&
      formData.gap_title.trim() &&
      formData.gap_description.trim();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 pb-20">
        <div className="space-y-6">
          <div className="space-y-6">
            <GapTypeChips
              value={formData.gap_type}
              onChange={(v) => handleInputChange('gap_type', v)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="grid gap-3">
                <label htmlFor="potential_fine_amount" className="text-sm font-medium">Potential Fine Amount</label>
                <Input
                  id="potential_fine_amount"
                  type="number"
                  value={formData.potential_fine_amount || ''}
                  onChange={(e) => handleInputChange('potential_fine_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <GapCoreFields
              showTitle
              showCategory
              showDescription
              showIsoSelector
              gapTitle={formData.gap_title}
              onTitleChange={(v) => handleInputChange('gap_title', v)}
              gapCategory={formData.gap_category}
              onCategoryChange={(v) => handleInputChange('gap_category', v)}
              gapDescription={formData.gap_description}
              onDescriptionChange={(v) => handleInputChange('gap_description', v)}
              isoControl={formData.iso_control}
              onIsoControlChange={(v) => handleInputChange('iso_control', v)}
            />
          </div>
          <RiskAssessmentFields
            riskLevel={formData.risk_level}
            businessImpact={formData.business_impact}
            regulatoryRequirement={formData.regulatory_requirement}
            potentialFineAmount={formData.potential_fine_amount || 0}
            onChange={(field, value) => handleInputChange(field as any, value)}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Assignment & Timeline</h3>
            <AssignmentTimelineFields
              assignedTo={formData.assigned_to}
              dueDate={formData.due_date}
              resolutionNotes={formData.resolution_notes}
              onChange={(field, value) => handleInputChange(field as any, value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recommendations</h3>

            <RecommendationTypeChips
              value={formData.recommendation_type}
              onChange={(v) => handleInputChange('recommendation_type', v)}
            />

            <div className="grid gap-3">
              <RecommendationTextArea
                value={formData.recommendation_text || ''}
                onChange={(v) => handleInputChange('recommendation_text', v)}
                onGenerate={isGenerateRecommendationEnabled() ? handleGenerateRecommendation : undefined}
                isGenerating={isGeneratingRecommendation}
                error={recommendationError}
                helperText={!isGenerateRecommendationEnabled() ? (
                  !chatHistoryId && !formData.recommendation_type ?
                    'Select a recommendation type and ensure this gap has related chat history to generate AI recommendations' :
                  (!chatHistoryId && formData.recommendation_type ?
                    'This gap has no related chat history for AI recommendation generation' :
                    (chatHistoryId && !formData.recommendation_type ?
                      'Select a recommendation type to generate AI recommendations' : undefined))
                ) : undefined}
              />
            </div>

            <RecommendedActionsList
              actions={formData.recommended_actions}
              onChange={(next) => handleInputChange('recommended_actions', next)}
              addPlaceholder="Add a recommended action..."
            />
          </div>

          <ConfidenceFields
            confidenceScore={formData.confidence_score}
            falsePositiveLikelihood={formData.false_positive_likelihood}
            onChange={(field, value) => handleInputChange(field as any, value)}
          />

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-6">
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Gap...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Create Compliance Gap</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
};
