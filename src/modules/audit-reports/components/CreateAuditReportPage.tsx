/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Sparkles,
} from 'lucide-react';
import { useAuditSessionStore } from '@/modules/audit/store/auditSessionStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useAuditReportStore, auditReportStoreUtils } from '../store/auditReportStore';
import {
  type AuditReportCreate,
  type ReportType,
  type TargetAudience,
  type ConfidentialityLevel,
  REPORT_TYPE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  CONFIDENTIALITY_LEVEL_OPTIONS,
} from '../types';

const COMPLIANCE_DOMAINS = [
  { value: 'ISO27001', label: 'ISO 27001 - Information Security Management' },
]

export default function CreateAuditReportPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const { currentSession, sessions, fetchSessionById, fetchSessionsByDomain } = useAuditSessionStore();
  const {
    isCreating,
    error,
    createResponse,
    dataSources,
    isGeneratingSummary,
    loadSessionDataSources,
    updateChatSelection,
    updateGapSelection,
    updateDocumentSelection,
    selectAllChats,
    selectAllGaps,
    selectAllDocuments,
    createReport,
    clearError,
    clearCreateResponse,
    clearDataSources
  } = useAuditReportStore();

  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [showDataSourcesDetails, setShowDataSourcesDetails] = useState({
    chats: false,
    gaps: false,
    documents: false
  });
  const [selectedComplianceDomain, setSelectedComplianceDomain] = useState('');
  const [selectedAuditSession, setSelectedAuditSession] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);


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

  useEffect(() => {
    clearError();
    clearCreateResponse();

    if (sessionId) {
      // Load session details
      fetchSessionById(sessionId);
      // Load all data sources for the session
      loadSessionDataSources(sessionId);
    }

    return () => {
      clearDataSources();
    };
  }, [sessionId, fetchSessionById, loadSessionDataSources, clearError, clearCreateResponse, clearDataSources]);

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

  const handleComplianceDomainChange = async (domain: string) => {
    setSelectedComplianceDomain(domain);
    setSelectedAuditSession(''); // Reset audit session selection
    
    setFormData(prev => ({
      ...prev,
      compliance_domain: domain,
      audit_session_id: '', // Reset audit session in form data
    }));

    if (domain && !sessionId) {
      // Only fetch sessions if not in sessionId flow
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
      // Load session details and data sources
      await fetchSessionById(sessionId);
      await loadSessionDataSources(sessionId);
      
      // Find the session and update report title
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

  const handleGenerateSummary = async (summaryType: 'executive_summary' | 'control_risk_prioritization' | 'threat_intelligence_analysis' | 'target_audience_summary') => {
    if (!selectedAuditSession) {
      return;
    }

    console.log("generate summary by type " + summaryType)
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

  const prepareReportData = (): AuditReportCreate => {
    const selectedData = auditReportStoreUtils.getSelectedData();
    
    return {
      ...formData,
      chat_history_ids: selectedData.selectedChats.map(chat => {
        const id = typeof chat.id === 'string' ? parseInt(chat.id, 10) : chat.id;
        return isNaN(id) ? 0 : id;
      }),
      compliance_gap_ids: selectedData.selectedGaps.map(gap => gap.id),
      document_ids: selectedData.selectedDocuments.map(doc => doc.id),
      pdf_ingestion_ids: selectedData.selectedDocuments.map(doc => doc.id), // Same as document_ids for now
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const reportData = prepareReportData();
    await createReport(reportData);
  };

  const handleCancel = () => {
    if (sessionId) {
      navigate(`/audit-sessions/${sessionId}`);
    } else {
      navigate('/audit-reports');
    }
  };

  const getSelectionCounts = () => auditReportStoreUtils.getSelectionCounts();

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

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="report_title" className="text-sm font-medium">Report Title *</label>
                <Input
                  id="report_title"
                  value={formData.report_title}
                  onChange={(e) => handleInputChange('report_title', e.target.value)}
                  placeholder="Enter report title..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Descriptive title for the audit report
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="compliance_domain" className="text-sm font-medium">Compliance Domain *</label>
                <select
                  id="compliance_domain"
                  value={selectedComplianceDomain}
                  onChange={(e) => handleComplianceDomainChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  disabled={!!sessionId}
                  required
                >
                  <option value="">Select a compliance framework...</option>
                  {COMPLIANCE_DOMAINS.map((domain) => (
                    <option key={domain.value} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Compliance framework this report addresses
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="audit_session" className="text-sm font-medium">Audit Session *</label>
                <select
                  id="audit_session"
                  value={selectedAuditSession}
                  onChange={(e) => handleAuditSessionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!!sessionId || !selectedComplianceDomain || isLoadingSessions}
                  required
                >
                  <option value="">
                    {!selectedComplianceDomain ? 'Select compliance domain first...' : 
                     isLoadingSessions ? 'Loading sessions...' : 
                     'Select an audit session...'}
                  </option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.session_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {isLoadingSessions ? (
                    <span className="flex items-center space-x-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Loading available sessions...</span>
                    </span>
                  ) : (
                    'Audit session this report is based on'
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Report Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {REPORT_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleReportTypeChange(option.value)}
                    className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.report_type === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Target Audience *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {TARGET_AUDIENCE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTargetAudienceChange(option.value)}
                    className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.target_audience === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Confidentiality Level *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {CONFIDENTIALITY_LEVEL_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleConfidentialityChange(option.value)}
                    className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.confidentiality_level === option.value
                        ? `border-blue-400 ${option.color}`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="template_used" className="text-sm font-medium">Template Used</label>
              <Input
                id="template_used"
                value={formData.template_used || ''}
                onChange={(e) => handleInputChange('template_used', e.target.value)}
                placeholder="Optional: specify template name or version"
              />
              <p className="text-xs text-muted-foreground">
                Optional template reference for report formatting
              </p>
            </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="executive_summary" className="text-sm font-medium">Executive Summary</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary('executive_summary')}
                  disabled={!selectedAuditSession || isGeneratingSummary}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generate summary</span>
                </Button>
              </div>
              <textarea
                id="executive_summary"
                value={formData.executive_summary || ''}
                onChange={(e) => handleInputChange('executive_summary', e.target.value)}
                placeholder="Executive summary of the audit findings and recommendations..."
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y"
              />
              <p className="text-xs text-muted-foreground">
                High-level overview of audit findings for executive stakeholders
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="control_risk_prioritization" className="text-sm font-medium">Control Risk Prioritization</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary('control_risk_prioritization')}
                  disabled={!selectedAuditSession || isGeneratingSummary}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generate summary</span>
                </Button>
              </div>
              <textarea
                id="control_risk_prioritization"
                value={formData.control_risk_prioritization || ''}
                onChange={(e) => handleInputChange('control_risk_prioritization', e.target.value)}
                placeholder="Control risk prioritization analysis and recommendations..."
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Prioritization of control risks based on impact and likelihood
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="threat_intelligence_analysis" className="text-sm font-medium">Threat Intelligence Analysis</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary('threat_intelligence_analysis')}
                  disabled={!selectedAuditSession || isGeneratingSummary}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generate summary</span>
                </Button>
              </div>
              <textarea
                id="threat_intelligence_analysis"
                value={formData.threat_intelligence_analysis || ''}
                onChange={(e) => handleInputChange('threat_intelligence_analysis', e.target.value)}
                placeholder="Threat intelligence analysis and current threat landscape..."
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Analysis of current threats and their relevance to the organization
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="target_audience_summary" className="text-sm font-medium">Target Audience Summary</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateSummary('target_audience_summary')}
                  disabled={!selectedAuditSession || isGeneratingSummary}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Generate summary</span>
                </Button>
              </div>
              <textarea
                id="target_audience_summary"
                value={formData.target_audience_summary || ''}
                onChange={(e) => handleInputChange('target_audience_summary', e.target.value)}
                placeholder="Summary tailored to the specific target audience..."
                rows={4}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Summary specifically tailored to the selected target audience
              </p>
            </div>

            {!selectedAuditSession && (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Select an audit session to enable summary generation
                </p>
              </div>
            )}
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
                        onClick={() => selectAllChats(true)}
                        disabled={dataSources.isLoadingChats}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllChats(false)}
                        disabled={dataSources.isLoadingChats}
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

                  {dataSources.isLoadingChats ? (
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
                                onChange={(e) => updateChatSelection(chat.id, e.target.checked)}
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
                        onClick={() => selectAllGaps(true)}
                        disabled={dataSources.isLoadingGaps}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllGaps(false)}
                        disabled={dataSources.isLoadingGaps}
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

                  {dataSources.isLoadingGaps ? (
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
                                  onChange={(e) => updateGapSelection(gap.id, e.target.checked)}
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
                        onClick={() => selectAllDocuments(true)}
                        disabled={dataSources.isLoadingDocuments}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllDocuments(false)}
                        disabled={dataSources.isLoadingDocuments}
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

                  {dataSources.isLoadingDocuments ? (
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
                                onChange={(e) => updateDocumentSelection(doc.id, e.target.checked)}
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
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Content Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_technical_details"
                    checked={formData.include_technical_details}
                    onChange={(e) => handleInputChange('include_technical_details', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label htmlFor="include_technical_details" className="text-sm font-medium">
                    Include Technical Details
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_source_citations"
                    checked={formData.include_source_citations}
                    onChange={(e) => handleInputChange('include_source_citations', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label htmlFor="include_source_citations" className="text-sm font-medium">
                    Include Source Citations
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include_confidence_scores"
                    checked={formData.include_confidence_scores}
                    onChange={(e) => handleInputChange('include_confidence_scores', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                  />
                  <label htmlFor="include_confidence_scores" className="text-sm font-medium">
                    Include Confidence Scores
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <input
                type="checkbox"
                id="external_auditor_access"
                checked={formData.external_auditor_access}
                onChange={(e) => handleInputChange('external_auditor_access', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
              />
              <label htmlFor="external_auditor_access" className="text-sm font-medium">
                Allow External Auditor Access
              </label>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isCreating}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={isCreating || !isFormValid()}
          >
            {isCreating ? (
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