import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface SearchTermsListProps {
  terms: string[];
  onChange: (terms: string[]) => void;
  disabled?: boolean;
  addPlaceholder?: string;
}

const SearchTermsList: React.FC<SearchTermsListProps> = ({
  terms,
  onChange,
  disabled = false,
  addPlaceholder = "Add search term...",
}) => {
  const [newTerm, setNewTerm] = useState('');

  const handleAddTerm = () => {
    if (newTerm.trim() && !disabled) {
      onChange([...terms, newTerm.trim()]);
      setNewTerm('');
    }
  };

  const handleRemoveTerm = (index: number) => {
    if (!disabled) {
      onChange(terms.filter((_, i) => i !== index));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTerm();
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Search Terms Used</label>
      <div className="space-y-2">
        {terms.map((term, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input value={term} readOnly className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveTerm(index)}
              disabled={disabled}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <Input
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder={addPlaceholder}
            className="flex-1"
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTerm}
            disabled={disabled || !newTerm.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Keywords or terms that were searched but yielded insufficient results
      </p>
    </div>
  );
};

export default SearchTermsList;