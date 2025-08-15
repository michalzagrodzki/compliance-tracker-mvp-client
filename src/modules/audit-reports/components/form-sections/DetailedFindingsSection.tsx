import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Info } from 'lucide-react';
import { type DetailedFinding } from '../../types';

interface DetailedFindingsSectionProps {
  findings: DetailedFinding[];
  onAddFinding: () => void;
  onUpdateFinding: (index: number, field: keyof DetailedFinding, value: any) => void;
  onRemoveFinding: (index: number) => void;
}

export default function DetailedFindingsSection({
  findings,
  onAddFinding,
  onUpdateFinding,
  onRemoveFinding
}: DetailedFindingsSectionProps) {
  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <div key={finding.id || `finding-${index}`} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Finding {index + 1}</h4>
            <Button
              type="button"
              onClick={() => onRemoveFinding(index)}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={finding.title}
                onChange={(e) => onUpdateFinding(index, 'title', e.target.value)}
                placeholder="Finding title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <select
                value={finding.severity}
                onChange={(e) => onUpdateFinding(index, 'severity', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              value={finding.category}
              onChange={(e) => onUpdateFinding(index, 'category', e.target.value)}
              placeholder="e.g., Access Control, Data Protection"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={finding.description}
              onChange={(e) => onUpdateFinding(index, 'description', e.target.value)}
              placeholder="Detailed description of the finding"
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Recommendation</label>
            <textarea
              value={finding.recommendation}
              onChange={(e) => onUpdateFinding(index, 'recommendation', e.target.value)}
              placeholder="Recommended actions to address this finding"
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      ))}
      
      {findings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2" />
          <p>No detailed findings added yet</p>
          <p className="text-sm">Click "Add Finding" to create specific audit findings</p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button type="button" onClick={onAddFinding} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Finding
        </Button>
      </div>
    </div>
  );
}