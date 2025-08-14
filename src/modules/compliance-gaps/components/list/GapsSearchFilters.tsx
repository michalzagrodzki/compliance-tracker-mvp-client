import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'

interface GapsSearchFiltersProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  selectedDomain: string
  setSelectedDomain: (v: string) => void
  selectedRiskLevel: string
  setSelectedRiskLevel: (v: string) => void
  selectedStatus: string
  setSelectedStatus: (v: string) => void
  onSearch: () => void
  onReset: () => void
  isLoading?: boolean
}

export default function GapsSearchFilters({
  searchTerm,
  setSearchTerm,
  selectedDomain,
  setSelectedDomain,
  selectedRiskLevel,
  setSelectedRiskLevel,
  selectedStatus,
  setSelectedStatus,
  onSearch,
  onReset,
  isLoading = false,
}: GapsSearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search compliance gaps by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              disabled={isLoading}
            />
          </div>
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" disabled={isLoading}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button onClick={onSearch} disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Compliance Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">All domains</option>
              <option value="ISO27001">ISO27001</option>
              <option value="GDPR">GDPR</option>
              <option value="SOX">SOX</option>
              <option value="HIPAA">HIPAA</option>
              <option value="PCI_DSS">PCI DSS</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Level</label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">All risk levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">All statuses</option>
              <option value="identified">Identified</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
              <option value="accepted_risk">Accepted Risk</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <Button onClick={onSearch} size="sm" disabled={isLoading}>
              Apply Filters
            </Button>
            <Button onClick={onReset} variant="outline" size="sm" disabled={isLoading}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

