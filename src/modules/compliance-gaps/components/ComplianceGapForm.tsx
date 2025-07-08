/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { complianceGapService } from '../services/complianceGapService';
import type { 
  ComplianceGapFormData, 
  ComplianceGapFromChatHistoryRequest,
  GapType,
  RiskLevel,
} from '../types';
import {
  GAP_TYPE_OPTIONS,
  RISK_LEVEL_OPTIONS,
  BUSINESS_IMPACT_OPTIONS,
  RECOMMENDATION_TYPE_OPTIONS
} from '../types';

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

  const handleSubmit = async () => {
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Create Compliance Gap</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Identify and document a potential compliance gap based on the chat interaction.
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gap Type *
              </label>
              <select
                value={formData.gap_type}
                onChange={(e) => handleInputChange('gap_type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {GAP_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {GAP_TYPE_OPTIONS.find(opt => opt.value === formData.gap_type)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gap Category *
              </label>
              <Input
                value={formData.gap_category}
                onChange={(e) => handleInputChange('gap_category', e.target.value)}
                placeholder="e.g., Data Protection, Access Control"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gap Title *
            </label>
            <Input
              value={formData.gap_title}
              onChange={(e) => handleInputChange('gap_title', e.target.value)}
              placeholder="Brief, descriptive title for the gap"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gap Description *
            </label>
            <textarea
              value={formData.gap_description}
              onChange={(e) => handleInputChange('gap_description', e.target.value)}
              placeholder="Detailed description of the compliance gap..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            />
          </div>

          {/* Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level *
              </label>
              <select
                value={formData.risk_level}
                onChange={(e) => handleInputChange('risk_level', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {RISK_LEVEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className={`text-xs mt-1 px-2 py-1 rounded ${getRiskLevelColor(formData.risk_level)}`}>
                Current: {RISK_LEVEL_OPTIONS.find(opt => opt.value === formData.risk_level)?.label}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Impact *
              </label>
              <select
                value={formData.business_impact}
                onChange={(e) => handleInputChange('business_impact', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {BUSINESS_IMPACT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potential Fine Amount
              </label>
              <Input
                type="number"
                value={formData.potential_fine_amount || ''}
                onChange={(e) => handleInputChange('potential_fine_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="regulatory_requirement"
              checked={formData.regulatory_requirement}
              onChange={(e) => handleInputChange('regulatory_requirement', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="regulatory_requirement" className="ml-2 text-sm text-gray-700">
              This is a regulatory requirement
            </label>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendation Type
              </label>
              <select
                value={formData.recommendation_type || ''}
                onChange={(e) => handleInputChange('recommendation_type', e.target.value || undefined)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a recommendation type...</option>
                {RECOMMENDATION_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendation Details
              </label>
              <textarea
                value={formData.recommendation_text}
                onChange={(e) => handleInputChange('recommendation_text', e.target.value)}
                placeholder="Detailed recommendation for addressing this gap..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommended Actions
              </label>
              
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
                      className="text-red-500 hover:text-red-700"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Score
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.confidence_score}
                  onChange={(e) => handleInputChange('confidence_score', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {(formData.confidence_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                False Positive Likelihood
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.false_positive_likelihood}
                  onChange={(e) => handleInputChange('false_positive_likelihood', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {(formData.false_positive_likelihood * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700"
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
        </div>
      </CardContent>
    </Card>
  );
};