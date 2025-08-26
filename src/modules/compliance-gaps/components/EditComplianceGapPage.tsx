/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

import type {
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  ComplianceGapUpdate,
} from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Info, XCircle, Save, Loader2 } from 'lucide-react';
import { safeReplaceUnderscore } from '@/lib/utils';
import { useComplianceGap } from '../hooks/useComplianceGap';
import Loading from '@/components/Loading';
import RiskAssessmentFields from './form-sections/RiskAssessmentFields';
import RecommendationTypeChips from './form-sections/RecommendationTypeChips';
import RecommendationTextArea from './form-sections/RecommendationTextArea';
import RecommendedActionsList from './form-sections/RecommendedActionsList';
import RelatedDocumentsList from './form-sections/RelatedDocumentsList';
import ConfidenceFields from './form-sections/ConfidenceFields';
import GapCoreFields from './form-sections/GapCoreFields';
import FormHeader from '@/components/shared/FormHeader';

export default function EditComplianceGapPage() {
  const navigate = useNavigate();
  const { gapId } = useParams<{ gapId: string }>();
  const { 
    currentGap, 
    isLoading, 
    error, 
    loadGapById, 
    updateGap, 
    recommendationError,
    clearError,
    isGeneratingRecommendation,
    lastGeneratedRecommendation,
    generateRecommendation,
    clearRecommendationError
  } = useComplianceGap();

  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ComplianceGapUpdate>({
    gap_title: '',
    gap_description: '',
    iso_control: '',
    risk_level: 'medium',
    business_impact: 'medium',
    regulatory_requirement: false,
    potential_fine_amount: 0,
    assigned_to: undefined,
    due_date: undefined,
    resolution_notes: '',
    recommendation_type: undefined,
    recommendation_text: '',
    recommended_actions: [],
    related_documents: [],
    confidence_score: 0.80,
    false_positive_likelihood: 0.20,
    session_context: {}
  });

  useEffect(() => {
    if (gapId) {
      clearError();
      loadGapById(gapId);
    }
  }, [gapId, loadGapById, clearError]);

  useEffect(() => {
    if (currentGap) {
      setFormData({
        gap_title: currentGap.gap_title,
        gap_description: currentGap.gap_description,
        risk_level: currentGap.risk_level,
        business_impact: currentGap.business_impact,
        regulatory_requirement: currentGap.regulatory_requirement,
        potential_fine_amount: currentGap.potential_fine_amount || 0,
        assigned_to: currentGap.assigned_to || undefined,
        due_date: currentGap.due_date || undefined,
        resolution_notes: currentGap.resolution_notes || '',
        recommendation_type: currentGap.recommendation_type as RecommendationType || undefined,
        recommendation_text: currentGap.recommendation_text || '',
        recommended_actions: currentGap.recommended_actions || [],
        related_documents: currentGap.related_documents || [],
        confidence_score: currentGap.confidence_score || 0.80,
        false_positive_likelihood: currentGap.false_positive_likelihood || 0.20,
        session_context: currentGap.session_context || {},
        iso_control: currentGap.iso_control || ''
      });
    }
  }, [currentGap]);

  useEffect(() => {
    if (lastGeneratedRecommendation) {
      setFormData(prev => ({
        ...prev,
        recommendation_text: lastGeneratedRecommendation.recommendation_text
      }));
    }
  }, [lastGeneratedRecommendation]);

  const handleInputChange = (field: keyof ComplianceGapUpdate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateRecommendation = async () => {
    if (!currentGap?.chat_history_id || !formData.recommendation_type) {
      return;
    }
    try {
      clearRecommendationError();
      await generateRecommendation(currentGap.id, currentGap.chat_history_id, formData.recommendation_type, formData.iso_control || undefined);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    }
  };
  
  const isGenerateRecommendationEnabled = () => {
    return currentGap?.chat_history_id && formData.recommendation_type && !isGeneratingRecommendation;
  };

  const isFormValid = () => {
    return formData.gap_title?.trim() && formData.gap_description?.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !currentGap) return;

    setIsSubmitting(true);
    try {
      await updateGap(currentGap.id, formData);
      setSuccess(true);
      
      // Reset form and redirect after success
      setTimeout(() => {
        navigate(`/compliance-gaps/${currentGap.id}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Failed to update compliance gap:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/compliance-gaps/${gapId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentGap) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Compliance gap not found</h3>
            <p className="text-muted-foreground">The compliance gap you're trying to edit doesn't exist.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/compliance-gaps')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Compliance Gaps
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800">Compliance Gap Updated Successfully!</h3>
              <p className="text-green-700 mt-2">
                The compliance gap has been updated with your changes.
              </p>
              <p className="text-sm text-green-600 mt-1">Redirecting to gap details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/compliance-gaps/${gapId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Gap Details
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Edit Compliance Gap</h1>
        <p className="text-muted-foreground">
          Update the details and assessment of this compliance gap
        </p>
      </div>

      {/* About Section */}
      <Card className="border-blue-200 bg-blue-50 p-2">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h6 className="font-medium text-blue-800">About Editing Compliance Gaps</h6>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAboutInfo(!showAboutInfo)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              {showAboutInfo ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>
          
          {showAboutInfo && (
            <div className="mt-4 pl-8 space-y-2">
              <div className="text-sm text-blue-700 space-y-1">
                <p>• You can update most fields of the compliance gap to reflect new information or assessments</p>
                <p>• Changes to risk level and business impact will affect prioritization in the gap list</p>
                <p>• Updated recommendations and action items help guide the resolution process</p>
                <p>• All changes are tracked and timestamped for audit purposes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <FormHeader
            title="Basic Information"
            description="Core details about the compliance gap including title, description and classification"
          />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="gap_title" className="text-sm font-medium">Gap Title *</label>
                <Input
                  id="gap_title"
                  value={formData.gap_title || ''}
                  onChange={(e) => handleInputChange('gap_title', e.target.value)}
                  placeholder="Brief, descriptive title for the gap"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Clear, concise title that summarizes the compliance gap
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Gap Type</label>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded border">
                  <span className="text-sm font-medium capitalize">
                    {safeReplaceUnderscore(currentGap.gap_type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (Gap type cannot be changed)
                  </span>
                </div>
              </div>
            </div>

            <GapCoreFields
              showTitle={false}
              showCategory={false}
              showDescription
              showIsoSelector
              gapDescription={formData.gap_description || ''}
              onDescriptionChange={(v) => handleInputChange('gap_description', v)}
              isoControl={formData.iso_control || ''}
              onIsoControlChange={(v) => handleInputChange('iso_control', v)}
            />
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <FormHeader
            title="Risk Assessment"
            description="Update the risk level, business impact, and regulatory implications of this gap"
          />
          <CardContent className="space-y-6">
            <RiskAssessmentFields
              riskLevel={formData.risk_level as RiskLevel}
              businessImpact={formData.business_impact as BusinessImpactLevel}
              regulatoryRequirement={formData.regulatory_requirement || false}
              potentialFineAmount={formData.potential_fine_amount || 0}
              onChange={(field, value) => handleInputChange(field as any, value)}
            />
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <FormHeader
            title="Assignment & Timeline"
            description="Update assignment and due date information"
          />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="assigned_to" className="text-sm font-medium">Assigned To</label>
                <Input
                  id="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value || undefined)}
                  placeholder="User ID or email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date || ''}
                  onChange={(e) => handleInputChange('due_date', e.target.value || undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="resolution_notes" className="text-sm font-medium">Resolution Notes</label>
              <textarea
                id="resolution_notes"
                value={formData.resolution_notes || ''}
                onChange={(e) => handleInputChange('resolution_notes', e.target.value)}
                placeholder="Notes about resolution progress or issues..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <FormHeader
            title="Recommendations"
            description="Update suggested actions and recommendations for addressing this compliance gap"
          />
          <CardContent className="space-y-6">
            <RecommendationTypeChips
              value={formData.recommendation_type as RecommendationType}
              onChange={(v) => handleInputChange('recommendation_type', v)}
            />

            <RecommendationTextArea
              value={formData.recommendation_text || ''}
              onChange={(v) => handleInputChange('recommendation_text', v)}
              onGenerate={isGenerateRecommendationEnabled() ? handleGenerateRecommendation : undefined}
              isGenerating={isGeneratingRecommendation}
              error={recommendationError}
              helperText={!isGenerateRecommendationEnabled() ? (
                !currentGap?.chat_history_id && !formData.recommendation_type ?
                  'Select a recommendation type and ensure this gap has related chat history to generate AI recommendations' :
                (!currentGap?.chat_history_id && formData.recommendation_type ?
                  'This gap has no related chat history for AI recommendation generation' :
                  (currentGap?.chat_history_id && !formData.recommendation_type ?
                    'Select a recommendation type to generate AI recommendations' : undefined))
              ) : undefined}
            />

            <RecommendedActionsList
              actions={formData.recommended_actions || []}
              onChange={(next) => handleInputChange('recommended_actions', next)}
              addPlaceholder="Add recommended action..."
            />

            <RelatedDocumentsList
              documents={formData.related_documents || []}
              onChange={(next) => handleInputChange('related_documents', next)}
              addPlaceholder="Add related document..."
            />
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <FormHeader
            title="Advanced Settings"
            description="Update confidence scoring and additional metadata"
          />
          <CardContent className="space-y-6">
            <ConfidenceFields
              confidenceScore={formData.confidence_score || 0}
              falsePositiveLikelihood={formData.false_positive_likelihood || 0}
              onChange={(field, value) => handleInputChange(field as any, value)}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-center space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Gap...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Update Compliance Gap</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Update Tips */}
      <Card className="bg-muted/50">
        <CardContent>
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Update Tips</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Changes to risk level and business impact affect gap prioritization</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Updated recommendations help guide team members working on resolution</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Assignment changes notify the assigned user and update tracking</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>All changes are logged with timestamps for audit trail purposes</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
