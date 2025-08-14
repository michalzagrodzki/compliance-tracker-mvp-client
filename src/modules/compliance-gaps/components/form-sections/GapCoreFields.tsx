/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input } from '@/components/ui/input';
import IsoControlSelector from '@/components/shared/IsoControlSelector';

interface GapCoreFieldsProps {
  showTitle?: boolean;
  showCategory?: boolean;
  showDescription?: boolean;
  showIsoSelector?: boolean;

  gapTitle?: string;
  onTitleChange?: (value: string) => void;

  gapCategory?: string;
  onCategoryChange?: (value: string) => void;

  gapDescription?: string;
  onDescriptionChange?: (value: string) => void;

  isoControl?: string | null;
  onIsoControlChange?: (value: string) => void;
}

const GapCoreFields: React.FC<GapCoreFieldsProps> = ({
  showTitle = true,
  showCategory = true,
  showDescription = true,
  showIsoSelector = true,
  gapTitle = '',
  onTitleChange,
  gapCategory = '',
  onCategoryChange,
  gapDescription = '',
  onDescriptionChange,
  isoControl = '',
  onIsoControlChange,
}) => {
  return (
    <>
      {(showTitle || showCategory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showCategory && (
            <div className="space-y-2">
              <label htmlFor="gap_category" className="text-sm font-medium">Gap Category *</label>
              <Input
                id="gap_category"
                value={gapCategory}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                placeholder="e.g., A.12.6.1 - Management of technical vulnerabilities"
                required
              />
              <p className="text-xs text-muted-foreground">
                Specific control or requirement category this gap relates to
              </p>
            </div>
          )}

          {showTitle && (
            <div className="space-y-2">
              <label htmlFor="gap_title" className="text-sm font-medium">Gap Title *</label>
              <Input
                id="gap_title"
                value={gapTitle}
                onChange={(e) => onTitleChange?.(e.target.value)}
                placeholder="Brief, descriptive title for the gap"
                required
              />
              <p className="text-xs text-muted-foreground">
                Clear, concise title that summarizes the compliance gap
              </p>
            </div>
          )}
        </div>
      )}

      {(showDescription || showIsoSelector) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showDescription && (
            <div className="space-y-2">
              <label htmlFor="gap_description" className="text-sm font-medium">Gap Description *</label>
              <textarea
                id="gap_description"
                value={gapDescription}
                onChange={(e) => onDescriptionChange?.(e.target.value)}
                placeholder="Detailed description of the compliance gap..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
              <p className="text-xs text-muted-foreground">
                Detailed explanation of what is missing or inadequate in current compliance posture
              </p>
            </div>
          )}

          {showIsoSelector && (
            <IsoControlSelector
              value={isoControl || ''}
              onChange={(v) => onIsoControlChange?.(v)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default GapCoreFields;
