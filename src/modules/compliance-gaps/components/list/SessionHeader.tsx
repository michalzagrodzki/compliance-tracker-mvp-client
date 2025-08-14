import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building, Calendar, DollarSign, Shield } from 'lucide-react'
import { Link } from 'react-router'
import { getRelativeTime } from '@/lib/compliance'
import type { ComplianceGapResponse, RiskLevel, GapStatus } from '../../types'

interface SessionStats {
  total: number
  byRiskLevel: { low: number; medium: number; high: number; critical: number }
  byStatus: { identified: number; acknowledged: number; in_progress: number; resolved: number; false_positive: number; accepted_risk: number }
  totalPotentialFines: number
  averageConfidenceScore: number
}

interface SessionHeaderProps {
  sessionId: string
  sessionStats: SessionStats
  latestGap: ComplianceGapResponse
}

export default function SessionHeader({ sessionId, sessionStats, latestGap }: SessionHeaderProps) {
  return (
    <CardHeader className="bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>{sessionId === 'no-session' ? 'Unassigned Gaps' : `Audit Session`}</span>
            <span className="text-sm font-normal text-muted-foreground">({sessionStats.total} gaps)</span>
          </CardTitle>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Latest: {getRelativeTime(latestGap.detected_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Domain: {latestGap.compliance_domain}</span>
            </div>
            {sessionStats.totalPotentialFines > 0 && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Potential Fines: ${sessionStats.totalPotentialFines.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium">{sessionStats.byRiskLevel.critical} Critical</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-medium">{sessionStats.byRiskLevel.high} High</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">{sessionStats.byStatus.resolved} Resolved</span>
            </div>
          </div>
          {sessionId !== 'no-session' && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/audit-sessions/${sessionId}`}>View Session</Link>
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  )
}

