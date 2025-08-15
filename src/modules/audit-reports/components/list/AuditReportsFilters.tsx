import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  REPORT_TYPE_OPTIONS,
  TARGET_AUDIENCE_OPTIONS,
  CONFIDENTIALITY_LEVEL_OPTIONS,
} from '../../types';

export type ReportFilters = {
  reportType: string;
  targetAudience: string;
  confidentialityLevel: string;
  dateRange: string;
};

type Props = {
  searchTerm: string;
  onSearch: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filters: ReportFilters;
  onFilterChange: (key: keyof ReportFilters, value: string) => void;
  onClear: () => void;
};

export default function AuditReportsFilters({
  searchTerm,
  onSearch,
  showFilters,
  onToggleFilters,
  filters,
  onFilterChange,
  onClear,
}: Props) {
  const hasAnyFilter = Boolean(
    searchTerm || Object.values(filters).some((f) => f)
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by title or compliance domain..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={onToggleFilters}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            {hasAnyFilter && (
              <Button
                variant="ghost"
                onClick={onClear}
                className="text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <select
                  value={filters.reportType}
                  onChange={(e) => onFilterChange('reportType', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Types</option>
                  {REPORT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <select
                  value={filters.targetAudience}
                  onChange={(e) => onFilterChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Audiences</option>
                  {TARGET_AUDIENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confidentiality</label>
                <select
                  value={filters.confidentialityLevel}
                  onChange={(e) =>
                    onFilterChange('confidentialityLevel', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Levels</option>
                  {CONFIDENTIALITY_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

