import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Info } from 'lucide-react';
import { type ActionItem } from '../../types';

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  onAddActionItem: () => void;
  onUpdateActionItem: (index: number, field: keyof ActionItem, value: any) => void;
  onRemoveActionItem: (index: number) => void;
}

export default function ActionItemsSection({
  actionItems,
  onAddActionItem,
  onUpdateActionItem,
  onRemoveActionItem
}: ActionItemsSectionProps) {
  return (
    <div className="space-y-4">
      {actionItems.map((actionItem, index) => (
        <div key={actionItem.id || `action-item-${index}`} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Action Item {index + 1}</h4>
            <Button
              type="button"
              onClick={() => onRemoveActionItem(index)}
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
                value={actionItem.title}
                onChange={(e) => onUpdateActionItem(index, 'title', e.target.value)}
                placeholder="Action item title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={actionItem.priority}
                onChange={(e) => onUpdateActionItem(index, 'priority', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To</label>
              <Input
                value={actionItem.assigned_to || ''}
                onChange={(e) => onUpdateActionItem(index, 'assigned_to', e.target.value)}
                placeholder="Person or team responsible"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={actionItem.due_date || ''}
                onChange={(e) => onUpdateActionItem(index, 'due_date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={actionItem.status}
                onChange={(e) => onUpdateActionItem(index, 'status', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={actionItem.description}
              onChange={(e) => onUpdateActionItem(index, 'description', e.target.value)}
              placeholder="Detailed description of the action item"
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      ))}
      
      {actionItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2" />
          <p>No action items added yet</p>
          <p className="text-sm">Click "Add Action Item" to create specific tasks</p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button type="button" onClick={onAddActionItem} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Action Item
        </Button>
      </div>
    </div>
  );
}