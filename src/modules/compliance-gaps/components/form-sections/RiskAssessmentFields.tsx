/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import OptionChips from '@/components/shared/OptionChips';
import { Input } from '@/components/ui/input';
import type { RiskLevel, BusinessImpactLevel } from '../../types';
import { RISK_LEVEL_OPTIONS, BUSINESS_IMPACT_OPTIONS } from '../../types';

export interface RiskAssessmentFieldsProps {
  riskLevel: RiskLevel;
  businessImpact: BusinessImpactLevel;
  regulatoryRequirement: boolean;
  potentialFineAmount: number;
  onChange: (
    field:
      | 'risk_level'
      | 'business_impact'
      | 'regulatory_requirement'
      | 'potential_fine_amount',
    value: any
  ) => void;
  chipsColumns?: string;
}

const RiskAssessmentFields: React.FC<RiskAssessmentFieldsProps> = ({
  riskLevel,
  businessImpact,
  regulatoryRequirement,
  potentialFineAmount,
  onChange,
  chipsColumns = 'grid-cols-2 md:grid-cols-4',
}) => {
  return (
    <div className="space-y-6">
      <OptionChips<RiskLevel>
        label="Risk Level *"
        options={RISK_LEVEL_OPTIONS}
        value={riskLevel}
        onChange={(v) => onChange('risk_level', v)}
        columns={chipsColumns}
      />

      <OptionChips<BusinessImpactLevel>
        label="Business Impact *"
        options={BUSINESS_IMPACT_OPTIONS}
        value={businessImpact}
        onChange={(v) => onChange('business_impact', v)}
        columns={chipsColumns}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="regulatory_requirement"
            checked={regulatoryRequirement}
            onChange={(e) => onChange('regulatory_requirement', e.target.checked)}
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
            value={potentialFineAmount}
            onChange={(e) => onChange('potential_fine_amount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentFields;

