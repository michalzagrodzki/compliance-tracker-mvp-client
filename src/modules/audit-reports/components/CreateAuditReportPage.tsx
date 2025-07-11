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

export default function CreateAuditReportPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const { currentSession, fetchSessionById } = useAuditSessionStore();
  const {
    isCreating,
    error,
    createResponse,
    dataSources,
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
    confidentiality_level: 'internal',
    external_auditor_access: false
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
    // Update form when session is loaded
    if (currentSession) {
      setFormData(prev => ({
        ...prev,
        compliance_domain: currentSession.compliance_domain,
        report_title: `${currentSession.session_name} - Audit Report`,
      }));
    }
  }, [currentSession]);

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

  const toggleDataSourcesDetail = (source: 'chats' | 'gaps' | 'documents') => {
    setShowDataSourcesDetails(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const isFormValid = () => {
    const selectionCounts = auditReportStoreUtils.getSelectionCounts();
    return formData.report_title.trim() &&
           formData.compliance_domain.trim() &&
           formData.target_audience &&
           formData.confidentiality_level &&
           (selectionCounts.selectedChatsCount > 0 || 
            selectionCounts.selectedGapsCount > 0 || 
            selectionCounts.selectedDocumentsCount > 0);
  };

  const prepareReportData = (): AuditReportCreate => {
    const selectedData = auditReportStoreUtils.getSelectedData();
    
    return {
      ...formData,
      chat_history_ids: selectedData.selectedChats.map(chat => chat.id),
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
    navigate(`/audit-sessions/${sessionId}`);
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
                onClick={() => navigate(`/audit-sessions/${sessionId}`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Session</span>
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
            onClick={() => navigate(`/audit-sessions/${sessionId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Audit Session
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
              Basic details about the audit report including title, type, and target audience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Input
                  id="compliance_domain"
                  value={formData.compliance_domain}
                  onChange={(e) => handleInputChange('compliance_domain', e.target.value)}
                  placeholder="e.g., ISO27001"
                  required
                  disabled={!!currentSession?.compliance_domain}
                />
                <p className="text-xs text-muted-foreground">
                  Compliance framework this report addresses
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
            <CardTitle>Data Sources Selection</CardTitle>
            <CardDescription>
              Choose which data to include in your audit report from the current session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                      {dataSources.complianceGaps.map((gap) => (
                        <div key={gap.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={gap.selected}
                            onChange={(e) => updateGapSelection(gap.id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {gap.gap_title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {gap.gap_type} | Risk: {gap.risk_level}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {gap.gap_description}
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
                <span>Technical details and confidence scores are useful for detailed compliance reviews</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}