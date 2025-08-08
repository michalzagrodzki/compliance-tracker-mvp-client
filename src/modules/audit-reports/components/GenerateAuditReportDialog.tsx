/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditReport } from '../hooks/useAuditReport';
import {
  type AuditReportGenerateRequest,
  DEFAULT_GENERATE_REQUEST,
  generateReportTitle,
  REPORT_TYPE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  CONFIDENTIALITY_LEVEL_OPTIONS,
} from '../types';
import {
  Sparkle,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wand2,
  ExternalLink,
} from 'lucide-react';

interface GenerateAuditReportDialogProps {
  disabled: boolean;
  sessionId: string;
  sessionName: string;
  complianceDomain: string;
  startedAt?: string;
  triggerClassName?: string;
}

type DialogState = 'form' | 'generating' | 'success' | 'error';

export const GenerateAuditReportDialog: React.FC<GenerateAuditReportDialogProps> = ({
  disabled,
  sessionId,
  sessionName,
  complianceDomain,
  startedAt,
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>('form');
  const [formData, setFormData] = useState<AuditReportGenerateRequest>({
    ...DEFAULT_GENERATE_REQUEST,
    audit_session_id: sessionId,
    report_title: generateReportTitle(complianceDomain, startedAt),
  });

  const {
    generateReport,
    validateGenerateRequest,
    resetGenerationState,
    isGenerating,
    generateResponse,
    generateError,
  } = useAuditReport();

  const handleGenerateTitle = useCallback(() => {
    const newTitle = generateReportTitle(complianceDomain, startedAt);
    setFormData(prev => ({ ...prev, report_title: newTitle }));
  }, [complianceDomain, startedAt]);

  const handleInputChange = useCallback((field: keyof AuditReportGenerateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validation = validateGenerateRequest(formData);
    
    if (!validation.isValid) {
      console.error('Form validation failed:', validation.errors);
      return;
    }

    setDialogState('generating');

    try {
      const response = await generateReport(formData);
      
      if (response.success) {
        setDialogState('success');
      } else {
        setDialogState('error');
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      setDialogState('error');
    }
  }, [formData, validateGenerateRequest, generateReport]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing with a small delay for animation
      setTimeout(() => {
        setDialogState('form');
        resetGenerationState();
        setFormData({
          ...DEFAULT_GENERATE_REQUEST,
          audit_session_id: sessionId,
          report_title: generateReportTitle(complianceDomain, startedAt),
        });
      }, 150);
    }
  }, [sessionId, complianceDomain, startedAt, resetGenerationState]);

  const renderFormContent = () => (
    <div className="grid gap-6 py-4">
      <div className="grid gap-4">
        {/* Report Title */}
        <div className="grid gap-2">
          <Label htmlFor="report-title">Report Title</Label>
          <div className="flex gap-2">
            <Input
              id="report-title"
              value={formData.report_title}
              onChange={(e) => handleInputChange('report_title', e.target.value)}
              placeholder="Enter report title"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateTitle}
              className="shrink-0"
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </div>
        </div>

        {/* Report Type */}
        <div className="grid gap-2">
          <Label>Report Type</Label>
          <div className="grid gap-2">
            {REPORT_TYPE_OPTIONS.map(option => (
              <div
                key={option.value}
                onClick={() => handleInputChange('report_type', option.value)}
                className={`cursor-pointer rounded-lg border p-3 transition-all hover:border-primary ${
                  formData.report_type === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div
                      className={`h-4 w-4 rounded-full border-2 transition-colors ${
                        formData.report_type === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {formData.report_type === option.value && (
                        <div className="h-full w-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="grid gap-2">
          <Label>Target Audience</Label>
          <div className="grid gap-2">
            {TARGET_AUDIENCE_OPTIONS.map(option => (
              <div
                key={option.value}
                onClick={() => handleInputChange('target_audience', option.value)}
                className={`cursor-pointer rounded-lg border p-3 transition-all hover:border-primary ${
                  formData.target_audience === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div
                      className={`h-4 w-4 rounded-full border-2 transition-colors ${
                        formData.target_audience === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {formData.target_audience === option.value && (
                        <div className="h-full w-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidentiality Level */}
        <div className="grid gap-2">
          <Label>Confidentiality Level</Label>
          <div className="grid gap-2">
            {CONFIDENTIALITY_LEVEL_OPTIONS.map(option => (
              <div
                key={option.value}
                onClick={() => handleInputChange('confidentiality_level', option.value)}
                className={`cursor-pointer rounded-lg border p-3 transition-all hover:border-primary ${
                  formData.confidentiality_level === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div
                      className={`h-4 w-4 rounded-full border-2 transition-colors ${
                        formData.confidentiality_level === option.value
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {formData.confidentiality_level === option.value && (
                        <div className="h-full w-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        option.value === 'public' ? 'bg-green-500' :
                        option.value === 'internal' ? 'bg-blue-500' :
                        option.value === 'confidential' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} />
                      <p className="font-medium text-sm">{option.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Generation Options
          </CardTitle>
          <CardDescription>
            Configure what content to include in the generated report
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[
            { key: 'include_all_conversations', label: 'Include All Conversations', description: 'Include all chat interactions from the session' },
            { key: 'include_identified_gaps', label: 'Include Identified Gaps', description: 'Include compliance gaps found during the audit' },
            { key: 'include_document_references', label: 'Include Document References', description: 'Include references to uploaded documents' },
            { key: 'generate_recommendations', label: 'Generate Recommendations', description: 'Auto-generate recommendations based on findings' },
            { key: 'include_technical_details', label: 'Include Technical Details', description: 'Include technical implementation details' },
            { key: 'include_source_citations', label: 'Include Source Citations', description: 'Include citations to source materials' },
            { key: 'include_confidence_scores', label: 'Include Confidence Scores', description: 'Include AI confidence scores for findings' },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start gap-3">
              <input
                type="checkbox"
                id={key}
                checked={formData[key as keyof AuditReportGenerateRequest] as boolean}
                onChange={(e) => handleInputChange(key as keyof AuditReportGenerateRequest, e.target.checked)}
                className="mt-1 rounded border-input text-primary focus:ring-ring"
              />
              <div className="grid gap-1">
                <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderGeneratingContent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h3 className="text-lg font-semibold mb-2">Generating Audit Report</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Please wait while we generate your audit report. This may take a few minutes depending on the amount of data.
      </p>
    </div>
  );

  const renderSuccessContent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-green-100 p-3 mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Report Generated Successfully!</h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
        Your audit report has been created and is ready for review.
      </p>
      
      {generateResponse?.report_id && (
        <div className="w-full space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Report ID:</span>
              <code className="text-sm font-mono bg-white px-2 py-1 rounded border text-green-700">
                {generateResponse.report_id}
              </code>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to={`/audit-reports/${generateResponse.report_id}`}>
                <FileText className="h-4 w-4 mr-2" />
                View Report
              </Link>
            </Button>
            
            {generateResponse.download_url && (
              <Button variant="outline" asChild>
                <a href={generateResponse.download_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderErrorContent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
        {generateError || generateResponse?.error || 'An error occurred while generating the report. Please try again.'}
      </p>
      
      <Button
        onClick={() => setDialogState('form')}
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  );

  const getDialogContent = () => {
    switch (dialogState) {
      case 'form':
        return renderFormContent();
      case 'generating':
        return renderGeneratingContent();
      case 'success':
        return renderSuccessContent();
      case 'error':
        return renderErrorContent();
      default:
        return renderFormContent();
    }
  };

  const getDialogTitle = () => {
    switch (dialogState) {
      case 'form':
        return 'Generate Audit Report';
      case 'generating':
        return 'Generating Report';
      case 'success':
        return 'Report Generated';
      case 'error':
        return 'Generation Failed';
      default:
        return 'Generate Audit Report';
    }
  };

  const getDialogDescription = () => {
    switch (dialogState) {
      case 'form':
        return `Configure and generate a comprehensive audit report for "${sessionName}"`;
      case 'generating':
        return 'Please wait while we process your request';
      case 'success':
        return 'Your audit report has been successfully generated and is ready for review';
      case 'error':
        return 'There was an issue generating your report';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`flex items-center gap-2 ${triggerClassName || ''}`}
        >
          <Sparkle className="h-4 w-4" />
          {disabled ? "Audit report already exists" : "Generate Audit Report"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        {getDialogContent()}
        
        {dialogState === 'form' && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkle className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        )}
        
        {(dialogState === 'success' || dialogState === 'error') && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};