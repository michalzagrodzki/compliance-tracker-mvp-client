/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import { useComplianceGap } from '../hooks/useComplianceGap'
import Loading from '@/components/Loading'
import SectionLoading from '@/components/shared/SectionLoading'
import { Shield, Plus } from 'lucide-react'
import GapsSearchFilters from './list/GapsSearchFilters'
import ErrorDisplay from '@/modules/documents/components/shared/ErrorDisplay'
import SessionHeader from './list/SessionHeader'
import SessionGapItem from './list/SessionGapItem'
import type { ComplianceGapResponse, RiskLevel, GapStatus } from '../types'

const groupGapsByAuditSession = (gaps: ComplianceGapResponse[]) => {
  const grouped = gaps.reduce((acc, gap) => {
    const sessionId = gap.audit_session_id || 'no-session'
    if (!acc[sessionId]) {
      acc[sessionId] = []
    }
    acc[sessionId].push(gap)
    return acc
  }, {} as Record<string, ComplianceGapResponse[]>)

  Object.keys(grouped).forEach(sessionId => {
    grouped[sessionId].sort((a, b) => 
      new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
    )
  })

  return grouped
}

const calculateSessionStats = (gaps: ComplianceGapResponse[]) => {
  const stats = {
    total: gaps.length,
    byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 },
    byStatus: { identified: 0, acknowledged: 0, in_progress: 0, resolved: 0, false_positive: 0, accepted_risk: 0 },
    totalPotentialFines: 0,
    averageConfidenceScore: 0
  }

  gaps.forEach(gap => {
    stats.byRiskLevel[gap.risk_level as RiskLevel]++
    stats.byStatus[gap.status as GapStatus]++
    stats.totalPotentialFines += gap.potential_fine_amount || 0
    stats.averageConfidenceScore += gap.confidence_score || 0
  })

  stats.averageConfidenceScore = gaps.length > 0 ? stats.averageConfidenceScore / gaps.length : 0

  return stats
}

export default function ComplianceGapsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const {
    gaps,
    isLoading,
    error,
    loadGaps,
  } = useComplianceGap()

  useEffect(() => {
    loadGaps({ limit: 100 })
  }, [loadGaps])

  const handleSearch = () => {
    const searchParams: any = { limit: 100 }
    
    if (selectedDomain) {
      searchParams.compliance_domain = selectedDomain
    }

    if (selectedRiskLevel) {
      searchParams.risk_level = selectedRiskLevel
    }

    if (selectedStatus) {
      searchParams.status = selectedStatus
    }
    
    loadGaps(searchParams)
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedDomain('')
    setSelectedRiskLevel('')
    setSelectedStatus('')
    loadGaps({ limit: 100 })
  }

  const filteredGaps = gaps.filter(gap => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      gap.gap_title.toLowerCase().includes(searchLower) ||
      gap.gap_description.toLowerCase().includes(searchLower) ||
      gap.gap_category.toLowerCase().includes(searchLower)
    )
  })

  const groupedGaps = groupGapsByAuditSession(filteredGaps)
  const sessionIds = Object.keys(groupedGaps).sort()

  if (isLoading && gaps.length === 0) {
    return (
      <SectionLoading
        title="Compliance Gaps"
        description="Fetching gaps and session summaries..."
        icon={Shield}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Gaps"
        description="Monitor and manage compliance gaps across audit sessions"
        actionButton={{
          href: "/compliance-gaps/new",
          icon: <Plus className="h-4 w-4" />,
          text: "Start New Compliance Gap",
          asChild: true
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <GapsSearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDomain={selectedDomain}
            setSelectedDomain={setSelectedDomain}
            selectedRiskLevel={selectedRiskLevel}
            setSelectedRiskLevel={setSelectedRiskLevel}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {error && <ErrorDisplay error={error} />}

      {filteredGaps.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No compliance gaps found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || selectedDomain || selectedRiskLevel || selectedStatus
                  ? 'Try adjusting your search criteria'
                  : 'Start an audit session to identify compliance gaps'
                }
              </p>
            </div>
            <Button asChild>
              <Link to="/chat" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Start New Audit</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sessionIds.map((sessionId) => {
            const sessionGaps = groupedGaps[sessionId]
            const sessionStats = calculateSessionStats(sessionGaps)
            const latestGap = sessionGaps[0]
            
            return (
              <Card key={sessionId} className="overflow-hidden">
                <SessionHeader sessionId={sessionId} sessionStats={sessionStats} latestGap={latestGap} />
                
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {sessionGaps.map((gap) => (
                      <SessionGapItem key={gap.id} gap={gap} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isLoading && gaps.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      )}
    </div>
  )
}
