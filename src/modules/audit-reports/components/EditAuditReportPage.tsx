/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Save,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuditReport } from '../hooks/useAuditReport';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  type AuditReport,
  type ReportStatus,
  type AuditReportCreate,
  type DetailedFinding,
  SummaryType,
} from '../types';
import ReportSummaryFields from './form-sections/ReportSummaryFields';
import EditBasicInformationFields from './form-sections/EditBasicInformationFields';
import DataSourcesSection from './form-sections/DataSourcesSection';
import RecommendationsSection from './form-sections/RecommendationsSection';
import ActionItemsSection from './form-sections/ActionItemsSection';
import AuditTrailReferencesFields from './form-sections/AuditTrailReferencesFields';
import ChangeDescriptionField from './form-sections/ChangeDescriptionField';
import type { ComplianceGap } from '@/modules/compliance-gaps/types';

export default function EditAuditReportPage() {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuthStore();

  const {
    currentReport,
    isLoading,
    isUpdating,
    error,
    updateError,
    loadReport,
    updateReport,
    clearUpdateError,
    loadSessionData,
    generateExecutiveSummary,
    generateThreatIntelligence,
    generateRiskPrioritization,
    generateTargetAudience,
    canGenerateSummary,
    getSelectedData,
    validateSummaryGeneration,
    dataSources,
    updateSelections,
    // Executive Summary
    isGeneratingSummary,
    executiveSummary,
    summaryError,
    clearExecutiveSummary,
    clearSummaryError,
    // Threat Intelligence
    isGeneratingThreatIntelligence,
    threatIntelligence,
    threatIntelligenceError,
    clearThreatIntelligence,
    clearThreatIntelligenceError,
    // Risk Prioritization
    isGeneratingRiskPrioritization,
    riskPrioritization,
    riskPrioritizationError,
    clearRiskPrioritization,
    clearRiskPrioritizationError,
    // Target Audience
    isGeneratingTargetAudience,
    targetAudience,
    targetAudienceError,
    clearTargetAudience,
    clearTargetAudienceError,
    // Recommendations
    recommendations,
    clearRecommendations,
    clearRecommendationsError,
    // Action Items
    actionItems,
    clearActionItems,
    clearActionItemsError,
  } = useAuditReport();

  const [formData, setFormData] = useState<Partial<AuditReport>>({});
  const [changeDescription, setChangeDescription] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDataSourcesDetails, setShowDataSourcesDetails] = useState({
    chats: false,
    gaps: false,
    documents: false
  });
  const [detailedFindings, setDetailedFindings] = useState<DetailedFinding[]>([]);

  const [loadingStates, setLoadingStates] = useState({
    isLoadingReport: false,
    isLoadingSessionData: false,
    isUpdatingReport: false
  });

  useEffect(() => {
    if (reportId) {
      setLoadingStates(prev => ({ ...prev, isLoadingReport: true }));
      loadReport(reportId).finally(() => {
        setLoadingStates(prev => ({ ...prev, isLoadingReport: false }));
      });
    }
    clearUpdateError();
    clearExecutiveSummary();
    clearSummaryError();
    clearThreatIntelligence();
    clearThreatIntelligenceError();
    clearRiskPrioritization();
    clearRiskPrioritizationError();
    clearTargetAudience();
    clearTargetAudienceError();
    clearRecommendations();
    clearRecommendationsError();
    clearActionItems();
    clearActionItemsError();
  }, [reportId, loadReport, clearUpdateError, clearExecutiveSummary, clearSummaryError, clearThreatIntelligence, clearThreatIntelligenceError, clearRiskPrioritization, clearRiskPrioritizationError, clearTargetAudience, clearTargetAudienceError, clearRecommendations, clearRecommendationsError, clearActionItems, clearActionItemsError]);

  useEffect(() => {
    if (currentReport) {
      // Load session data sources for this report
      setLoadingStates(prev => ({ ...prev, isLoadingSessionData: true }));
      loadSessionData(currentReport.audit_session_id).finally(() => {
        setLoadingStates(prev => ({ ...prev, isLoadingSessionData: false }));
      });
      
      setFormData({
        report_title: currentReport.report_title,
        report_type: currentReport.report_type,
        report_status: currentReport.report_status,
        chat_history_ids: currentReport.chat_history_ids,
        compliance_gap_ids: currentReport.compliance_gap_ids,
        document_ids: currentReport.document_ids,
        pdf_ingestion_ids: currentReport.pdf_ingestion_ids,
        executive_summary: currentReport.executive_summary,
        threat_intelligence_analysis: currentReport.threat_intelligence_analysis,
        control_risk_prioritization: currentReport.control_risk_prioritization,
        target_audience_summary: currentReport.target_audience_summary,
        detailed_findings: currentReport.detailed_findings,
        recommendations: currentReport.recommendations,
        action_items: currentReport.action_items,
        appendices: currentReport.appendices,
        reviewed_by: currentReport.reviewed_by,
        approved_by: currentReport.approved_by,
        external_audit_reference: currentReport.external_audit_reference,
        regulatory_submission_date: currentReport.regulatory_submission_date,
        regulatory_response_received: currentReport.regulatory_response_received,
        scheduled_followup_date: currentReport.scheduled_followup_date,
        overall_compliance_rating: currentReport.overall_compliance_rating,
        confidentiality_level: currentReport.confidentiality_level,
        estimated_remediation_cost: currentReport.estimated_remediation_cost,
        estimated_remediation_time_days: currentReport.estimated_remediation_time_days,
        regulatory_risk_score: currentReport.regulatory_risk_score,
        potential_fine_exposure: currentReport.potential_fine_exposure,
        previous_report_id: currentReport.previous_report_id,
        improvement_from_previous: currentReport.improvement_from_previous,
        trending_direction: currentReport.trending_direction,
        benchmark_comparison: currentReport.benchmark_comparison,
      });
      
      const convertedDetailedFindings = Array.isArray(currentReport.detailed_findings) 
      ? currentReport.detailed_findings 
        : [];
      
      setDetailedFindings(convertedDetailedFindings);
      setHasChanges(false);
    }
  }, [currentReport, loadSessionData]);

  useEffect(() => {
    if (executiveSummary?.executive_summary) {
      setFormData(prev => ({
        ...prev,
        executive_summary: executiveSummary.executive_summary,
      }));
      setHasChanges(true);
    }
  }, [executiveSummary]);

  useEffect(() => {
    if (threatIntelligence?.threat_analysis) {
      setFormData(prev => ({
        ...prev,
        threat_intelligence_analysis: threatIntelligence.threat_analysis,
      }));
      setHasChanges(true);
    }
  }, [threatIntelligence]);

  useEffect(() => {
    if (riskPrioritization?.risk_prioritization_analysis) {
      setFormData(prev => ({
        ...prev,
        control_risk_prioritization: riskPrioritization.risk_prioritization_analysis,
      }));
      setHasChanges(true);
    }
  }, [riskPrioritization]);

  useEffect(() => {
    if (targetAudience?.target_audience_summary) {
      setFormData(prev => ({
        ...prev,
        target_audience_summary: targetAudience.target_audience_summary,
      }));
      setHasChanges(true);
    }
  }, [targetAudience]);

  useEffect(() => {
    if (recommendations?.recommendations) {
      setFormData(prev => ({
        ...prev,
        recommendations: recommendations.recommendations,
      }));
      setHasChanges(true);
    }
  }, [recommendations]);

  useEffect(() => {
    if (actionItems?.action_items) {
      setFormData(prev => ({
        ...prev,
        action_items: actionItems.action_items,
      }));
      setHasChanges(true);
    }
  }, [actionItems]);

  useEffect(() => {
    return () => {
      clearExecutiveSummary();
      clearSummaryError();
      clearThreatIntelligence();
      clearThreatIntelligenceError();
      clearRiskPrioritization();
      clearRiskPrioritizationError();
      clearTargetAudience();
      clearTargetAudienceError();
      clearRecommendations();
      clearRecommendationsError();
      clearActionItems();
      clearActionItemsError();
    };
  }, [clearExecutiveSummary, clearSummaryError, clearThreatIntelligence, clearThreatIntelligenceError, clearRiskPrioritization, clearRiskPrioritizationError, clearTargetAudience, clearTargetAudienceError, clearRecommendations, clearRecommendationsError, clearActionItems, clearActionItemsError]);

  const handleInputChange = (field: keyof AuditReport, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleArrayChange = (field: keyof AuditReport, newArray: any[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
    setHasChanges(true);
  };

  const prepareDataForBackend = (data: Partial<AuditReport>) => {
    const cleanedData = { ...data };
    
    cleanedData.detailed_findings = detailedFindings.map(finding => ({
      id: finding.id,
      title: finding.title || '',
      description: finding.description || '',
      severity: finding.severity || 'medium',
      category: finding.category || '',
      recommendation: finding.recommendation || '',
      source_references: finding.source_references || []
    }));
    // Recommendations and action_items are now managed by the service-based components
    
    if (!cleanedData.appendices || (typeof cleanedData.appendices === 'object' && Object.keys(cleanedData.appendices).length === 0)) {
      cleanedData.appendices = null;
    }
    
    if (!cleanedData.benchmark_comparison || (typeof cleanedData.benchmark_comparison === 'object' && Object.keys(cleanedData.benchmark_comparison).length === 0)) {
      cleanedData.benchmark_comparison = null;
    }
    
    return cleanedData;
  };

  const createReportData = (): AuditReportCreate => {
    if (!currentReport || !user) {
      throw new Error("Missing required data");
    }

    return {
      user_id: user.id,
      audit_session_id: currentReport.audit_session_id,
      compliance_domain: currentReport.compliance_domain,
      report_title: formData.report_title || currentReport.report_title,
      report_type: formData.report_type || currentReport.report_type,
      chat_history_ids: formData.chat_history_ids || currentReport.chat_history_ids,
      compliance_gap_ids: formData.compliance_gap_ids || currentReport.compliance_gap_ids,
      document_ids: formData.document_ids || currentReport.document_ids,
      pdf_ingestion_ids: formData.pdf_ingestion_ids || currentReport.pdf_ingestion_ids,
      include_technical_details: currentReport.include_technical_details,
      include_source_citations: currentReport.include_source_citations,
      include_confidence_scores: currentReport.include_confidence_scores,
      target_audience: currentReport.target_audience,
      confidentiality_level: formData.confidentiality_level || currentReport.confidentiality_level,
      external_auditor_access: currentReport.external_auditor_access,
    };
  };

  const getSelectedComplianceGaps = (): ComplianceGap[] => {
    if (!currentReport || !user) return [];

    const selectedData = getSelectedData();
    return selectedData.selectedGaps.map(gap => ({
      id: gap.id,
      user_id: user.id,
      audit_session_id: currentReport.audit_session_id,
      compliance_domain: currentReport.compliance_domain,
      gap_type: gap.gap_type,
      gap_category: gap.gap_category,
      gap_title: gap.gap_title,
      gap_description: gap.gap_description,
      original_question: "",
      risk_level: gap.risk_level as any,
      business_impact: gap.business_impact as any,
      regulatory_requirement: gap.regulatory_requirement || false,
      potential_fine_amount: gap.potential_fine_amount ?? undefined,
      status: "identified" as any,
      recommendation_type: gap.recommendation_type,
      recommendation_text: gap.recommendation_text,
      recommended_actions: gap.recommended_actions || [],
      detection_method: (gap.detection_method as any) || "manual",
      confidence_score: gap.confidence_score,
      auto_generated: true,
      false_positive_likelihood: gap.false_positive_likelihood || 0,
      detected_at: gap.detected_at || new Date().toISOString(),
      created_at: gap.detected_at || new Date().toISOString(),
      updated_at: gap.detected_at || new Date().toISOString(),
    }));
  };

  const handleGenerateExecutiveSummary = async () => {
    if (!currentReport) return;

    const validation = validateSummaryGeneration();
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    try {
      clearSummaryError();
      const reportData = createReportData();
      const selectedGaps = getSelectedComplianceGaps();
      await generateExecutiveSummary(reportData, selectedGaps, SummaryType.STANDARD);
    } catch (error) {
      console.error('Failed to generate executive summary:', error);
    }
  };

  const handleGenerateThreatIntelligence = async () => {
    if (!currentReport) return;

    const validation = validateSummaryGeneration();
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    try {
      clearThreatIntelligenceError();
      const reportData = createReportData();
      const selectedGaps = getSelectedComplianceGaps();
      await generateThreatIntelligence(reportData, selectedGaps, SummaryType.STANDARD);
    } catch (error) {
      console.error('Failed to generate threat intelligence:', error);
    }
  };

  const handleGenerateRiskPrioritization = async () => {
    if (!currentReport) return;

    const validation = validateSummaryGeneration();
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    try {
      clearRiskPrioritizationError();
      const reportData = createReportData();
      const selectedGaps = getSelectedComplianceGaps();
      await generateRiskPrioritization(reportData, selectedGaps, SummaryType.STANDARD);
    } catch (error) {
      console.error('Failed to generate risk prioritization:', error);
    }
  };

  const handleGenerateTargetAudience = async () => {
    if (!currentReport) return;

    const validation = validateSummaryGeneration();
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    try {
      clearTargetAudienceError();
      const reportData = createReportData();
      const selectedGaps = getSelectedComplianceGaps();
      await generateTargetAudience(reportData, selectedGaps, SummaryType.STANDARD);
    } catch (error) {
      console.error('Failed to generate target audience summary:', error);
    }
  };

  // Recommendations and Action Items are now handled by service-based components

  const toggleDataSourceSelection = (type: 'chat' | 'gap' | 'document', id: string | number) => {
    if (type === 'chat') {
      const isSelected = !dataSources.chatHistory.find(c => c.id === id)?.selected;
      updateSelections('chat', id, isSelected);
      const currentIds = formData.chat_history_ids || [];
      const updatedIds = currentIds.includes(id as number) 
        ? currentIds.filter(existingId => existingId !== id)
        : [...currentIds, id as number];
      handleArrayChange('chat_history_ids', updatedIds);
    } else if (type === 'gap') {
      const isSelected = !dataSources.complianceGaps.find(g => g.id === id)?.selected;
      updateSelections('gap', id, isSelected);
      const currentIds = formData.compliance_gap_ids || [];
      const updatedIds = currentIds.includes(id as string) 
        ? currentIds.filter(existingId => existingId !== id)
        : [...currentIds, id as string];
      handleArrayChange('compliance_gap_ids', updatedIds);
    } else if (type === 'document') {
      const isSelected = !dataSources.documents.find(d => d.id === id)?.selected;
      updateSelections('document', id, isSelected);
      const currentIds = formData.document_ids || [];
      const updatedIds = currentIds.includes(id as string) 
        ? currentIds.filter(existingId => existingId !== id)
        : [...currentIds, id as string];
      handleArrayChange('document_ids', updatedIds);
      handleArrayChange('pdf_ingestion_ids', updatedIds); // Keep them in sync
    }
  };

  const toggleDataSourcesDetail = (source: 'chats' | 'gaps' | 'documents') => {
    setShowDataSourcesDetails(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId || !hasChanges) return;

    try {
      setLoadingStates(prev => ({ ...prev, isUpdatingReport: true }));
      const formattedData = prepareDataForBackend(formData);

      await updateReport(reportId, formattedData, changeDescription);
      setHasChanges(false);
      setChangeDescription('');
      
      // Show success message and scroll to top
      setShowSuccessMessage(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error) {
      // Error handled by store
      console.error('Error updating report:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, isUpdatingReport: false }));
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving?'
      );
      if (!confirmed) return;
    }
    navigate(`/audit-reports/${reportId}`);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'finalized': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'distributed': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || loadingStates.isLoadingReport) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading audit report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Audit report not found</p>
              <Button onClick={() => navigate('/audit-reports')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/audit-reports/${reportId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Report
          </Button>
          
          {showSuccessMessage && (
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-sm animate-in slide-in-from-top-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Report updated successfully!</span>
            </div>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-foreground">Edit Audit Report</h1>
        <p className="text-muted-foreground">
          Update report content, status, and analysis details
        </p>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span>Report ID: {currentReport.id.slice(0, 8)}</span>
          <span>•</span>
          <span>Domain: {currentReport.compliance_domain}</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <span>Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentReport.report_status)}`}>
              {currentReport.report_status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {(error || updateError || summaryError || threatIntelligenceError || riskPrioritizationError || targetAudienceError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error || updateError || summaryError || threatIntelligenceError || riskPrioritizationError || targetAudienceError}</span>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update report title, type, status, and basic metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EditBasicInformationFields
              reportTitle={formData.report_title || ''}
              onTitleChange={(value) => handleInputChange('report_title', value)}
              reportStatus={formData.report_status || 'draft'}
              onStatusChange={(value) => handleInputChange('report_status', value)}
              reportType={formData.report_type || 'compliance_audit'}
              onReportTypeChange={(value) => handleInputChange('report_type', value)}
              overallComplianceRating={formData.overall_compliance_rating || ''}
              onComplianceRatingChange={(value) => handleInputChange('overall_compliance_rating', value)}
              regulatoryRiskScore={formData.regulatory_risk_score}
              onRegulatoryRiskScoreChange={(value) => handleInputChange('regulatory_risk_score', value)}
              estimatedRemediationCost={formData.estimated_remediation_cost}
              onRemediationCostChange={(value) => handleInputChange('estimated_remediation_cost', value)}
              estimatedRemediationTimeDays={formData.estimated_remediation_time_days}
              onRemediationTimeChange={(value) => handleInputChange('estimated_remediation_time_days', value)}
              potentialFineExposure={formData.potential_fine_exposure}
              onFineExposureChange={(value) => handleInputChange('potential_fine_exposure', value)}
              confidentialityLevel={formData.confidentiality_level || 'internal'}
              onConfidentialityChange={(value) => handleInputChange('confidentiality_level', value)}
            />
          </CardContent>
        </Card>
        
        {/* Report Summaries */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summaries</CardTitle>
            <CardDescription>
              Generate AI-powered summaries for different sections of your audit report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportSummaryFields
              executiveSummary={formData.executive_summary || ''}
              onExecutiveSummaryChange={(value) => handleInputChange('executive_summary', value)}
              onGenerateExecutiveSummary={handleGenerateExecutiveSummary}
              isGeneratingSummary={isGeneratingSummary}
              executiveSummaryData={executiveSummary}
              threatIntelligenceAnalysis={formData.threat_intelligence_analysis || ''}
              onThreatIntelligenceChange={(value) => handleInputChange('threat_intelligence_analysis', value)}
              onGenerateThreatIntelligence={handleGenerateThreatIntelligence}
              isGeneratingThreatIntelligence={isGeneratingThreatIntelligence}
              threatIntelligenceData={threatIntelligence}
              controlRiskPrioritization={formData.control_risk_prioritization || ''}
              onRiskPrioritizationChange={(value) => handleInputChange('control_risk_prioritization', value)}
              onGenerateRiskPrioritization={handleGenerateRiskPrioritization}
              isGeneratingRiskPrioritization={isGeneratingRiskPrioritization}
              riskPrioritizationData={riskPrioritization}
              targetAudienceSummary={formData.target_audience_summary || ''}
              onTargetAudienceChange={(value) => handleInputChange('target_audience_summary', value)}
              onGenerateTargetAudience={handleGenerateTargetAudience}
              isGeneratingTargetAudience={isGeneratingTargetAudience}
              targetAudienceData={targetAudience}
              currentTargetAudience={currentReport?.target_audience}
              selectedAuditSession={currentReport?.audit_session_id || ''}
              canGenerateSummary={canGenerateSummary()}
            />
          </CardContent>
        </Card>


        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Select which data sources to include in this report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DataSourcesSection
              selectedAuditSession={currentReport?.audit_session_id || ''}
              showDataSourcesDetails={showDataSourcesDetails}
              onToggleDataSourcesDetail={toggleDataSourcesDetail}
              chatHistory={dataSources.chatHistory || []}
              selectedChatIds={formData.chat_history_ids || []}
              onChatSelectionChange={(chatId, _selected) => toggleDataSourceSelection('chat', chatId)}
              isLoadingChats={false}
              complianceGaps={dataSources.complianceGaps || []}
              selectedGapIds={formData.compliance_gap_ids || []}
              onGapSelectionChange={(gapId, _selected) => toggleDataSourceSelection('gap', gapId)}
              isLoadingGaps={false}
              documents={dataSources.documents || []}
              selectedDocumentIds={formData.document_ids || []}
              onDocumentSelectionChange={(docId, _selected) => toggleDataSourceSelection('document', docId)}
              isLoadingDocuments={false}
              isLoadingSessionData={loadingStates.isLoadingSessionData}
            />
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Strategic recommendations for addressing compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RecommendationsSection
              sessionId={currentReport.audit_session_id}
              reportId={currentReport.id}
              currentRecommendations={currentReport.recommendations}
            />
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>
              Specific tasks and assignments for addressing compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActionItemsSection
              sessionId={currentReport.audit_session_id}
              reportId={currentReport.id}
              currentActionItems={currentReport.action_items}
            />
          </CardContent>
        </Card>

        {/* Audit Trail & References */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail & References</CardTitle>
            <CardDescription>
              Update external references and regulatory information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AuditTrailReferencesFields
              externalAuditReference={formData.external_audit_reference || ''}
              onExternalAuditReferenceChange={(value) => handleInputChange('external_audit_reference', value)}
              scheduledFollowupDate={formData.scheduled_followup_date}
              onScheduledFollowupDateChange={(value) => handleInputChange('scheduled_followup_date', value)}
              regulatorySubmissionDate={formData.regulatory_submission_date}
              onRegulatorySubmissionDateChange={(value) => handleInputChange('regulatory_submission_date', value)}
              regulatoryResponseReceived={formData.regulatory_response_received || false}
              onRegulatoryResponseReceivedChange={(value) => handleInputChange('regulatory_response_received', value)}
            />
          </CardContent>
        </Card>

        {/* Change Description */}
        <Card>
          <CardHeader>
            <CardTitle>Change Description</CardTitle>
            <CardDescription>
              Describe the changes being made to this report for audit trail purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangeDescriptionField
              value={changeDescription}
              onChange={setChangeDescription}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating || loadingStates.isUpdatingReport}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={isUpdating || loadingStates.isUpdatingReport || !hasChanges}
          >
            {(isUpdating || loadingStates.isUpdatingReport) ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      <Card className="bg-muted/50">
        <CardContent>
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Report Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(currentReport.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Last Modified: {new Date(currentReport.last_modified_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Confidentiality: {currentReport.confidentiality_level}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
