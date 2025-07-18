/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  ComplianceGapUpdate
} from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Info, Plus, X, XCircle, Save, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useComplianceGap } from '../hooks/useComplianceGap';
import Loading from '@/components/Loading';

const RISK_LEVEL_OPTIONS: Array<{
  value: RiskLevel;
  label: string;
  color: string;
}> = [
  { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Risk', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical Risk', color: 'bg-red-100 text-red-800' }
];

const BUSINESS_IMPACT_OPTIONS: Array<{
  value: BusinessImpactLevel;
  label: string;
}> = [
  { value: 'low', label: 'Low Impact' },
  { value: 'medium', label: 'Medium Impact' },
  { value: 'high', label: 'High Impact' },
  { value: 'critical', label: 'Critical Impact' }
];

const RECOMMENDATION_TYPE_OPTIONS: Array<{
  value: RecommendationType;
  label: string;
}> = [
  { value: 'create_policy', label: 'Create New Policy' },
  { value: 'update_policy', label: 'Update Existing Policy' },
  { value: 'upload_document', label: 'Upload Documentation' },
  { value: 'training_needed', label: 'Training Required' },
  { value: 'process_improvement', label: 'Process Improvement' },
  { value: 'system_configuration', label: 'System Configuration' }
];

export default function EditComplianceGapPage() {
  const navigate = useNavigate();
  const { gapId } = useParams<{ gapId: string }>();
  const { 
    currentGap, 
    isLoading, 
    error, 
    loadGap, 
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

  const [newAction, setNewAction] = useState('');
  const [newDocument, setNewDocument] = useState('');

  useEffect(() => {
    if (gapId) {
      clearError();
      loadGap(gapId, false);
    }
  }, [gapId, loadGap, clearError]);

  useEffect(() => {
    if (currentGap) {
      // Populate form with current gap data
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
        session_context: currentGap.session_context || {}
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

  const handleAddToArray = (field: 'recommended_actions' | 'related_documents', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const handleRemoveFromArray = (field: 'recommended_actions' | 'related_documents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const handleGenerateRecommendation = async () => {
    if (!currentGap?.chat_history_id || !formData.recommendation_type) {
      return;
    }
    try {
      clearRecommendationError();
      await generateRecommendation(currentGap.chat_history_id, formData.recommendation_type);
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
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about the compliance gap including title, description and classification
            </CardDescription>
          </CardHeader>
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
                    {currentGap.gap_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (Gap type cannot be changed)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="gap_description" className="text-sm font-medium">Gap Description *</label>
              <textarea
                id="gap_description"
                value={formData.gap_description || ''}
                onChange={(e) => handleInputChange('gap_description', e.target.value)}
                placeholder="Detailed description of the compliance gap..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
              <p className="text-xs text-muted-foreground">
                Detailed explanation of what is missing or inadequate in current compliance posture
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Update the risk level, business impact, and regulatory implications of this gap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Risk Level *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {RISK_LEVEL_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('risk_level', option.value)}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.risk_level === option.value
                        ? `border-blue-400 ${option.color}`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Business Impact *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BUSINESS_IMPACT_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('business_impact', option.value)}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.business_impact === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="regulatory_requirement"
                  checked={formData.regulatory_requirement || false}
                  onChange={(e) => handleInputChange('regulatory_requirement', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                />
                <label htmlFor="regulatory_requirement" className="text-sm font-medium">
                  This is a regulatory requirement
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="potential_fine_amount" className="text-sm font-medium">Potential Fine Amount</label>
                <Input
                  id="potential_fine_amount"
                  type="number"
                  value={formData.potential_fine_amount || 0}
                  onChange={(e) => handleInputChange('potential_fine_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment & Timeline</CardTitle>
            <CardDescription>
              Update assignment and due date information
            </CardDescription>
          </CardHeader>
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

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Update suggested actions and recommendations for addressing this compliance gap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">Recommendation Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {RECOMMENDATION_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('recommendation_type', 
                      formData.recommendation_type === option.value ? undefined : option.value
                    )}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.recommendation_type === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="recommendation_text" className="text-sm font-medium">
                  Recommendation Details
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateRecommendation}
                  disabled={!isGenerateRecommendationEnabled()}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingRecommendation ? (
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
              </div>
              
              {recommendationError && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{recommendationError}</span>
                </div>
              )}

              {!isGenerateRecommendationEnabled() && (
                <div className="text-xs text-muted-foreground">
                  {!currentGap?.chat_history_id && !formData.recommendation_type && 
                    "Select a recommendation type and ensure this gap has related chat history to generate AI recommendations"}
                  {!currentGap?.chat_history_id && formData.recommendation_type && 
                    "This gap has no related chat history for AI recommendation generation"}
                  {currentGap?.chat_history_id && !formData.recommendation_type && 
                    "Select a recommendation type to generate AI recommendations"}
                </div>
              )}

              <textarea
                id="recommendation_text"
                value={formData.recommendation_text || ''}
                onChange={(e) => handleInputChange('recommendation_text', e.target.value)}
                placeholder="Detailed recommendation for addressing this gap..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Recommended Actions</label>
              <div className="space-y-2">
                {(formData.recommended_actions || []).map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input value={action} readOnly className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromArray('recommended_actions', index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Add recommended action..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('recommended_actions', newAction), setNewAction(''))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {handleAddToArray('recommended_actions', newAction); setNewAction('');}}
                    disabled={!newAction.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Related Documents</label>
              <div className="space-y-2">
                {(formData.related_documents || []).map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input value={doc} readOnly className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromArray('related_documents', index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    placeholder="Add related document..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('related_documents', newDocument), setNewDocument(''))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {handleAddToArray('related_documents', newDocument); setNewDocument('');}}
                    disabled={!newDocument.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Update confidence scoring and additional metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="confidence_score" className="text-sm font-medium">Confidence Score</label>
                <div className="space-y-2">
                  <input
                    id="confidence_score"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.confidence_score || 0}
                    onChange={(e) => handleInputChange('confidence_score', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round((formData.confidence_score || 0) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="false_positive_likelihood" className="text-sm font-medium">False Positive Likelihood</label>
                <div className="space-y-2">
                  <input
                    id="false_positive_likelihood"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.false_positive_likelihood || 0}
                    onChange={(e) => handleInputChange('false_positive_likelihood', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round((formData.false_positive_likelihood || 0) * 100)}%
                  </div>
                </div>
              </div>
            </div>
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