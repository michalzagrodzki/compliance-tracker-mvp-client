
import { Input } from '@/components/ui/input';
import { 
  type ReportStatus, 
  type ReportType, 
  type ConfidentialityLevel, 
  COMPLIANCE_RATING_OPTIONS 
} from '../../types';
import ReportTypeChips from './ReportTypeChips';
import ConfidentialityLevelChips from './ConfidentialityLevelChips';

interface EditBasicInformationFieldsProps {
  reportTitle: string;
  onTitleChange: (value: string) => void;
  reportStatus: ReportStatus;
  onStatusChange: (value: ReportStatus) => void;
  reportType: ReportType;
  onReportTypeChange: (value: ReportType) => void;
  overallComplianceRating: string;
  onComplianceRatingChange: (value: string) => void;
  regulatoryRiskScore: number | null | undefined;
  onRegulatoryRiskScoreChange: (value: number | null) => void;
  estimatedRemediationCost: number | null | undefined;
  onRemediationCostChange: (value: number | null) => void;
  estimatedRemediationTimeDays: number | null | undefined;
  onRemediationTimeChange: (value: number | null) => void;
  potentialFineExposure: number | null | undefined;
  onFineExposureChange: (value: number | null) => void;
  confidentialityLevel: ConfidentialityLevel;
  onConfidentialityChange: (value: ConfidentialityLevel) => void;
}

export default function EditBasicInformationFields({
  reportTitle,
  onTitleChange,
  reportStatus,
  onStatusChange,
  reportType,
  onReportTypeChange,
  overallComplianceRating,
  onComplianceRatingChange,
  regulatoryRiskScore,
  onRegulatoryRiskScoreChange,
  estimatedRemediationCost,
  onRemediationCostChange,
  estimatedRemediationTimeDays,
  onRemediationTimeChange,
  potentialFineExposure,
  onFineExposureChange,
  confidentialityLevel,
  onConfidentialityChange
}: EditBasicInformationFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="report_title" className="text-sm font-medium">Report Title</label>
          <Input
            id="report_title"
            value={reportTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter report title..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Report Status</label>
          <select
            value={reportStatus}
            onChange={(e) => onStatusChange(e.target.value as ReportStatus)}
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

      <ReportTypeChips
        value={reportType}
        onChange={onReportTypeChange}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Overall Compliance Rating</label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {COMPLIANCE_RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onComplianceRatingChange(option.value)}
              className={`text-left text-sm p-3 rounded border transition-colors ${
                overallComplianceRating === option.value
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
            value={regulatoryRiskScore ?? ''}
            onChange={(e) => onRegulatoryRiskScoreChange(parseInt(e.target.value) || null)}
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
            value={estimatedRemediationCost ?? ''}
            onChange={(e) => onRemediationCostChange(parseFloat(e.target.value) || null)}
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
              estimatedRemediationTimeDays 
                ? new Date(Date.now() + (estimatedRemediationTimeDays * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) => {
              if (e.target.value) {
                const selectedDate = new Date(e.target.value);
                const today = new Date();
                const diffTime = selectedDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                onRemediationTimeChange(diffDays > 0 ? diffDays : null);
              } else {
                onRemediationTimeChange(null);
              }
            }}
          />
          {estimatedRemediationTimeDays && (
            <p className="text-xs text-muted-foreground">
              {estimatedRemediationTimeDays} days from today
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
            value={potentialFineExposure ?? ''}
            onChange={(e) => onFineExposureChange(parseFloat(e.target.value) || null)}
            placeholder="0.00"
          />
        </div>
      </div>

      <ConfidentialityLevelChips
        value={confidentialityLevel}
        onChange={onConfidentialityChange}
      />
    </div>
  );
}