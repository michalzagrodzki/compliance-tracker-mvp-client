/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, Plus, X, ChevronDown, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import type { 
  ComplianceGapFromChatHistoryRequest,
  GapType,
  RiskLevel,
  BusinessImpactLevel,
  RecommendationType,
  FlattenedControl,
  ISOFramework,
} from '../types';
import { useComplianceGap } from '../hooks/useComplianceGap';
import { useIsoControlSearch } from '@/modules/iso-control/hooks/useIsoControl';
import { stringToInt } from '@/lib/utils';

// Type definitions
export interface ComplianceGapFormData {
  gap_type: GapType;
  gap_category: string;
  gap_title: string;
  gap_description: string;
  iso_control: string;
  risk_level: RiskLevel;
  business_impact: BusinessImpactLevel;
  regulatory_requirement: boolean;
  potential_fine_amount?: number;
  recommendation_type?: RecommendationType;
  recommendation_text: string;
  recommended_actions: string[];
  confidence_score: number;
  false_positive_likelihood: number;
}

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

  const extractWholeNumberFromId = (id: string): number => {
    const wholePart = id.split('.')[0];
    return parseInt(wholePart, 10);
  };

// Mock service for this example
const complianceGapService = {
  analyzeMessageForGapType: (message: string): { suggestedType: GapType; confidence: number } => ({
    suggestedType: 'missing_policy' as GapType,
    confidence: 0.8
  }),
  suggestGapCategory: (domain: string) => domain || 'General Compliance',
  extractSearchTerms: (message: string) => message.split(' ').slice(0, 5),
};

interface ComplianceGapFormProps {
  chatHistoryId: string;
  auditSessionId?: string;
  complianceDomain?: string;
  initialMessage?: string;
  sources?: string[];
  onSubmitRequest: (request: ComplianceGapFromChatHistoryRequest) => Promise<void>;
  onCancel: () => void;
}

export const ComplianceGapForm: React.FC<ComplianceGapFormProps> = ({
  chatHistoryId,
  auditSessionId,
  complianceDomain,
  initialMessage = '',
  sources = [],
  onSubmitRequest,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAction, setNewAction] = useState('');
  const [showIsoDropdown, setShowIsoDropdown] = useState(false);

  const { 
      recommendationError,
      isGeneratingRecommendation,
      lastGeneratedRecommendation,
      generateRecommendation,
      clearRecommendationError
    } = useComplianceGap();

  const {
    searchTerm: isoSearchTerm,
    search: searchIsoControls,
    clearSearch: clearIsoSearch,
    controls: isoControls,
    isLoading: isLoadingIsoControls,
    error: isoControlsError,
  } = useIsoControlSearch(300);

  const [formData, setFormData] = useState<ComplianceGapFormData>({
    gap_type: 'missing_policy',
    gap_category: '',
    gap_title: '',
    gap_description: '',
    iso_control: '',
    risk_level: 'medium',
    business_impact: 'medium',
    regulatory_requirement: false,
    potential_fine_amount: undefined,
    recommendation_type: undefined,
    recommendation_text: '',
    recommended_actions: [],
    confidence_score: 0.80,
    false_positive_likelihood: 0.20
  });

  const flattenedControls = useMemo(() => {
      const flattened: FlattenedControl[] = [];
      
      isoControls.forEach((framework: ISOFramework) => {
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

  // Initialize form with smart defaults
  useEffect(() => {
    if (initialMessage) {
      const analysis = complianceGapService.analyzeMessageForGapType(initialMessage);
      const suggestedCategory = complianceGapService.suggestGapCategory(complianceDomain || '');

      setFormData(prev => ({
        ...prev,
        gap_type: analysis.suggestedType,
        gap_category: suggestedCategory,
        gap_title: `${suggestedCategory} Gap - ${new Date().toLocaleDateString()}`,
        gap_description: `Potential compliance gap identified from user query: "${initialMessage.substring(0, 200)}${initialMessage.length > 200 ? '...' : ''}"`,
        confidence_score: analysis.confidence
      }));
    }
  }, [initialMessage, complianceDomain]);

  useEffect(() => {
      if (lastGeneratedRecommendation) {
        setFormData(prev => ({
          ...prev,
          recommendation_text: lastGeneratedRecommendation.recommendation_text
        }));
      }
  }, [lastGeneratedRecommendation]);
  
  const handleInputChange = (field: keyof ComplianceGapFormData, value: any) => {
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

  const handleAddAction = () => {
    if (newAction.trim()) {
      setFormData(prev => ({
        ...prev,
        recommended_actions: [...prev.recommended_actions, newAction.trim()]
      }));
      setNewAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recommended_actions: prev.recommended_actions.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateRecommendation = async () => {
    if (!chatHistoryId || !formData.recommendation_type) {
      return;
    }
    try {
      clearRecommendationError();
      await generateRecommendation(stringToInt(chatHistoryId), formData.recommendation_type, formData.iso_control || undefined);
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    }
  };
  
  const isGenerateRecommendationEnabled = () => {
    return chatHistoryId && formData.recommendation_type && !isGeneratingRecommendation;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: ComplianceGapFromChatHistoryRequest = {
        creation_method: "from_chat_history",
        chat_history_id: extractWholeNumberFromId(chatHistoryId),
        audit_session_id: auditSessionId,
        compliance_domain: complianceDomain,
        search_terms_used: complianceGapService.extractSearchTerms(initialMessage),
        related_documents: sources,
        gap_type: formData.gap_type,
        gap_category: formData.gap_category,
        gap_title: formData.gap_title,
        gap_description: formData.gap_description,
        risk_level: formData.risk_level,
        business_impact: formData.business_impact,
        regulatory_requirement: formData.regulatory_requirement,
        potential_fine_amount: formData.potential_fine_amount,
        recommendation_type: formData.recommendation_type,
        recommendation_text: formData.recommendation_text,
        recommended_actions: formData.recommended_actions,
        confidence_score: formData.confidence_score,
        false_positive_likelihood: formData.false_positive_likelihood
      };

      await onSubmitRequest(request);
    } catch (err: any) {
      setError(err.message || 'Failed to create compliance gap');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.gap_type &&
      formData.gap_category.trim() &&
      formData.gap_title.trim() &&
      formData.gap_description.trim();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 pb-20">
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="grid gap-3">
              <Label>Gap Type *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {GAP_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('gap_type', option.value)}
                    className={`text-left text-sm p-3 rounded border transition-all duration-200 ease-in-out transform ${formData.gap_type === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="grid gap-3">
                <Label htmlFor="gap_title">Gap Title *</Label>
                <Input
                  id="gap_title"
                  value={formData.gap_title}
                  onChange={(e) => handleInputChange('gap_title', e.target.value)}
                  placeholder="Brief, descriptive title for the gap"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="gap_category">Gap Category *</Label>
                <Input
                  id="gap_category"
                  value={formData.gap_category}
                  onChange={(e) => handleInputChange('gap_category', e.target.value)}
                  placeholder="e.g., Data Protection, Access Control"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="potential_fine_amount">Potential Fine Amount</Label>
                <Input
                  id="potential_fine_amount"
                  type="number"
                  value={formData.potential_fine_amount || ''}
                  onChange={(e) => handleInputChange('potential_fine_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
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
          </div>

          <div className="grid gap-3">
            <Label htmlFor="gap_description">Gap Description *</Label>
            <textarea
              id="gap_description"
              value={formData.gap_description}
              onChange={(e) => handleInputChange('gap_description', e.target.value)}
              placeholder="Detailed description of the compliance gap..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-6">
            <div className="grid gap-3">
              <Label>Risk Level *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {RISK_LEVEL_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('risk_level', option.value)}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${formData.risk_level === option.value
                        ? `border-blue-400 ${option.color}`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Business Impact *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BUSINESS_IMPACT_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('business_impact', option.value)}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${formData.business_impact === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="regulatory_requirement"
              checked={formData.regulatory_requirement}
              onChange={(e) => handleInputChange('regulatory_requirement', e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <Label htmlFor="regulatory_requirement" className="text-sm font-normal">
              This is a regulatory requirement
            </Label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recommendations</h3>

            <div className="grid gap-3">
              <Label>Recommendation Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {RECOMMENDATION_TYPE_OPTIONS.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('recommendation_type',
                      formData.recommendation_type === option.value ? undefined : option.value
                    )}
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${formData.recommendation_type === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    style={{
                      transitionDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
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
                  {!chatHistoryId && !formData.recommendation_type && 
                    "Select a recommendation type and ensure this gap has related chat history to generate AI recommendations"}
                  {!chatHistoryId && formData.recommendation_type && 
                    "This gap has no related chat history for AI recommendation generation"}
                  {chatHistoryId && !formData.recommendation_type && 
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

            <div className="grid gap-3">
              <Label>Recommended Actions</Label>

              <div className="space-y-2">
                {formData.recommended_actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={action}
                      onChange={(e) => {
                        const newActions = [...formData.recommended_actions];
                        newActions[index] = e.target.value;
                        handleInputChange('recommended_actions', newActions);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAction(index)}
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
                    placeholder="Add a recommended action..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAction())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAction}
                    disabled={!newAction.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="confidence_score">Confidence Score</Label>
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
            </div>

            <div className="grid gap-3">
              <Label htmlFor="false_positive_likelihood">False Positive Likelihood</Label>
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
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-6">
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
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
        </DialogFooter>
      </div>
    </div>
  );
};
