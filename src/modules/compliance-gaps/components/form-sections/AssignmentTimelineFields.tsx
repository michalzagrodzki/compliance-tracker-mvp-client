import React from 'react';
import { Input } from '@/components/ui/input';

interface AssignmentTimelineFieldsProps {
  assignedTo?: string;
  dueDate?: string;
  resolutionNotes?: string;
  onChange: (field: string, value: string | undefined) => void;
  disabled?: boolean;
}

export const AssignmentTimelineFields: React.FC<AssignmentTimelineFieldsProps> = ({
  assignedTo,
  dueDate,
  resolutionNotes,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="assigned_to" className="text-sm font-medium">Assigned To</label>
          <Input
            id="assigned_to"
            value={assignedTo || ''}
            onChange={(e) => onChange('assigned_to', e.target.value || undefined)}
            placeholder="User ID or email"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="due_date" className="text-sm font-medium">Due Date</label>
          <Input
            id="due_date"
            type="datetime-local"
            value={dueDate || ''}
            onChange={(e) => onChange('due_date', e.target.value || undefined)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="resolution_notes" className="text-sm font-medium">Resolution Notes</label>
        <textarea
          id="resolution_notes"
          value={resolutionNotes || ''}
          onChange={(e) => onChange('resolution_notes', e.target.value)}
          placeholder="Notes about resolution progress or issues..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        />
      </div>
    </div>
  );
};