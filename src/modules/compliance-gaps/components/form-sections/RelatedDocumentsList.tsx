 
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

interface RelatedDocumentsListProps {
  documents: string[];
  onChange: (newDocuments: string[]) => void;
  addPlaceholder?: string;
}

const RelatedDocumentsList: React.FC<RelatedDocumentsListProps> = ({
  documents,
  onChange,
  addPlaceholder = 'Add related document...',
}) => {
  const [newDoc, setNewDoc] = useState('');

  const add = () => {
    if (!newDoc.trim()) return;
    onChange([...(documents || []), newDoc.trim()]);
    setNewDoc('');
  };

  const remove = (index: number) => {
    onChange((documents || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Related Documents</label>
      <div className="space-y-2">
        {(documents || []).map((doc, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input value={doc} readOnly className="flex-1" />
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
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            placeholder={addPlaceholder}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={!newDoc.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatedDocumentsList;

