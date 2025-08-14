/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface AuditSessionSelectProps {
  value: string;
  onChange: (value: string) => void;
  sessions: Array<{ id: string | number; session_name: string }>;
  loading?: boolean;
}

const AuditSessionSelect: React.FC<AuditSessionSelectProps> = ({ value, onChange, sessions, loading }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Audit Session *</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        required
        disabled={loading}
      >
        <option value="">
          {loading ? 'Loading audit sessions...' : 'Select audit session'}
        </option>
        {sessions.map((session) => (
          <option key={session.id} value={String(session.id)}>
            {session.session_name}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Associate this gap with an existing audit session for tracking purposes
      </p>
    </div>
  );
};

export default AuditSessionSelect;

