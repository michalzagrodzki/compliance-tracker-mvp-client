/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
// import { complianceGapService } from '../services/complianceGapService';
import type { 
  ComplianceGapFormData, 
  ComplianceGapFromChatHistoryRequest,
  GapType,
  RiskLevel
} from '../types';

// Mock options for demonstration
const GAP_TYPE_OPTIONS = [
  { value: 'missing_policy', label: 'Missing Policy', description: 'Required policy document is missing' },
  { value: 'insufficient_controls', label: 'Insufficient Controls', description: 'Existing controls are inadequate' },
  { value: 'process_gap', label: 'Process Gap', description: 'Missing or incomplete process' },
  { value: 'training_gap', label: 'Training Gap', description: 'Staff lack required training' },
  { value: 'monitoring_gap', label: 'Monitoring Gap', description: 'Inadequate monitoring or reporting' },
  { value: 'documentation_gap', label: 'Documentation Gap', description: 'Missing or outdated documentation' }
];

const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Risk', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical Risk', color: 'bg-red-100 text-red-800' }
];

const BUSINESS_IMPACT_OPTIONS = [
  { value: 'low', label: 'Low Impact' },
  { value: 'medium', label: 'Medium Impact' },
  { value: 'high', label: 'High Impact' },
  { value: 'critical', label: 'Critical Impact' }
];

const RECOMMENDATION_TYPE_OPTIONS = [
  { value: 'policy_update', label: 'Policy Update' },
  { value: 'process_improvement', label: 'Process Improvement' },
  { value: 'training_program', label: 'Training Program' },
  { value: 'technology_implementation', label: 'Technology Implementation' },
  { value: 'monitoring_enhancement', label: 'Monitoring Enhancement' },
  { value: 'documentation_review', label: 'Documentation Review' }
];

// Mock service for this example
const complianceGapService = {
  analyzeMessageForGapType: (message: string) => ({
    suggestedType: 'missing_policy' as GapType,
    confidence: 0.8
  }),
  suggestGapCategory: (domain: string) => domain || 'General Compliance',
  extractSearchTerms: (message: string) => message.split(' ').slice(0, 5),
  createFromChatHistory: async (request: ComplianceGapFromChatHistoryRequest) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { id: `GAP-${Date.now()}` };
  }
};

interface ComplianceGapFormProps {
  chatHistoryId: string;
  auditSessionId?: string;
  complianceDomain?: string;
  initialMessage?: string;
  sources?: string[];
  onSuccess: (gapId: string) => void;
  onCancel: () => void;
}

export const ComplianceGapForm: React.FC<ComplianceGapFormProps> = ({
  chatHistoryId,
  auditSessionId,
  complianceDomain,
  initialMessage = '',
  sources = [],
  onSuccess,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAction, setNewAction] = useState('');

  const [formData, setFormData] = useState<ComplianceGapFormData>({
    gap_type: 'missing_policy',
    gap_category: '',
    gap_title: '',
    gap_description: '',
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

  // Initialize form with smart defaults
  useEffect(() => {
    if (initialMessage) {
      const analysis = complianceGapService.analyzeMessageForGapType(initialMessage);
      const suggestedCategory = complianceGapService.suggestGapCategory(complianceDomain || '');

      setFormData(prev => ({
        ...prev,
        gap_type: analysis.suggestedType as GapType,
        gap_category: suggestedCategory,
        gap_title: `${suggestedCategory} Gap - ${new Date().toLocaleDateString()}`,
        gap_description: `Potential compliance gap identified from user query: "${initialMessage.substring(0, 200)}${initialMessage.length > 200 ? '...' : ''}"`,
        confidence_score: analysis.confidence
      }));
    }
  }, [initialMessage, complianceDomain]);

  const handleInputChange = (field: keyof ComplianceGapFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const request: ComplianceGapFromChatHistoryRequest = {
        creation_method: "from_chat_history",
        chat_history_id: chatHistoryId,
        audit_session_id: auditSessionId,
        compliance_domain: complianceDomain,
        search_terms_used: complianceGapService.extractSearchTerms(initialMessage),
        related_documents: sources,
        ...formData
      };

      const response = await complianceGapService.createFromChatHistory(request);
      onSuccess(response.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    return RISK_LEVEL_OPTIONS.find(option => option.value === level)?.color || '';
  };

  const isFormValid = () => {
    return formData.gap_type && 
           formData.gap_category.trim() && 
           formData.gap_title.trim() && 
           formData.gap_description.trim();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto p-6 pb-20">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="grid gap-3">
              <Label>Gap Type *</Label>
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

            <div className="grid gap-3">
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

          {/* Risk Assessment */}
          <div className="space-y-6">
            <div className="grid gap-3">
              <Label>Risk Level *</Label>
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
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.business_impact === option.value
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

          {/* Recommendations */}
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
                    className={`text-center text-sm px-3 py-2 rounded border transition-all duration-200 ease-in-out transform ${
                      formData.recommendation_type === option.value
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
              <Label htmlFor="recommendation_text">Recommendation Details</Label>
              <textarea
                id="recommendation_text"
                value={formData.recommendation_text}
                onChange={(e) => handleInputChange('recommendation_text', e.target.value)}
                placeholder="Detailed recommendation for addressing this gap..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Confidence Scores */}
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

          {/* Error Display */}
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

      {/* Fixed footer */}
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