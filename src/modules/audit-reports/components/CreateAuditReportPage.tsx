/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  XCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { useAuditSession } from '@/modules/audit/hooks/useAuditSession';
import { useAuthStore } from '@/modules/auth/store/authStore';
import {
  type AuditReportCreate,
  type ReportType,
  type TargetAudience,
  type ConfidentialityLevel,
  SummaryType
} from '../types';
import { useAuditReport } from '../hooks/useAuditReport';
import type { ComplianceGap } from '@/modules/compliance-gaps/types';
import ReportBasicInfoFields from './form-sections/ReportBasicInfoFields';
import ReportTypeChips from './form-sections/ReportTypeChips';
import TargetAudienceChips from './form-sections/TargetAudienceChips';
import ConfidentialityLevelChips from './form-sections/ConfidentialityLevelChips';
import ReportSummaryFields from './form-sections/ReportSummaryFields';
import ReportConfigurationFields from './form-sections/ReportConfigurationFields';

const COMPLIANCE_DOMAINS = [
  { value: 'ISO27001', label: 'ISO 27001 - Information Security Management' },
]

export default function CreateAuditReportPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const { currentSession, sessions, fetchSessionById, fetchSessionsByDomain } = useAuditSession();

  const {
    isCreating,
    error,
    createResponse,
    dataSources,
    createReport,
    generateExecutiveSummary,
    generateThreatIntelligence,
    generateRiskPrioritization,
    generateTargetAudience,
    clearError,
    clearCreateResponse,
    canGenerateSummary,
    getSelectedData,
    prepareReportData,
    validateSummaryGeneration,
    loadSessionData,
    selectAll,
    updateSelections,
    getSelectionCounts,
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
  } = useAuditReport();

  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [showDataSourcesDetails, setShowDataSourcesDetails] = useState({
    chats: false,
    gaps: false,
    documents: false
  });
  const [selectedComplianceDomain, setSelectedComplianceDomain] = useState('');
  const [selectedAuditSession, setSelectedAuditSession] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  // Separate loading states for each operation
  const [loadingStates, setLoadingStates] = useState({
    isLoadingSessionData: false,
    isCreatingReport: false
  });


  const [formData, setFormData] = useState<AuditReportCreate>({
    user_id: user?.id || "",
    audit_session_id: sessionId || "",
    compliance_domain: "",
    report_title: "",
    report_type: 'compliance_audit',
    chat_history_ids: [],
    compliance_gap_ids: [],
    document_ids: [],
    pdf_ingestion_ids: [],
    include_technical_details: false,
    include_source_citations: true,
    include_confidence_scores: false,
    target_audience: 'compliance_team',
    template_used: '',
    executive_summary: '',
    control_risk_prioritization: '',
    threat_intelligence_analysis: '',
    target_audience_summary: '',
    confidentiality_level: 'internal',
    external_auditor_access: false,
    report_status: 'draft',
    total_questions_asked: 0,
    questions_answered_satisfactorily: 0,
    total_gaps_identified: 0,
    critical_gaps_count: 0,
    high_risk_gaps_count: 0,
    medium_risk_gaps_count: 0,
    low_risk_gaps_count: 0
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  
  useEffect(() => {
    // Update form when session is loaded (for sessionId flow)
    if (currentSession && sessionId) {
      setFormData(prev => ({
        ...prev,
        compliance_domain: currentSession.compliance_domain,
        report_title: `${currentSession.session_name} - Audit Report`,
        audit_session_id: sessionId,
      }));
      setSelectedComplianceDomain(currentSession.compliance_domain);
      setSelectedAuditSession(sessionId);
    }
  }, [currentSession, sessionId]);

  useEffect(() => {
    if (executiveSummary?.executive_summary) {
      setFormData(prev => ({
        ...prev,
        executive_summary: executiveSummary.executive_summary,
      }));
    }
  }, [executiveSummary]);

  useEffect(() => {
    if (threatIntelligence?.threat_analysis) {
      setFormData(prev => ({
        ...prev,
        threat_intelligence_analysis: threatIntelligence.threat_analysis,
      }));
    }
  }, [threatIntelligence]);

  useEffect(() => {
    if (riskPrioritization?.risk_prioritization_analysis) {
      setFormData(prev => ({
        ...prev,
        control_risk_prioritization: riskPrioritization.risk_prioritization_analysis,
      }));
    }
  }, [riskPrioritization]);

  useEffect(() => {
    if (targetAudience?.target_audience_summary) {
      setFormData(prev => ({
        ...prev,
        target_audience_summary: targetAudience.target_audience_summary,
      }));
    }
  }, [targetAudience]);
  useEffect(() => {
    clearError();
    clearCreateResponse();
  
    if (sessionId) {
      fetchSessionById(sessionId);
      setLoadingStates(prev => ({ ...prev, isLoadingSessionData: true }));
      loadSessionData(sessionId).finally(() => {
        setLoadingStates(prev => ({ ...prev, isLoadingSessionData: false }));
      });
    }
  
    return () => {
      clearExecutiveSummary();
      clearSummaryError();
      clearThreatIntelligence();
      clearThreatIntelligenceError();
      clearRiskPrioritization();
      clearRiskPrioritizationError();
      clearTargetAudience();
      clearTargetAudienceError();
    };
  }, [sessionId, fetchSessionById, loadSessionData, clearError, clearCreateResponse, clearExecutiveSummary, clearSummaryError, clearThreatIntelligence, clearThreatIntelligenceError, clearRiskPrioritization, clearRiskPrioritizationError, clearTargetAudience, clearTargetAudienceError]);
  
  const handleComplianceDomainChange = async (domain: string) => {
    setSelectedComplianceDomain(domain);
    setSelectedAuditSession('');
    
    setFormData(prev => ({
      ...prev,
      compliance_domain: domain,
      audit_session_id: '',
    }));

    if (domain && !sessionId) {
      setIsLoadingSessions(true);
      try {
        await fetchSessionsByDomain(domain);
      } catch (error) {
        console.error('Failed to fetch sessions by domain:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    }
  };

  const handleAuditSessionChange = async (sessionId: string) => {
    setSelectedAuditSession(sessionId);
    
    setFormData(prev => ({
      ...prev,
      audit_session_id: sessionId,
    }));

    if (sessionId) {
      setLoadingStates(prev => ({ ...prev, isLoadingSessionData: true }));
      await fetchSessionById(sessionId);
      await loadSessionData(sessionId).finally(() => {
        setLoadingStates(prev => ({ ...prev, isLoadingSessionData: false }));
      });

      const selectedSession = sessions.find(s => s.id === sessionId);
      if (selectedSession) {
        setFormData(prev => ({
          ...prev,
          report_title: `${selectedSession.session_name} - Audit Report`,
        }));
      }
    }
  };

  const handleInputChange = (field: keyof AuditReportCreate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReportTypeChange = (reportType: ReportType) => {
    setFormData(prev => ({
      ...prev,
      report_type: reportType
    }));
  };

  const handleTargetAudienceChange = (audience: TargetAudience) => {
    setFormData(prev => ({
      ...prev,
      target_audience: audience
    }));
  };

  const handleConfidentialityChange = (level: ConfidentialityLevel) => {
    setFormData(prev => ({
      ...prev,
      confidentiality_level: level
    }));
  };

  const getSelectedComplianceGaps = (): ComplianceGap[] => {
    if (!formData || !user) return [];

    const selectedData = getSelectedData();
    return selectedData.selectedGaps.map(gap => ({
      id: gap.id,
      user_id: user.id,
      audit_session_id: formData.audit_session_id,
      compliance_domain: formData.compliance_domain,
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
    if (!selectedAuditSession) {
      return;
    }
    const validation = validateSummaryGeneration();
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }
  
    try {
      clearSummaryError();
      const reportData = prepareReportData(formData);
      const selectedGaps = getSelectedComplianceGaps();
      await generateExecutiveSummary(
        reportData,
        selectedGaps,
        SummaryType.STANDARD
      );
  
    } catch (error) {
      console.error('Failed to generate executive summary:', error);
    }
  };

  const handleGenerateThreatIntelligence = async () => {
    if (!selectedAuditSession) {
      return;
    }

    const validation = validateSummaryGeneration();
    if (!validation.isValid) {
      console.error('Validation failed:', validation.errors);
      return;
    }

    try {
      clearThreatIntelligenceError();
      const reportData = prepareReportData(formData);
      const selectedGaps = getSelectedComplianceGaps();
      await generateThreatIntelligence(reportData, selectedGaps, SummaryType.STANDARD);
    } catch (error) {
      console.error('Failed to generate threat intelligence:', error);
    }
  };

  const handleGenerateRiskPrioritization = async () => {
      if (!formData) return;
  
      const validation = validateSummaryGeneration();
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        return;
      }
  
      try {
        clearRiskPrioritizationError();
        const reportData = prepareReportData(formData);
        const selectedGaps = getSelectedComplianceGaps();
        await generateRiskPrioritization(reportData, selectedGaps, SummaryType.STANDARD);
      } catch (error) {
        console.error('Failed to generate risk prioritization:', error);
      }
    };
  
    const handleGenerateTargetAudience = async () => {
      if (!formData) return;
  
      const validation = validateSummaryGeneration();
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        return;
      }
  
      try {
        clearTargetAudienceError();
        const reportData = prepareReportData(formData);
        const selectedGaps = getSelectedComplianceGaps();
        await generateTargetAudience(reportData, selectedGaps, SummaryType.STANDARD);
      } catch (error) {
        console.error('Failed to generate target audience summary:', error);
      }
    };

  const toggleDataSourcesDetail = (source: 'chats' | 'gaps' | 'documents') => {
    setShowDataSourcesDetails(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const isFormValid = () => {
    return formData.report_title.trim() &&
           formData.compliance_domain.trim() &&
           formData.audit_session_id.trim() &&
           formData.target_audience &&
           formData.confidentiality_level;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      setLoadingStates(prev => ({ ...prev, isCreatingReport: true }));
      const reportData = prepareReportData(formData);
      await createReport(reportData);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      // Error handled by store
    } finally {
      setLoadingStates(prev => ({ ...prev, isCreatingReport: false }));
    }
  };

  const handleCancel = () => {
    if (sessionId) {
      navigate(`/audit-sessions/${sessionId}`);
    } else {
      navigate('/audit-reports');
    }
  };


  if (createResponse) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className={createResponse.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            {createResponse.success ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-red-600" />
            )}
            <div className="text-center">
              <h3 className={`text-lg font-semibold ${createResponse.success ? 'text-green-800' : 'text-red-800'}`}>
                {createResponse.success ? 'Audit Report Created Successfully!' : 'Failed to Create Audit Report'}
              </h3>
              <p className={`${createResponse.success ? 'text-green-700' : 'text-red-700'} mt-2`}>
                {createResponse.message}
              </p>
              {createResponse.success && createResponse.download_url && (
                <p className="text-sm text-green-600 mt-1">
                  Report is ready for download
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/audit-reports')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>View All Reports</span>
              </Button>
              
              {createResponse.success && createResponse.report_id && (
                <Button
                  onClick={() => navigate(`/audit-reports/${createResponse.report_id}`)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Created Report</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate(sessionId ? `/audit-sessions/${sessionId}` : '/audit-reports')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to {sessionId ? 'Session' : 'Reports'}</span>
              </Button>
              
              {!createResponse.success && (
                <Button
                  variant="outline"
                  onClick={() => {
                    clearCreateResponse();
                    clearError();
                  }}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
              )}
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
            onClick={() => navigate(sessionId ? `/audit-sessions/${sessionId}` : '/audit-reports')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {sessionId ? 'Audit Session' : 'Reports'}
          </Button>
          {showSuccessMessage && (
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-sm animate-in slide-in-from-top-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Report created successfully!</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-foreground">Create Audit Report</h1>
        <p className="text-muted-foreground">
          Generate a comprehensive audit report from your session data, compliance gaps, and chat history
        </p>
        {currentSession && (
          <p className="text-sm text-muted-foreground">
            Session: <span className="font-medium">{currentSession.session_name}</span> | 
            Domain: <span className="font-medium">{currentSession.compliance_domain}</span>
          </p>
        )}
      </div>

      <Card className="border-blue-200 bg-blue-50 p-2">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <h6 className="font-medium text-blue-800">About Audit Report Creation</h6>
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
                <p>• Select relevant chats, compliance gaps, and documents to include in your report</p>
                <p>• Choose the appropriate report type and target audience for proper formatting</p>
                <p>• Configure technical details, citations, and confidence scores based on your needs</p>
                <p>• Set the confidentiality level and external auditor access as required</p>
                <p>• Use the "Generate summary" buttons to automatically create summaries for each section</p>
                <p>• The generated report will compile all selected data into a professional format</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(error  || summaryError || threatIntelligenceError || riskPrioritizationError || targetAudienceError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error || summaryError || threatIntelligenceError || riskPrioritizationError || targetAudienceError}</span>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
            <CardDescription>
              Basic details about the audit report including title, compliance domain, and audit session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReportBasicInfoFields
              reportTitle={formData.report_title}
              onTitleChange={(value) => handleInputChange('report_title', value)}
              selectedComplianceDomain={selectedComplianceDomain}
              onComplianceDomainChange={handleComplianceDomainChange}
              complianceDomains={COMPLIANCE_DOMAINS}
              selectedAuditSession={selectedAuditSession}
              onAuditSessionChange={handleAuditSessionChange}
              sessions={sessions}
              sessionId={sessionId}
              isLoadingSessions={isLoadingSessions}
            />

            <ReportTypeChips
              value={formData.report_type}
              onChange={handleReportTypeChange}
            />

            <TargetAudienceChips
              value={formData.target_audience}
              onChange={handleTargetAudienceChange}
            />

            <ConfidentialityLevelChips
              value={formData.confidentiality_level}
              onChange={handleConfidentialityChange}
            />

            <ReportConfigurationFields
              templateUsed={formData.template_used || ''}
              onTemplateChange={(value) => handleInputChange('template_used', value)}
              includeTechnicalDetails={formData.include_technical_details}
              onTechnicalDetailsChange={(value) => handleInputChange('include_technical_details', value)}
              includeSourceCitations={formData.include_source_citations}
              onSourceCitationsChange={(value) => handleInputChange('include_source_citations', value)}
              includeConfidenceScores={formData.include_confidence_scores}
              onConfidenceScoresChange={(value) => handleInputChange('include_confidence_scores', value)}
              externalAuditorAccess={formData.external_auditor_access}
              onExternalAuditorAccessChange={(value) => handleInputChange('external_auditor_access', value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Summaries</CardTitle>
            <CardDescription>
              Generate AI-powered summaries for different sections of your audit report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              currentTargetAudience={formData.target_audience}
              selectedAuditSession={selectedAuditSession}
              canGenerateSummary={canGenerateSummary()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources Selection</CardTitle>
            <CardDescription>
              Choose which data to include in your audit report from the selected session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedAuditSession && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Select an audit session first</p>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a compliance domain and audit session to view available data sources
                </p>
              </div>
            )}

            {selectedAuditSession && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Chat History</span>
                      <span className="text-sm text-muted-foreground">
                        ({getSelectionCounts().selectedChatsCount} of {getSelectionCounts().totalChatsCount} selected)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAll('chats', true)}
                        disabled={dataSources.isLoadingChats || loadingStates.isLoadingSessionData}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAll('chats', false)}
                        disabled={dataSources.isLoadingChats || loadingStates.isLoadingSessionData}
                      >
                        Deselect All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDataSourcesDetail('chats')}
                      >
                        {showDataSourcesDetails.chats ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {(dataSources.isLoadingChats || loadingStates.isLoadingSessionData) ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading chat history...</span>
                    </div>
                  ) : dataSources.chatHistory.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No chat history found for this session
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">
                        {dataSources.chatHistory.length} chat conversations available
                      </div>
                      
                      {showDataSourcesDetails.chats && (
                        <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                          {dataSources.chatHistory.map((chat) => (
                            <div key={chat.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={chat.selected}
                                onChange={(e) => updateSelections('chat', chat.id, e.target.checked)}
                                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {chat.user_message || chat.message}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(chat.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Compliance Gaps</span>
                      <span className="text-sm text-muted-foreground">
                        ({getSelectionCounts().selectedGapsCount} of {getSelectionCounts().totalGapsCount} selected)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAll('gaps', true)}
                        disabled={dataSources.isLoadingGaps || loadingStates.isLoadingSessionData}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAll('gaps', false)}
                        disabled={dataSources.isLoadingGaps || loadingStates.isLoadingSessionData}
                      >
                        Deselect All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDataSourcesDetail('gaps')}
                      >
                        {showDataSourcesDetails.gaps ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {(dataSources.isLoadingGaps || loadingStates.isLoadingSessionData) ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading compliance gaps...</span>
                    </div>
                  ) : dataSources.complianceGaps.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No compliance gaps found for this session
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">
                        {dataSources.complianceGaps.length} compliance gaps available
                      </div>
                      
                      {showDataSourcesDetails.gaps && (
                        <div className=" overflow-y-auto space-y-3 border rounded-md p-4">
                          {dataSources.complianceGaps.map((gap) => {
                            const getRiskLevelColor = (level: string) => {
                              switch (level) {
                                case 'low': return 'text-green-600 bg-green-50 border-green-200'
                                case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
                                case 'critical': return 'text-red-600 bg-red-50 border-red-200'
                                default: return 'text-gray-600 bg-gray-50 border-gray-200'
                              }
                            };

                            const getBusinessImpactColor = (level: string) => {
                              switch (level) {
                                case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
                                case 'medium': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
                                case 'high': return 'text-purple-600 bg-purple-50 border-purple-200'
                                case 'critical': return 'text-pink-600 bg-pink-50 border-pink-200'
                                default: return 'text-gray-600 bg-gray-50 border-gray-200'
                              }
                            };

                            const getRiskIcon = (level: string) => {
                              switch (level) {
                                case 'low': return <CheckCircle className="h-3 w-3" />
                                case 'medium': return <AlertCircle className="h-3 w-3" />
                                case 'high': return <AlertTriangle className="h-3 w-3" />
                                case 'critical': return <XCircle className="h-3 w-3" />
                                default: return <AlertTriangle className="h-3 w-3" />
                              }
                            };

                            return (
                              <div key={gap.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                                <input
                                  type="checkbox"
                                  checked={gap.selected}
                                  onChange={(e) => updateSelections('gap', gap.id, e.target.checked)}
                                  className="mt-2 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                                />
                                <div className="flex-1 min-w-0 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                                        {gap.gap_title}
                                      </h4>
                                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                        {gap.gap_description}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2">
                                      {gap.regulatory_requirement && (
                                        <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                          <Shield className="h-3 w-3" />
                                          <span className="text-xs font-medium">Regulatory</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getRiskLevelColor(gap.risk_level)}`}>
                                      {getRiskIcon(gap.risk_level)}
                                      <span>{gap.risk_level.toUpperCase()} RISK</span>
                                    </div>
                                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getBusinessImpactColor(gap.business_impact)}`}>
                                      <span>{gap.business_impact.toUpperCase()} IMPACT</span>
                                    </div>
                                    <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                      {gap.gap_type.replace('_', ' ').toUpperCase()}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <FileText className="h-3 w-3 text-blue-500" />
                                      <span className="font-medium">Category:</span>
                                      <span className="truncate">{gap.gap_category}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <Download className="h-3 w-3 text-purple-500" />
                                      <span className="font-medium">Confidence:</span>
                                      <span className="font-semibold text-purple-600">
                                        {Math.round((gap.confidence_score || 0) * 100)}%
                                      </span>
                                    </div>

                                    {gap.potential_fine_amount && gap.potential_fine_amount > 0 && (
                                      <div className="flex items-center space-x-1 text-gray-600">
                                        <XCircle className="h-3 w-3 text-red-500" />
                                        <span className="font-medium">Potential Fine:</span>
                                        <span className="font-semibold text-red-600">
                                          ${gap.potential_fine_amount.toLocaleString()}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <Eye className="h-3 w-3 text-green-500" />
                                      <span className="font-medium">Detection:</span>
                                      <span>{gap.detection_method?.replace('_', ' ') || 'Manual'}</span>
                                    </div>
                                  </div>

                                  {(gap.recommendation_text || gap.recommended_actions?.length > 0) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                                      <div className="flex items-start space-x-2">
                                        <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-blue-800 mb-1">Recommended Action:</p>
                                          {gap.recommendation_text && (
                                            <p className="text-xs text-blue-700 leading-relaxed mb-1">
                                              {gap.recommendation_text}
                                            </p>
                                          )}
                                          {gap.recommended_actions?.length > 0 && (
                                            <ul className="text-xs text-blue-700 space-y-0.5">
                                              {gap.recommended_actions.slice(0, 2).map((action, index) => (
                                                <li key={index} className="flex items-start space-x-1">
                                                  <span className="text-blue-500 mt-0.5">•</span>
                                                  <span>{action}</span>
                                                </li>
                                              ))}
                                              {gap.recommended_actions.length > 2 && (
                                                <li className="text-blue-600 font-medium">
                                                  +{gap.recommended_actions.length - 2} more actions...
                                                </li>
                                              )}
                                            </ul>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                                      <span>Gap ID: {gap.id.slice(0, 8)}</span>
                                      {gap.detected_at && (
                                        <span>Detected: {new Date(gap.detected_at).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {gap.false_positive_likelihood > 0.3 && (
                                        <div className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                          Review Needed
                                        </div>
                                      )}
                                      {gap.business_impact === 'critical' || gap.risk_level === 'critical' ? (
                                        <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                          Urgent
                                        </div>
                                      ) : gap.regulatory_requirement ? (
                                        <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                          Priority
                                        </div>
                                      ) : (
                                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                          Standard
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Documents</span>
                      <span className="text-sm text-muted-foreground">
                        ({getSelectionCounts().selectedDocumentsCount} of {getSelectionCounts().totalDocumentsCount} selected)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAll('documents', true)}
                        disabled={dataSources.isLoadingDocuments || loadingStates.isLoadingSessionData}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAll('documents', false)}
                        disabled={dataSources.isLoadingDocuments || loadingStates.isLoadingSessionData}
                      >
                        Deselect All
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDataSourcesDetail('documents')}
                      >
                        {showDataSourcesDetails.documents ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {(dataSources.isLoadingDocuments || loadingStates.isLoadingSessionData) ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading documents...</span>
                    </div>
                  ) : dataSources.documents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No documents found for this session
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-muted-foreground">
                        {dataSources.documents.length} documents available
                      </div>
                      
                      {showDataSourcesDetails.documents && (
                        <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                          {dataSources.documents.map((doc) => (
                            <div key={doc.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={doc.selected}
                                onChange={(e) => updateSelections('document', doc.id, e.target.checked)}
                                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.filename}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                                  {doc.file_size && ` | Size: ${(doc.file_size / 1024 / 1024).toFixed(2)} MB`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Configure report content, confidentiality, and access settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReportConfigurationFields
              templateUsed={formData.template_used || ''}
              onTemplateChange={(value) => handleInputChange('template_used', value)}
              includeTechnicalDetails={formData.include_technical_details}
              onTechnicalDetailsChange={(value) => handleInputChange('include_technical_details', value)}
              includeSourceCitations={formData.include_source_citations}
              onSourceCitationsChange={(value) => handleInputChange('include_source_citations', value)}
              includeConfidenceScores={formData.include_confidence_scores}
              onConfidenceScoresChange={(value) => handleInputChange('include_confidence_scores', value)}
              externalAuditorAccess={formData.external_auditor_access}
              onExternalAuditorAccessChange={(value) => handleInputChange('external_auditor_access', value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isCreating || loadingStates.isCreatingReport}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={isCreating || loadingStates.isCreatingReport || !isFormValid()}
          >
            {(isCreating || loadingStates.isCreatingReport) ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Report...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Create Audit Report</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      <Card className="bg-muted/50">
        <CardContent>
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">Report Creation Tips</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Select all relevant data sources to ensure comprehensive coverage in your report</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Choose the appropriate report type based on your audit objectives and audience</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Include source citations for transparency and verification of findings</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Set the correct confidentiality level to ensure proper handling and distribution</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Use the "Generate summary" buttons to create AI-powered summaries for each section</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Technical details and confidence scores are useful for detailed compliance reviews</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
