/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Info, XCircle } from 'lucide-react';
import { useAuditSessionStore } from '@/modules/audit/store/auditSessionStore';
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useComplianceGap, type ComplianceGapDirectRequest } from '../hooks/useComplianceGap';
// Using shared sections for ISO and gap type
import { extractIsoControlCode } from '@/lib/utils';
import RiskAssessmentFields from './form-sections/RiskAssessmentFields';
import RecommendationTypeChips from './form-sections/RecommendationTypeChips';
import RecommendationTextArea from './form-sections/RecommendationTextArea';
import RecommendedActionsList from './form-sections/RecommendedActionsList';
import RelatedDocumentsList from './form-sections/RelatedDocumentsList';
import ConfidenceFields from './form-sections/ConfidenceFields';
import GapTypeChips from './form-sections/GapTypeChips';
import GapCoreFields from './form-sections/GapCoreFields';
import AuditSessionSelect from './form-sections/AuditSessionSelect';
import ComplianceDomainSelect from './form-sections/ComplianceDomainSelect';
import ContextInfoFields from './form-sections/ContextInfoFields';

// options imported from ../types

const COMPLIANCE_DOMAINS = [
  { value: 'ISO27001', label: 'ISO 27001 - Information Security Management' },
]

// ISO selection handled via shared component


export default function ComplianceGapCreatePage() {
  const navigate = useNavigate();
  const { createGapDirect, isLoading, error, clearError } = useComplianceGap();
  const { sessions, isLoading: isLoadingSessions, error: sessionsError, fetchUserSessions } = useAuditSessionStore();
  const { user } = useAuthStore()
  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [success, setSuccess] = useState(false);
  // ISO selection handled within IsoControlSelector
  
  const [formData, setFormData] = useState<ComplianceGapDirectRequest>({
    user_id: user?.id || "",
    audit_session_id: '',
    compliance_domain: 'iso27001',
    gap_type: 'missing_policy',
    gap_category: '',
    gap_title: '',
    gap_description: '',
    iso_control: '',
    original_question: '',
    creation_method: 'direct',
    chat_history_id: undefined,
    pdf_ingestion_id: undefined,
    expected_answer_type: '',
    search_terms_used: [],
    similarity_threshold_used: 0.75,
    best_match_score: 0.0,
    risk_level: 'medium',
    business_impact: 'medium',
    regulatory_requirement: false,
    potential_fine_amount: 0,
    recommendation_type: undefined,
    recommendation_text: '',
    recommended_actions: [],
    related_documents: [],
    detection_method: 'manual_review',
    confidence_score: 0.80,
    false_positive_likelihood: 0.20,
    ip_address: '',
    user_agent: navigator.userAgent,
    session_context: {}
  });


  // removed ISO manual search logic
  
  useEffect(() => {
    clearError();
    
    // Fetch user's audit sessions
    if (user?.id) {
      fetchUserSessions(user.id);
    }
    
    // Get client IP (simplified for demo)
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setFormData((prev: any) => ({ ...prev, ip_address: data.ip }));
      })
      .catch(() => {
        // Fallback to placeholder
        setFormData((prev: any) => ({ ...prev, ip_address: '127.0.0.1' }));
      });
  }, [clearError, user?.id, fetchUserSessions]);

  const handleInputChange = (field: keyof ComplianceGapDirectRequest, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // selection handled via IsoControlSelector

  const handleDomainChange = (field: keyof ComplianceGapDirectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const isFormValid = () => {
    return formData.audit_session_id &&
           formData.compliance_domain &&
           formData.gap_type &&
           formData.gap_category.trim() &&
           formData.gap_title.trim() &&
           formData.gap_description.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {

      const request: ComplianceGapDirectRequest = {
        user_id: formData.user_id,
        audit_session_id: formData.audit_session_id,
        compliance_domain: formData.compliance_domain,
        gap_type: formData.gap_type,
        gap_category: formData.gap_category,
        gap_title: formData.gap_title,
        gap_description: formData.gap_description,
        iso_control: extractIsoControlCode(formData.iso_control || ""),
        original_question: formData.original_question,
        creation_method: 'direct',
        chat_history_id: formData.chat_history_id,
        pdf_ingestion_id: formData.pdf_ingestion_id,
        expected_answer_type: formData.expected_answer_type,
        search_terms_used: formData.search_terms_used,
        similarity_threshold_used: formData.similarity_threshold_used,
        best_match_score: formData.best_match_score,
        risk_level: formData.risk_level,
        business_impact: formData.business_impact,
        regulatory_requirement: formData.regulatory_requirement,
        potential_fine_amount: formData.potential_fine_amount,
        recommendation_type: formData.recommendation_type,
        recommendation_text: formData.recommendation_text,
        recommended_actions: formData.recommended_actions,
        related_documents: formData.related_documents,
        detection_method: formData.detection_method,
        confidence_score: formData.confidence_score,
        false_positive_likelihood: formData.false_positive_likelihood,
        ip_address: formData.ip_address,
        user_agent: formData.user_agent,
        session_context: formData.session_context
      };
      
      await createGapDirect(request);
      setSuccess(true);
      
      // Reset form and redirect after success
      setTimeout(() => {
        navigate('/compliance-gaps');
      }, 2000);
      
    } catch (err: any) {
      // Error is handled by the store
      console.error('Failed to create compliance gap:', err);
    }
  };

  const handleCancel = () => {
    navigate('/compliance-gaps');
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800">Compliance Gap Created Successfully!</h3>
              <p className="text-green-700 mt-2">
                The compliance gap has been recorded and is now available for tracking and resolution.
              </p>
              <p className="text-sm text-green-600 mt-1">Redirecting to compliance gaps list...</p>
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
            onClick={() => navigate('/compliance-gaps')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Compliance Gaps
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Create New Compliance Gap</h1>
        <p className="text-muted-foreground">
          Record a new compliance gap for tracking, assessment, and resolution
        </p>
      </div>

      {/* About Section */}
      <Card className="border-blue-200 bg-blue-50 p-2">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h6 className="font-medium text-blue-800">About Compliance Gap Creation</h6>
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
                <p>• Compliance gaps represent areas where your organization may not meet regulatory requirements</p>
                <p>• Each gap is assessed for risk level and business impact to prioritize remediation efforts</p>
                <p>• Gaps are linked to audit sessions and compliance domains for organized tracking</p>
                <p>• Recommendations and action items help guide the resolution process</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(error || sessionsError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error || sessionsError}</span>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core details about the compliance gap including audit context and classification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AuditSessionSelect
                value={formData.audit_session_id}
                onChange={(v) => handleInputChange('audit_session_id', v)}
                sessions={sessions as any}
                loading={isLoadingSessions}
              />

              <ComplianceDomainSelect
                value={formData.compliance_domain}
                onChange={(v) => handleDomainChange('compliance_domain', v)}
                options={COMPLIANCE_DOMAINS}
                disabled={isLoading}
              />
            </div>

            <GapTypeChips
              value={formData.gap_type}
              onChange={(v) => handleInputChange('gap_type', v)}
            />

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
          </CardContent>
        </Card>

        {/* Context Information */}
        <Card>
          <CardHeader>
            <CardTitle>Context Information</CardTitle>
            <CardDescription>
              Additional context about how this gap was identified and what was expected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContextInfoFields
              originalQuestion={formData.original_question}
              expectedAnswerType={formData.expected_answer_type}
              detectionMethod={formData.detection_method}
              searchTermsUsed={formData.search_terms_used}
              onChange={(field, value) => handleInputChange(field as any, value)}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Evaluate the risk level, business impact, and regulatory implications of this gap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RiskAssessmentFields
              riskLevel={formData.risk_level}
              businessImpact={formData.business_impact}
              regulatoryRequirement={formData.regulatory_requirement}
              potentialFineAmount={formData.potential_fine_amount}
              onChange={(field, value) => handleInputChange(field as any, value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested actions and recommendations for addressing this compliance gap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RecommendationTypeChips
              value={formData.recommendation_type}
              onChange={(v) => handleInputChange('recommendation_type', v)}
            />

            <RecommendationTextArea
              value={formData.recommendation_text}
              onChange={(v) => handleInputChange('recommendation_text', v)}
            />

            <RecommendedActionsList
              actions={formData.recommended_actions}
              onChange={(next) => handleInputChange('recommended_actions', next)}
              addPlaceholder="Add recommended action..."
            />

            <RelatedDocumentsList
              documents={formData.related_documents}
              onChange={(next) => handleInputChange('related_documents', next)}
              addPlaceholder="Add related document..."
            />
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Technical parameters, confidence scoring, and additional metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="similarity_threshold" className="text-sm font-medium">Similarity Threshold</label>
                <div className="space-y-2">
                  <input
                    id="similarity_threshold"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.similarity_threshold_used}
                    onChange={(e) => handleInputChange('similarity_threshold_used', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {(formData.similarity_threshold_used * 100).toFixed(0)}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Threshold used when searching for relevant information
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="best_match_score" className="text-sm font-medium">Best Match Score</label>
                <div className="space-y-2">
                  <input
                    id="best_match_score"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.best_match_score}
                    onChange={(e) => handleInputChange('best_match_score', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {(formData.best_match_score * 100).toFixed(0)}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Highest similarity score found during information search
                </p>
              </div>

              <ConfidenceFields
                confidenceScore={formData.confidence_score}
                falsePositiveLikelihood={formData.false_positive_likelihood}
                onChange={(field, value) => handleInputChange(field as any, value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="chat_history_id" className="text-sm font-medium">Chat History ID</label>
                <Input
                  id="chat_history_id"
                  type="number"
                  value={formData.chat_history_id || ''}
                  onChange={(e) => handleInputChange('chat_history_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Optional chat reference"
                />
                <p className="text-xs text-muted-foreground">
                  Reference to chat conversation that led to this gap (optional)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="pdf_ingestion_id" className="text-sm font-medium">PDF Ingestion ID</label>
                <Input
                  id="pdf_ingestion_id"
                  value={formData.pdf_ingestion_id || ''}
                  onChange={(e) => handleInputChange('pdf_ingestion_id', e.target.value || undefined)}
                  placeholder="Optional document reference"
                />
                <p className="text-xs text-muted-foreground">
                  Reference to document that should have contained the missing information
                </p>
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
            disabled={isLoading}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
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
        </div>
      </form>

      {/* Compliance Gap Creation Tips */}
      <Card className="bg-muted/50">
        <CardContent>
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Compliance Gap Creation Tips</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Choose the most specific gap type that matches the identified compliance issue</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Use clear, descriptive titles and detailed descriptions to help with future tracking</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Risk level and business impact assessments help prioritize remediation efforts</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Include specific, actionable recommendations to guide the resolution process</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Link to relevant documents and provide context to assist assigned team members</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Higher confidence scores indicate more certainty that this is a genuine compliance gap</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
