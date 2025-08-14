import React from 'react';

interface Option { value: string; label: string }

interface ComplianceDomainSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
}

const ComplianceDomainSelect: React.FC<ComplianceDomainSelectProps> = ({ value, onChange, options, disabled }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Compliance Domain *</label>
      <select
        id="compliance-domain"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
        disabled={disabled}
        required
      >
        <option value="">Select a compliance framework...</option>
        {options.map((domain) => (
          <option key={domain.value} value={domain.value}>
            {domain.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ComplianceDomainSelect;

