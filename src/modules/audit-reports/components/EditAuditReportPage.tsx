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
} from 'lucide-react';
import { useAuditReport } from '../hooks/useAuditReport';
import {
  type AuditReport,
  type ReportStatus,
  type ReportType,
  type Recommendation,
  type ActionItem,
  REPORT_TYPE_OPTIONS,
  COMPLIANCE_RATING_OPTIONS,
  CONFIDENTIALITY_LEVEL_OPTIONS,
} from '../types';

export default function EditAuditReportPage() {
  const navigate = useNavigate();
  const { reportId } = useParams<{ reportId: string }>();
  const {
    currentReport,
    isLoading,
    isUpdating,
    error,
    updateError,
    loadReport,
    updateReport,
    clearUpdateError,
    dataSources,
    loadSessionData,
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
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
    }
    clearUpdateError();
  }, [reportId, loadReport, clearUpdateError]);

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
      
      setRecommendations(Array.isArray(currentReport.recommendations) ? currentReport.recommendations : []);
      setActionItems(Array.isArray(currentReport.action_items) ? currentReport.action_items : []);
      setHasChanges(false);
    }
  }, [currentReport, loadSessionData]);

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
    const currentIds = formData[`${type === 'chat' ? 'chat_history' : type === 'gap' ? 'compliance_gap' : type === 'document' ? 'document' : 'pdf_ingestion'}_ids` as keyof AuditReport] as any[] || [];
    
    let updatedIds;
    if (currentIds.includes(id)) {
      updatedIds = currentIds.filter(existingId => existingId !== id);
    } else {
      updatedIds = [...currentIds, id];
    }

    if (type === 'chat') {
      handleArrayChange('chat_history_ids', updatedIds);
    } else if (type === 'gap') {
      handleArrayChange('compliance_gap_ids', updatedIds);
    } else if (type === 'document') {
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
      await updateReport(reportId, formData, changeDescription);
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

      {(error || updateError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center space-x-2 pt-6">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-700">{error || updateError}</span>
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

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>
              Select which data sources to include in this report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chat History */}
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

            {/* Compliance Gaps */}
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

            {/* Documents */}
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

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>
              Provide a high-level overview of the audit findings and conclusions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="executive_summary" className="text-sm font-medium">Executive Summary</label>
              <textarea
                id="executive_summary"
                value={formData.executive_summary || ''}
                onChange={(e) => handleInputChange('executive_summary', e.target.value)}
                placeholder="Enter executive summary..."
                rows={6}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
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

        {/* Action Buttons */}
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