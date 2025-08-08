/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus,
  Trash2,
  MessageSquare,
  AlertTriangle,
  Database,
  ChevronDown,
  ChevronUp,
  Info,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuditReport } from '../hooks/useAuditReport';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useAuditReportStore } from '../store/auditReportStore';
import {
  type AuditReport,
  type ReportStatus,
  type ReportType,
  type Recommendation,
  type ActionItem,
  type AuditReportCreate,
  type DetailedFinding,
  REPORT_TYPE_OPTIONS,
  COMPLIANCE_RATING_OPTIONS,
  CONFIDENTIALITY_LEVEL_OPTIONS,
  SummaryType,
} from '../types';
import type { ComplianceGap } from '@/modules/compliance-gaps/types';

export default function EditAuditReportPage() {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuthStore();
  const {
    dataSources,
    updateChatSelection,
    updateGapSelection,
    updateDocumentSelection,
    clearDataSources,
    // Executive Summary
    isGeneratingSummary,
    executiveSummary,
    summaryError,
    generateExecutiveSummary,
    clearExecutiveSummary,
    clearSummaryError,
    // Threat Intelligence
    isGeneratingThreatIntelligence,
    threatIntelligence,
    threatIntelligenceError,
    generateThreatIntelligence,
    clearThreatIntelligence,
    clearThreatIntelligenceError,
    // Risk Prioritization
    isGeneratingRiskPrioritization,
    riskPrioritization,
    riskPrioritizationError,
    generateRiskPrioritization,
    clearRiskPrioritization,
    clearRiskPrioritizationError,
    // Target Audience
    isGeneratingTargetAudience,
    targetAudience,
    targetAudienceError,
    generateTargetAudience,
    clearTargetAudience,
    clearTargetAudienceError,
  } = useAuditReportStore();

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
    canGenerateSummary,
    getSelectedData,
    validateSummaryGeneration,
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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [detailedFindings, setDetailedFindings] = useState<DetailedFinding[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
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
  }, [reportId, loadReport, clearUpdateError, clearExecutiveSummary, clearSummaryError, clearThreatIntelligence, clearThreatIntelligenceError, clearRiskPrioritization, clearRiskPrioritizationError, clearTargetAudience, clearTargetAudienceError]);

  useEffect(() => {
    if (currentReport) {
      // Load session data sources for this report
      loadSessionData(currentReport.audit_session_id);
      
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
      
      setRecommendations(Array.isArray(currentReport.recommendations) ? currentReport.recommendations : []);
      setDetailedFindings(convertedDetailedFindings);
      setActionItems(Array.isArray(currentReport.action_items) ? currentReport.action_items : []);
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
    return () => {
      clearDataSources();
      clearExecutiveSummary();
      clearSummaryError();
      clearThreatIntelligence();
      clearThreatIntelligenceError();
      clearRiskPrioritization();
      clearRiskPrioritizationError();
      clearTargetAudience();
      clearTargetAudienceError();
    };
  }, [clearDataSources, clearExecutiveSummary, clearSummaryError, clearThreatIntelligence, clearThreatIntelligenceError, clearRiskPrioritization, clearRiskPrioritizationError, clearTargetAudience, clearTargetAudienceError]);

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
    cleanedData.recommendations = recommendations.map(rec => ({
      id: rec.id,
      title: rec.title || '',
      description: rec.description || '',
      priority: rec.priority || 'medium',
      estimated_effort: rec.estimated_effort || '',
      category: rec.category || ''
    }));
    cleanedData.action_items = actionItems.map(item => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      assigned_to: item.assigned_to || '',
      due_date: item.due_date || '',
      priority: item.priority || 'medium',
      status: item.status || 'pending'
    }));
    
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

  const addRecommendation = () => {
    const newRecommendation: Recommendation = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: 'medium',
      estimated_effort: '',
      category: 'process_improvement'
    };
    const updatedRecommendations = [...recommendations, newRecommendation];
    setRecommendations(updatedRecommendations);
    handleArrayChange('recommendations', updatedRecommendations);
  };

  const updateRecommendation = (index: number, field: keyof Recommendation, value: any) => {
    const updatedRecommendations = recommendations.map((rec, i) => 
      i === index ? { ...rec, [field]: value } : rec
    );
    setRecommendations(updatedRecommendations);
    handleArrayChange('recommendations', updatedRecommendations);
  };

  const removeRecommendation = (index: number) => {
    const updatedRecommendations = recommendations.filter((_, i) => i !== index);
    setRecommendations(updatedRecommendations);
    handleArrayChange('recommendations', updatedRecommendations);
  };

  const addDetailedFinding = () => {
    const newFinding: DetailedFinding = {
      id: Date.now().toString(),
      title: '',
      description: '',
      severity: 'medium',
      category: '',
      recommendation: '',
      source_references: []
    };
    const updatedFindings = [...detailedFindings, newFinding];
    setDetailedFindings(updatedFindings);
    setHasChanges(true);
  };
  
  const updateDetailedFinding = (index: number, field: keyof DetailedFinding, value: any) => {
    const updatedFindings = detailedFindings.map((finding, i) => 
      i === index ? { ...finding, [field]: value } : finding
    );
    setDetailedFindings(updatedFindings);
    setHasChanges(true);
  };
  
  const removeDetailedFinding = (index: number) => {
    const updatedFindings = detailedFindings.filter((_, i) => i !== index);
    setDetailedFindings(updatedFindings);
    setHasChanges(true);
  };

  const addActionItem = () => {
    const newActionItem: ActionItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      assigned_to: '',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending'
    };
    const updatedActionItems = [...actionItems, newActionItem];
    setActionItems(updatedActionItems);
    handleArrayChange('action_items', updatedActionItems);
  };

  const updateActionItem = (index: number, field: keyof ActionItem, value: any) => {
    const updatedActionItems = actionItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setActionItems(updatedActionItems);
    handleArrayChange('action_items', updatedActionItems);
  };

  const removeActionItem = (index: number) => {
    const updatedActionItems = actionItems.filter((_, i) => i !== index);
    setActionItems(updatedActionItems);
    handleArrayChange('action_items', updatedActionItems);
  };

  const toggleDataSourceSelection = (type: 'chat' | 'gap' | 'document', id: string | number) => {
    if (type === 'chat') {
      updateChatSelection(id as number, !dataSources.chatHistory.find(c => c.id === id)?.selected);
      const currentIds = formData.chat_history_ids || [];
      const updatedIds = currentIds.includes(id as number) 
        ? currentIds.filter(existingId => existingId !== id)
        : [...currentIds, id as number];
      handleArrayChange('chat_history_ids', updatedIds);
    } else if (type === 'gap') {
      updateGapSelection(id as string, !dataSources.complianceGaps.find(g => g.id === id)?.selected);
      const currentIds = formData.compliance_gap_ids || [];
      const updatedIds = currentIds.includes(id as string) 
        ? currentIds.filter(existingId => existingId !== id)
        : [...currentIds, id as string];
      handleArrayChange('compliance_gap_ids', updatedIds);
    } else if (type === 'document') {
      updateDocumentSelection(id as string, !dataSources.documents.find(d => d.id === id)?.selected);
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
      const formattedData = prepareDataForBackend(formData);

      await updateReport(reportId, formattedData, changeDescription);
      setHasChanges(false);
      setChangeDescription('');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      // Error handled by store
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

  if (isLoading) {
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
            <div className="flex items-center space-x-2 bg-green-50 text-green-800 px-3 py-2 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Report updated successfully!</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="report_title" className="text-sm font-medium">Report Title</label>
                <Input
                  id="report_title"
                  value={formData.report_title || ''}
                  onChange={(e) => handleInputChange('report_title', e.target.value)}
                  placeholder="Enter report title..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Report Status</label>
                <select
                  value={formData.report_status || ''}
                  onChange={(e) => handleInputChange('report_status', e.target.value as ReportStatus)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="draft">Draft</option>
                  <option value="finalized">Finalized</option>
                  <option value="approved">Approved</option>
                  <option value="distributed">Distributed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Report Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {REPORT_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('report_type', option.value as ReportType)}
                    className={`text-left text-sm p-3 rounded border transition-colors ${
                      formData.report_type === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Overall Compliance Rating</label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {COMPLIANCE_RATING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('overall_compliance_rating', option.value)}
                    className={`text-left text-sm p-3 rounded border transition-colors ${
                      formData.overall_compliance_rating === option.value
                        ? `border-blue-400 ${option.color}`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label htmlFor="regulatory_risk_score" className="text-sm font-medium">
                  Regulatory Risk Score (1-10)
                </label>
                <Input
                  id="regulatory_risk_score"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.regulatory_risk_score || ''}
                  onChange={(e) => handleInputChange('regulatory_risk_score', parseInt(e.target.value) || null)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="estimated_remediation_cost" className="text-sm font-medium">
                  Estimated Remediation Cost ($)
                </label>
                <Input
                  id="estimated_remediation_cost"
                  type="number"
                  step="0.01"
                  value={formData.estimated_remediation_cost || ''}
                  onChange={(e) => handleInputChange('estimated_remediation_cost', parseFloat(e.target.value) || null)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="estimated_remediation_time_days" className="text-sm font-medium">
                  Estimated Remediation Time
                </label>
                <Input
                  id="estimated_remediation_time_days"
                  type="datetime-local"
                  value={
                    formData.estimated_remediation_time_days 
                      ? new Date(Date.now() + (formData.estimated_remediation_time_days * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedDate = new Date(e.target.value);
                      const today = new Date();
                      const diffTime = selectedDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      handleInputChange('estimated_remediation_time_days', diffDays > 0 ? diffDays : null);
                    } else {
                      handleInputChange('estimated_remediation_time_days', null);
                    }
                  }}
                />
                {formData.estimated_remediation_time_days && (
                  <p className="text-xs text-muted-foreground">
                    {formData.estimated_remediation_time_days} days from today
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="potential_fine_exposure" className="text-sm font-medium">
                  Potential Fine Exposure ($)
                </label>
                <Input
                  id="potential_fine_exposure"
                  type="number"
                  step="0.01"
                  value={formData.potential_fine_exposure || ''}
                  onChange={(e) => handleInputChange('potential_fine_exposure', parseFloat(e.target.value) || null)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Confidentiality Level</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {CONFIDENTIALITY_LEVEL_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('confidentiality_level', option.value)}
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
          </CardContent>
        </Card>
        
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>
              Provide or generate a high-level overview of the audit findings and conclusions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="executive_summary" className="text-sm font-medium">Executive Summary</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateExecutiveSummary}
                  disabled={!canGenerateSummary() || isGeneratingSummary}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {isGeneratingSummary ? 'Generating...' : 'Generate Executive Summary'}
                  </span>
                </Button>
              </div>
              <textarea
                id="executive_summary"
                value={formData.executive_summary || ''}
                onChange={(e) => handleInputChange('executive_summary', e.target.value)}
                placeholder="Enter executive summary..."
                rows={6}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  High-level overview of audit findings for executive stakeholders
                </p>
                {!canGenerateSummary() && (
                  <p className="text-xs text-yellow-600">
                    Select compliance gaps to enable summary generation
                  </p>
                )}
              </div>
            </div>

            {executiveSummary && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Executive Summary Generated Successfully
                  </span>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <p>• Total Gaps Analyzed: {executiveSummary.total_gaps}</p>
                  <p>• High Risk Gaps: {executiveSummary.high_risk_gaps}</p>
                  <p>• Regulatory Gaps: {executiveSummary.regulatory_gaps}</p>
                  {executiveSummary.potential_financial_impact && (
                    <p>• Potential Financial Impact: ${executiveSummary.potential_financial_impact.toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Threat Intelligence Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Intelligence Analysis</CardTitle>
            <CardDescription>
              Generate or provide threat intelligence insights based on compliance gaps and risk factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="threat_intelligence_analysis" className="text-sm font-medium">Threat Intelligence Analysis</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateThreatIntelligence}
                  disabled={!canGenerateSummary() || isGeneratingThreatIntelligence}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingThreatIntelligence ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4" />
                  )}
                  <span>
                    {isGeneratingThreatIntelligence ? 'Generating...' : 'Generate Threat Intelligence'}
                  </span>
                </Button>
              </div>
              <textarea
                id="threat_intelligence_analysis"
                value={formData.threat_intelligence_analysis || ''}
                onChange={(e) => handleInputChange('threat_intelligence_analysis', e.target.value)}
                placeholder="Enter threat intelligence analysis..."
                rows={6}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Analysis of potential threats and vulnerabilities based on identified gaps
                </p>
                {!canGenerateSummary() && (
                  <p className="text-xs text-yellow-600">
                    Select compliance gaps to enable analysis generation
                  </p>
                )}
              </div>
            </div>

            {threatIntelligence && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Threat Intelligence Analysis Generated Successfully
                  </span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• Total Gaps Analyzed: {threatIntelligence.total_gaps}</p>
                  <p>• Threat Indicators: {threatIntelligence.threat_indicators}</p>
                  <p>• Vulnerability Score: {threatIntelligence.vulnerability_score}</p>
                  <p>• High Risk Gaps: {threatIntelligence.high_risk_gaps}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Prioritization */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Prioritization</CardTitle>
            <CardDescription>
              Generate or provide control risk prioritization based on compliance gaps and business impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="control_risk_prioritization" className="text-sm font-medium">Control Risk Prioritization</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateRiskPrioritization}
                  disabled={!canGenerateSummary() || isGeneratingRiskPrioritization}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingRiskPrioritization ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4" />
                  )}
                  <span>
                    {isGeneratingRiskPrioritization ? 'Generating...' : 'Generate Risk Prioritization'}
                  </span>
                </Button>
              </div>
              <textarea
                id="control_risk_prioritization"
                value={formData.control_risk_prioritization || ''}
                onChange={(e) => handleInputChange('control_risk_prioritization', e.target.value)}
                placeholder="Enter control risk prioritization..."
                rows={6}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Prioritized risk assessment and control recommendations
                </p>
                {!canGenerateSummary() && (
                  <p className="text-xs text-yellow-600">
                    Select compliance gaps to enable prioritization generation
                  </p>
                )}
              </div>
            </div>

            {riskPrioritization && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Risk Prioritization Generated Successfully
                  </span>
                </div>
                <div className="text-xs text-orange-700 space-y-1">
                  <p>• Total Gaps Analyzed: {riskPrioritization.total_gaps}</p>
                  <p>• Prioritized Risks: {riskPrioritization.prioritized_risks}</p>
                  <p>• Risk Score: {riskPrioritization.risk_score}</p>
                  <p>• High Risk Gaps: {riskPrioritization.high_risk_gaps}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Audience Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Target Audience Summary</CardTitle>
            <CardDescription>
              Generate or provide audience-specific summary tailored to the report's target stakeholders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="target_audience_summary" className="text-sm font-medium">Target Audience Summary</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTargetAudience}
                  disabled={!canGenerateSummary() || isGeneratingTargetAudience}
                  className="flex items-center space-x-2"
                >
                  {isGeneratingTargetAudience ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span>
                    {isGeneratingTargetAudience ? 'Generating...' : 'Generate Target Audience Summary'}
                  </span>
                </Button>
              </div>
              <textarea
                id="target_audience_summary"
                value={formData.target_audience_summary || ''}
                onChange={(e) => handleInputChange('target_audience_summary', e.target.value)}
                placeholder="Enter target audience summary..."
                rows={6}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Summary tailored specifically for the target audience ({currentReport.target_audience})
                </p>
                {!canGenerateSummary() && (
                  <p className="text-xs text-yellow-600">
                    Select compliance gaps to enable summary generation
                  </p>
                )}
              </div>
            </div>

            {targetAudience && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Target Audience Summary Generated Successfully
                  </span>
                </div>
                <div className="text-xs text-purple-700 space-y-1">
                  <p>• Total Gaps Analyzed: {targetAudience.total_gaps}</p>
                  <p>• Communication Level: {targetAudience.communication_level}</p>
                  <p>• Focus Areas: {targetAudience.audience_focus_areas?.join(', ')}</p>
                  <p>• High Risk Gaps: {targetAudience.high_risk_gaps}</p>
                </div>
              </div>
            )}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Chat History</span>
                  <span className="text-sm text-muted-foreground">
                    ({(formData.chat_history_ids || []).length} selected)
                  </span>
                </div>
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

              {showDataSourcesDetails.chats && dataSources.chatHistory && (
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                  {dataSources.chatHistory.map((chat) => (
                    <div key={chat.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.chat_history_ids || []).includes(chat.id)}
                        onChange={() => toggleDataSourceSelection('chat', chat.id)}
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
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Compliance Gaps</span>
                  <span className="text-sm text-muted-foreground">
                    ({(formData.compliance_gap_ids || []).length} selected)
                  </span>
                </div>
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

              {showDataSourcesDetails.gaps && dataSources.complianceGaps && (
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                  {dataSources.complianceGaps.map((gap) => (
                    <div key={gap.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.compliance_gap_ids || []).includes(gap.id)}
                        onChange={() => toggleDataSourceSelection('gap', gap.id)}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {gap.gap_title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {gap.risk_level} risk • {gap.gap_type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Documents</span>
                  <span className="text-sm text-muted-foreground">
                    ({(formData.document_ids || []).length} selected)
                  </span>
                </div>
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

              {showDataSourcesDetails.documents && dataSources.documents && (
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                  {dataSources.documents.map((doc) => (
                    <div key={doc.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.document_ids || []).includes(doc.id)}
                        onChange={() => toggleDataSourceSelection('document', doc.id)}
                        className="mt-1 h-4 w-4 text-primary focus:ring-primary border-input rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {doc.filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detailed Findings</span>
              <Button type="button" onClick={addDetailedFinding} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Finding
              </Button>
            </CardTitle>
            <CardDescription>
              Specific findings from the audit process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedFindings.map((finding, index) => (
              <div key={finding.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Finding {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeDetailedFinding(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={finding.title}
                      onChange={(e) => updateDetailedFinding(index, 'title', e.target.value)}
                      placeholder="Finding title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Severity</label>
                    <select
                      value={finding.severity}
                      onChange={(e) => updateDetailedFinding(index, 'severity', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={finding.category}
                    onChange={(e) => updateDetailedFinding(index, 'category', e.target.value)}
                    placeholder="e.g., Access Control, Data Protection"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={finding.description}
                    onChange={(e) => updateDetailedFinding(index, 'description', e.target.value)}
                    placeholder="Detailed description of the finding"
                    rows={3}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recommendation</label>
                  <textarea
                    value={finding.recommendation}
                    onChange={(e) => updateDetailedFinding(index, 'recommendation', e.target.value)}
                    placeholder="Recommended actions to address this finding"
                    rows={2}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            ))}
            
            {detailedFindings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>No detailed findings added yet</p>
                <p className="text-sm">Click "Add Finding" to create specific audit findings</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recommendations</span>
              <Button type="button" onClick={addRecommendation} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Recommendation
              </Button>
            </CardTitle>
            <CardDescription>
              Strategic recommendations for addressing compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={recommendation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Recommendation {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeRecommendation(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={recommendation.title}
                      onChange={(e) => updateRecommendation(index, 'title', e.target.value)}
                      placeholder="Recommendation title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={recommendation.priority}
                      onChange={(e) => updateRecommendation(index, 'priority', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={recommendation.category}
                      onChange={(e) => updateRecommendation(index, 'category', e.target.value)}
                      placeholder="e.g., process_improvement, policy_update"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estimated Effort</label>
                    <Input
                      value={recommendation.estimated_effort}
                      onChange={(e) => updateRecommendation(index, 'estimated_effort', e.target.value)}
                      placeholder="e.g., 2-4 weeks, 1 month"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={recommendation.description}
                    onChange={(e) => updateRecommendation(index, 'description', e.target.value)}
                    placeholder="Detailed description of the recommendation"
                    rows={3}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            ))}
            
            {recommendations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>No recommendations added yet</p>
                <p className="text-sm">Click "Add Recommendation" to create strategic recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Action Items</span>
              <Button type="button" onClick={addActionItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Action Item
              </Button>
            </CardTitle>
            <CardDescription>
              Specific tasks and assignments for addressing compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionItems.map((actionItem, index) => (
              <div key={actionItem.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Action Item {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={actionItem.title}
                      onChange={(e) => updateActionItem(index, 'title', e.target.value)}
                      placeholder="Action item title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={actionItem.priority}
                      onChange={(e) => updateActionItem(index, 'priority', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assigned To</label>
                    <Input
                      value={actionItem.assigned_to || ''}
                      onChange={(e) => updateActionItem(index, 'assigned_to', e.target.value)}
                      placeholder="Person or team responsible"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="date"
                      value={actionItem.due_date || ''}
                      onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={actionItem.status}
                      onChange={(e) => updateActionItem(index, 'status', e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={actionItem.description}
                    onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                    placeholder="Detailed description of the action item"
                    rows={3}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            ))}
            
            {actionItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>No action items added yet</p>
                <p className="text-sm">Click "Add Action Item" to create specific tasks</p>
              </div>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="external_audit_reference" className="text-sm font-medium">
                  External Audit Reference
                </label>
                <Input
                  id="external_audit_reference"
                  value={formData.external_audit_reference || ''}
                  onChange={(e) => handleInputChange('external_audit_reference', e.target.value)}
                  placeholder="External audit reference number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="scheduled_followup_date" className="text-sm font-medium">
                  Scheduled Follow-up Date
                </label>
                <Input
                  id="scheduled_followup_date"
                  type="datetime-local"
                  value={formData.scheduled_followup_date ? new Date(formData.scheduled_followup_date).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('scheduled_followup_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="regulatory_submission_date" className="text-sm font-medium">
                Regulatory Submission Date
              </label>
              <Input
                id="regulatory_submission_date"
                type="datetime-local"
                value={formData.regulatory_submission_date ? new Date(formData.regulatory_submission_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('regulatory_submission_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="regulatory_response_received"
                checked={formData.regulatory_response_received || false}
                onChange={(e) => handleInputChange('regulatory_response_received', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
              />
              <label htmlFor="regulatory_response_received" className="text-sm font-medium">
                Regulatory Response Received
              </label>
            </div>
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
            <div className="space-y-2">
              <label htmlFor="change_description" className="text-sm font-medium">
                What changes are you making?
              </label>
              <textarea
                id="change_description"
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Describe the changes made to this report..."
                rows={3}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded in the audit trail for compliance purposes
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={isUpdating || !hasChanges}
          >
            {isUpdating ? (
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