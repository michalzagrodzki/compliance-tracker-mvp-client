import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Sparkles, Target, TrendingUp, Users, AlertCircle } from 'lucide-react';

interface ExecutiveSummary {
  total_gaps: number;
  high_risk_gaps: number;
  regulatory_gaps: number;
  potential_financial_impact?: number;
}

interface ThreatIntelligence {
  total_gaps: number;
  threat_indicators: number;
  vulnerability_score: number;
  high_risk_gaps: number;
}

interface RiskPrioritization {
  total_gaps: number;
  prioritized_risks: number;
  risk_score: number;
  high_risk_gaps: number;
}

interface TargetAudience {
  total_gaps: number;
  communication_level: string;
  audience_focus_areas?: string[];
  high_risk_gaps: number;
}

interface ReportSummaryFieldsProps {
  // Executive Summary
  executiveSummary: string;
  onExecutiveSummaryChange: (value: string) => void;
  onGenerateExecutiveSummary: () => void;
  isGeneratingSummary: boolean;
  executiveSummaryData?: ExecutiveSummary | null;

  // Threat Intelligence
  threatIntelligenceAnalysis: string;
  onThreatIntelligenceChange: (value: string) => void;
  onGenerateThreatIntelligence: () => void;
  isGeneratingThreatIntelligence: boolean;
  threatIntelligenceData?: ThreatIntelligence | null;

  // Risk Prioritization
  controlRiskPrioritization: string;
  onRiskPrioritizationChange: (value: string) => void;
  onGenerateRiskPrioritization: () => void;
  isGeneratingRiskPrioritization: boolean;
  riskPrioritizationData?: RiskPrioritization | null;

  // Target Audience Summary
  targetAudienceSummary: string;
  onTargetAudienceChange: (value: string) => void;
  onGenerateTargetAudience: () => void;
  isGeneratingTargetAudience: boolean;
  targetAudienceData?: TargetAudience | null;
  currentTargetAudience?: string;

  // States
  selectedAuditSession: string;
  canGenerateSummary: boolean;
}

export default function ReportSummaryFields({
  executiveSummary,
  onExecutiveSummaryChange,
  onGenerateExecutiveSummary,
  isGeneratingSummary,
  executiveSummaryData,
  threatIntelligenceAnalysis,
  onThreatIntelligenceChange,
  onGenerateThreatIntelligence,
  isGeneratingThreatIntelligence,
  threatIntelligenceData,
  controlRiskPrioritization,
  onRiskPrioritizationChange,
  onGenerateRiskPrioritization,
  isGeneratingRiskPrioritization,
  riskPrioritizationData,
  targetAudienceSummary,
  onTargetAudienceChange,
  onGenerateTargetAudience,
  isGeneratingTargetAudience,
  targetAudienceData,
  currentTargetAudience,
  selectedAuditSession,
  canGenerateSummary
}: ReportSummaryFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="executive_summary" className="text-sm font-medium">Executive Summary</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateExecutiveSummary}
            disabled={!selectedAuditSession || !canGenerateSummary || isGeneratingSummary}
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
          value={executiveSummary}
          onChange={(e) => onExecutiveSummaryChange(e.target.value)}
          placeholder="Executive summary of the audit findings and recommendations..."
          rows={6}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-y"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            High-level overview of audit findings for executive stakeholders
          </p>
          {!canGenerateSummary && selectedAuditSession && (
            <p className="text-xs text-yellow-600">
              Select compliance gaps to enable summary generation
            </p>
          )}
        </div>
      </div>

      {executiveSummaryData && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Executive Summary Generated Successfully
            </span>
          </div>
          <div className="text-xs text-green-700 space-y-1">
            <p>• Total Gaps Analyzed: {executiveSummaryData.total_gaps}</p>
            <p>• High Risk Gaps: {executiveSummaryData.high_risk_gaps}</p>
            <p>• Regulatory Gaps: {executiveSummaryData.regulatory_gaps}</p>
            {executiveSummaryData.potential_financial_impact && (
              <p>• Potential Financial Impact: ${executiveSummaryData.potential_financial_impact.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {!selectedAuditSession && (
        <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Select an audit session to enable summary generation
          </p>
        </div>
      )}

      {/* Control Risk Prioritization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="control_risk_prioritization" className="text-sm font-medium">Control Risk Prioritization</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateRiskPrioritization}
            disabled={!canGenerateSummary || isGeneratingRiskPrioritization}
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
          value={controlRiskPrioritization}
          onChange={(e) => onRiskPrioritizationChange(e.target.value)}
          placeholder="Enter control risk prioritization..."
          rows={6}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Prioritized risk assessment and control recommendations
          </p>
          {!canGenerateSummary && (
            <p className="text-xs text-yellow-600">
              Select compliance gaps to enable prioritization generation
            </p>
          )}
        </div>
      </div>

      {riskPrioritizationData && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Risk Prioritization Generated Successfully
            </span>
          </div>
          <div className="text-xs text-orange-700 space-y-1">
            <p>• Total Gaps Analyzed: {riskPrioritizationData.total_gaps}</p>
            <p>• Prioritized Risks: {riskPrioritizationData.prioritized_risks}</p>
            <p>• Risk Score: {riskPrioritizationData.risk_score}</p>
            <p>• High Risk Gaps: {riskPrioritizationData.high_risk_gaps}</p>
          </div>
        </div>
      )}

      {/* Threat Intelligence Analysis */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="threat_intelligence_analysis" className="text-sm font-medium">Threat Intelligence Analysis</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateThreatIntelligence}
            disabled={!canGenerateSummary || isGeneratingThreatIntelligence}
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
          value={threatIntelligenceAnalysis}
          onChange={(e) => onThreatIntelligenceChange(e.target.value)}
          placeholder="Enter threat intelligence analysis..."
          rows={6}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Analysis of potential threats and vulnerabilities based on identified gaps
          </p>
          {!canGenerateSummary && (
            <p className="text-xs text-yellow-600">
              Select compliance gaps to enable analysis generation
            </p>
          )}
        </div>
      </div>

      {threatIntelligenceData && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Threat Intelligence Analysis Generated Successfully
            </span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Total Gaps Analyzed: {threatIntelligenceData.total_gaps}</p>
            <p>• Threat Indicators: {threatIntelligenceData.threat_indicators}</p>
            <p>• Vulnerability Score: {threatIntelligenceData.vulnerability_score}</p>
            <p>• High Risk Gaps: {threatIntelligenceData.high_risk_gaps}</p>
          </div>
        </div>
      )}

      {/* Target Audience Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="target_audience_summary" className="text-sm font-medium">Target Audience Summary</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerateTargetAudience}
            disabled={!canGenerateSummary || isGeneratingTargetAudience}
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
          value={targetAudienceSummary}
          onChange={(e) => onTargetAudienceChange(e.target.value)}
          placeholder="Enter target audience summary..."
          rows={6}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Summary tailored specifically for the target audience ({currentTargetAudience})
          </p>
          {!canGenerateSummary && (
            <p className="text-xs text-yellow-600">
              Select compliance gaps to enable summary generation
            </p>
          )}
        </div>
      </div>

      {targetAudienceData && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Target Audience Summary Generated Successfully
            </span>
          </div>
          <div className="text-xs text-purple-700 space-y-1">
            <p>• Total Gaps Analyzed: {targetAudienceData.total_gaps}</p>
            <p>• Communication Level: {targetAudienceData.communication_level}</p>
            <p>• Focus Areas: {targetAudienceData.audience_focus_areas?.join(', ')}</p>
            <p>• High Risk Gaps: {targetAudienceData.high_risk_gaps}</p>
          </div>
        </div>
      )}

      {!selectedAuditSession && (
        <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Select an audit session to enable summary generation
          </p>
        </div>
      )}
    </div>
  );
}