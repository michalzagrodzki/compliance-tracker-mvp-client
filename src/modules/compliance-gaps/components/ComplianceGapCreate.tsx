/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type {
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  DetectionMethod
} from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Info, Loader2, Plus, Search, X, XCircle } from 'lucide-react';
import { useAuditSessionStore } from '@/modules/audit/store/auditSessionStore';
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useComplianceGapStore } from '../store/complianceGapStore';
import { useIsoControlSearch } from '../../iso-control/hooks/useIsoControl';

// Enhanced options from ComplianceGapForm
const GAP_TYPE_OPTIONS: Array<{
  value: GapType;
  label: string;
  description: string;
}> = [
  { value: 'missing_policy', label: 'Missing Policy', description: 'Required policy document is missing' },
  { value: 'outdated_policy', label: 'Outdated Policy', description: 'Existing policy is obsolete or out of date' },
  { value: 'low_confidence', label: 'Low Confidence', description: 'Available information has low confidence level' },
  { value: 'conflicting_policies', label: 'Conflicting Policies', description: 'Multiple policies provide contradictory guidance' },
  { value: 'incomplete_coverage', label: 'Incomplete Coverage', description: 'Policy exists but does not cover all required areas' },
  { value: 'no_evidence', label: 'No Evidence', description: 'No documentation found to support compliance' }
];

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

const DETECTION_METHOD_OPTIONS: Array<{
  value: DetectionMethod;
  label: string;
}> = [
  { value: 'query_analysis', label: 'Query Analysis' },
  { value: 'periodic_scan', label: 'Periodic Scan' },
  { value: 'document_upload', label: 'Document Upload' },
  { value: 'manual_review', label: 'Manual Review' },
  { value: 'external_audit', label: 'External Audit' }
  ];

  const COMPLIANCE_DOMAINS = [
    { value: 'ISO27001', label: 'ISO 27001 - Information Security Management' },
  ]

interface FlattenedControl {
  id: string;
  frameworkName: string;
  controlCode: string;
  title: string;
  control: string;
  category: string;
  displayText: string;
}

interface ComplianceGapDirectRequest {
  user_id: string;
  audit_session_id: string;
  compliance_domain: string;
  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;
  iso_control: string | null;
  original_question: string;
  creation_method: 'direct';
  chat_history_id?: number;
  pdf_ingestion_id?: string;
  expected_answer_type?: string;
  search_terms_used: string[];
  similarity_threshold_used: number;
  best_match_score: number;
  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount: number;
  recommendation_type?: RecommendationType;
  recommendation_text: string;
  recommended_actions: string[];
  related_documents: string[];
  detection_method: DetectionMethod;
  confidence_score: number;
  false_positive_likelihood: number;
  ip_address?: string;
  user_agent: string;
  session_context: Record<string, any>;
}

export default function ComplianceGapCreatePage() {
  const navigate = useNavigate();
  const { createGapDirect, isLoading, error, clearError } = useComplianceGapStore();
  const { sessions, isLoading: isLoadingSessions, error: sessionsError, fetchUserSessions } = useAuditSessionStore();
  const { user } = useAuthStore()
  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showIsoDropdown, setShowIsoDropdown] = useState(false);

  const {
      searchTerm: isoSearchTerm,
      search: searchIsoControls,
      clearSearch: clearIsoSearch,
      controls: isoControls,
      isLoading: isLoadingIsoControls,
      error: isoControlsError,
    } = useIsoControlSearch(300);
  
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

  const [newAction, setNewAction] = useState('');
  const [newSearchTerm, setNewSearchTerm] = useState('');
  const [newDocument, setNewDocument] = useState('');

  const flattenedControls = useMemo(() => {
      const flattened: FlattenedControl[] = [];
      
      isoControls.forEach(framework => {
        Object.entries(framework.controls || {}).forEach(([controlCode, controlData]) => {
          flattened.push({
            id: `${framework.id}-${controlCode}`,
            frameworkName: framework.name,
            controlCode,
            title: controlData.title,
            control: controlData.control,
            category: controlData.category,
            displayText: `${controlCode} - ${controlData.title} (${controlData.category})`
          });
        });
      });
      
      return flattened;
    }, [isoControls]);
  
    // Get selected control from formData.iso_control
  const selectedIsoControl = useMemo(() => {
    if (!formData.iso_control) return null;
    
    return flattenedControls.find(
      control => `${control.frameworkName}:${control.controlCode}` === formData.iso_control
    ) || null;
  }, [formData.iso_control, flattenedControls]);
  
  const filteredIsoControls = useMemo(() => {
      if (!isoSearchTerm) return flattenedControls;
      
      const term = isoSearchTerm.toLowerCase();
      return flattenedControls.filter(control => 
        control.controlCode.toLowerCase().includes(term) ||
        control.title.toLowerCase().includes(term) ||
        control.category.toLowerCase().includes(term) ||
        control.frameworkName.toLowerCase().includes(term)
      );
    }, [flattenedControls, isoSearchTerm]);
  
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
        setFormData(prev => ({ ...prev, ip_address: data.ip }));
      })
      .catch(() => {
        // Fallback to placeholder
        setFormData(prev => ({ ...prev, ip_address: '127.0.0.1' }));
      });
  }, [clearError, user?.id, fetchUserSessions]);

  const handleInputChange = (field: keyof ComplianceGapDirectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIsoControlSelect = (control: FlattenedControl) => {
    const isoControlValue = `${control.frameworkName}:${control.controlCode}`;
    handleInputChange('iso_control', isoControlValue);
    setShowIsoDropdown(false);
    clearIsoSearch();
  };

  const handleClearIsoControl = () => {
    handleInputChange('iso_control', '');
    clearIsoSearch();
  };

  const handleDomainChange = (field: keyof ComplianceGapDirectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToArray = (field: 'recommended_actions' | 'search_terms_used' | 'related_documents', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleRemoveFromArray = (field: 'recommended_actions' | 'search_terms_used' | 'related_documents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
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
      await createGapDirect(formData);
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Audit Session *</label>
                <select
                  value={formData.audit_session_id}
                  onChange={(e) => handleInputChange('audit_session_id', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  disabled={isLoadingSessions}
                >
                  <option value="">
                    {isLoadingSessions ? 'Loading audit sessions...' : 'Select audit session'}
                  </option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.session_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Associate this gap with an existing audit session for tracking purposes
                </p>
              </div>

              <div className="space-y-2">
              <label className="text-sm font-medium">Compliance Domain *</label>
                <select
                  id="compliance-domain"
                  value={formData.compliance_domain}
                  onChange={(e) => handleDomainChange('compliance_domain', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  disabled={isLoading}
                  required
                >
                  <option value="">Select a compliance framework...</option>
                  {COMPLIANCE_DOMAINS.map((domain) => (
                    <option key={domain.value} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Gap Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {GAP_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('gap_type', option.value)}
                    className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.gap_type === option.value
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="gap_category" className="text-sm font-medium">Gap Category *</label>
                <Input
                  id="gap_category"
                  value={formData.gap_category}
                  onChange={(e) => handleInputChange('gap_category', e.target.value)}
                  placeholder="e.g., A.12.6.1 - Management of technical vulnerabilities"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Specific control or requirement category this gap relates to
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="gap_title" className="text-sm font-medium">Gap Title *</label>
                <Input
                  id="gap_title"
                  value={formData.gap_title}
                  onChange={(e) => handleInputChange('gap_title', e.target.value)}
                  placeholder="Brief, descriptive title for the gap"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Clear, concise title that summarizes the compliance gap
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="gap_description" className="text-sm font-medium">Gap Description *</label>
                <textarea
                  id="gap_description"
                  value={formData.gap_description}
                  onChange={(e) => handleInputChange('gap_description', e.target.value)}
                  placeholder="Detailed description of the compliance gap..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Detailed explanation of what is missing or inadequate in current compliance posture
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="iso_control" className="text-sm font-medium">Related ISO Control</label>

                {/* Trigger button (same element in both states) */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start items-start h-auto min-h-[3rem] py-3 gap-3"
                    onClick={() => setShowIsoDropdown((v) => !v)}
                  >
                    {selectedIsoControl ? (
                      <div className="flex w-full items-start gap-3">
                        <div className="pt-0.5">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 text-left leading-tight">
                        <div className="text-sm font-medium truncate">
                          {selectedIsoControl.controlCode} – {selectedIsoControl.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {selectedIsoControl.frameworkName} • {selectedIsoControl.category}
                        </div>
                      </div>

                        {/* Clear selected control without toggling dropdown */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearIsoControl();
                          }}
                          aria-label="Clear ISO control"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground shrink-0" />
                      </div>
                    ) : (
                      <div className="flex w-full items-center">
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className={formData.iso_control ? "text-foreground" : "text-muted-foreground"}>
                          {formData.iso_control || "Select ISO control..."}
                        </span>
                        <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
                      </div>
                    )}
                  </Button>

                  {/* Dropdown */}
                  {showIsoDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-input rounded-md shadow-lg max-h-72 overflow-y-auto">
                      {/* Embedded search input */}
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            placeholder="Search ISO controls..."
                            value={isoSearchTerm}
                            onChange={(e) => searchIsoControls(e.target.value)}
                            className="pl-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </div>

                      {isLoadingIsoControls ? (
                        <div className="p-3 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          <span className="text-sm text-muted-foreground mt-1 block">Loading controls...</span>
                        </div>
                      ) : isoControlsError ? (
                        <div className="p-3 text-center text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                          Failed to load ISO controls
                        </div>
                      ) : filteredIsoControls.length === 0 ? (
                        <div className="p-3 text-center text-muted-foreground text-sm">No controls found</div>
                      ) : (
                        <div className="py-1">
                          {filteredIsoControls.slice(0, 12).map((control) => (
                            <button
                              key={control.id}
                              type="button"
                              onClick={() => {
                                handleIsoControlSelect(control); // should set selectedIsoControl + formData.iso_control
                                setShowIsoDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                            >
                              <div className="font-medium text-sm">{control.controlCode}</div>
                              <div className="text-sm text-muted-foreground truncate">{control.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {control.frameworkName} • {control.category}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Select the most relevant ISO control that this compliance gap relates to
                </p>
              </div>
            </div>
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="original_question" className="text-sm font-medium">Original Question</label>
                <Input
                  id="original_question"
                  value={formData.original_question}
                  onChange={(e) => handleInputChange('original_question', e.target.value)}
                  placeholder="Question that led to gap discovery (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  The original question or query that revealed this gap
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="expected_answer_type" className="text-sm font-medium">Expected Answer Type</label>
                <Input
                  id="expected_answer_type"
                  value={formData.expected_answer_type || ''}
                  onChange={(e) => handleInputChange('expected_answer_type', e.target.value)}
                  placeholder="e.g., policy, procedure, control, documentation"
                />
                <p className="text-xs text-muted-foreground">
                  What type of information or documentation was expected to exist
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Detection Method</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {DETECTION_METHOD_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('detection_method', option.value)}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.detection_method === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                How this compliance gap was initially discovered or identified
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Search Terms Used</label>
              <div className="space-y-2">
                {formData.search_terms_used.map((term, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input value={term} readOnly className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromArray('search_terms_used', index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newSearchTerm}
                    onChange={(e) => setNewSearchTerm(e.target.value)}
                    placeholder="Add search term..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('search_terms_used', newSearchTerm), setNewSearchTerm(''))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {handleAddToArray('search_terms_used', newSearchTerm); setNewSearchTerm('');}}
                    disabled={!newSearchTerm.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Keywords or terms that were searched but yielded insufficient results
              </p>
            </div>
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
              <p className="text-xs text-muted-foreground">
                Assessment of the security or compliance risk this gap poses to the organization
              </p>
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
              <p className="text-xs text-muted-foreground">
                Potential impact on business operations if this gap is not addressed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="regulatory_requirement"
                  checked={formData.regulatory_requirement}
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
                  value={formData.potential_fine_amount}
                  onChange={(e) => handleInputChange('potential_fine_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated potential fine or penalty amount if this gap leads to violations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Suggested actions and recommendations for addressing this compliance gap
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
              <p className="text-xs text-muted-foreground">
                Primary type of action recommended to address this gap
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="recommendation_text" className="text-sm font-medium">Recommendation Details</label>
              <textarea
                id="recommendation_text"
                value={formData.recommendation_text}
                onChange={(e) => handleInputChange('recommendation_text', e.target.value)}
                placeholder="Detailed recommendation for addressing this gap..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Detailed explanation of recommended approach to resolve this gap
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Recommended Actions</label>
              <div className="space-y-2">
                {formData.recommended_actions.map((action, index) => (
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
              <p className="text-xs text-muted-foreground">
                Specific, actionable steps that should be taken to address this gap
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Related Documents</label>
              <div className="space-y-2">
                {formData.related_documents.map((doc, index) => (
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
              <p className="text-xs text-muted-foreground">
                Existing documents that are relevant to this gap or its resolution
              </p>
            </div>
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

              <div className="space-y-2">
                <label htmlFor="confidence_score" className="text-sm font-medium">Confidence Score</label>
                <div className="space-y-2">
                  <input
                    id="confidence_score"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={formData.confidence_score}
                    onChange={(e) => handleInputChange('confidence_score', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {(formData.confidence_score * 100).toFixed(0)}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confidence level that this represents a genuine compliance gap
                </p>
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
                    value={formData.false_positive_likelihood}
                    onChange={(e) => handleInputChange('false_positive_likelihood', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {(formData.false_positive_likelihood * 100).toFixed(0)}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Likelihood that this gap identification is incorrect
                </p>
              </div>
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