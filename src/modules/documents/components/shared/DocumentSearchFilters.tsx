import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import type { ComplianceDomain } from '../../types'

interface DocumentSearchFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedDomain: string
  setSelectedDomain: (domain: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  complianceDomains: ComplianceDomain[]
  onSearch: () => void
  onReset: () => void
  isLoading?: boolean
}

export default function DocumentSearchFilters({
  searchTerm,
  setSearchTerm,
  selectedDomain,
  setSelectedDomain,
  selectedStatus,
  setSelectedStatus,
  complianceDomains,
  onSearch,
  onReset,
  isLoading = false
}: DocumentSearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              disabled={isLoading}
            />
          </div>
        </div>
        <Button 
          onClick={() => setShowFilters(!showFilters)} 
          variant="outline"
          disabled={isLoading}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button onClick={onSearch} disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Compliance Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">All domains</option>
              {complianceDomains.map((domain) => (
                <option key={domain.code} value={domain.code}>
                  {domain.code} - {domain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Processing Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">All statuses</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="md:col-span-3 flex space-x-2">
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