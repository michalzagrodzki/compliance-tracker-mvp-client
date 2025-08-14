 
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

interface RecommendedActionsListProps {
  actions: string[];
  onChange: (newActions: string[]) => void;
  addPlaceholder?: string;
}

const RecommendedActionsList: React.FC<RecommendedActionsListProps> = ({
  actions,
  onChange,
  addPlaceholder = 'Add a recommended action...',
}) => {
  const [newAction, setNewAction] = useState('');

  const add = () => {
    if (!newAction.trim()) return;
    onChange([...(actions || []), newAction.trim()]);
    setNewAction('');
  };

  const remove = (index: number) => {
    onChange((actions || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Recommended Actions</label>
      <div className="space-y-2">
        {(actions || []).map((action, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={action}
              onChange={(e) => {
                const next = [...(actions || [])];
                next[index] = e.target.value;
                onChange(next);
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center space-x-2">
          <Input
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder={addPlaceholder}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={!newAction.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedActionsList;

