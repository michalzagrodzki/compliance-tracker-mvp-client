/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useComplianceGap } from '../hooks/useComplianceGap'
import Loading from '@/components/Loading'
import { 
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  User,
  Calendar,
  Target,
  DollarSign,
  Zap,
  Eye,
  ArrowRight,
  Activity,
  Clock,
  Building,
  Plus
} from 'lucide-react'
import type { ComplianceGapResponse, RiskLevel, GapStatus } from '../types'

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-700 border-green-200'
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'critical': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'identified': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'acknowledged': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
    case 'false_positive': return 'bg-gray-100 text-gray-700 border-gray-200'
    case 'accepted_risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'low': return <CheckCircle className="h-4 w-4" />
    case 'medium': return <AlertCircle className="h-4 w-4" />
    case 'high': return <AlertTriangle className="h-4 w-4" />
    case 'critical': return <XCircle className="h-4 w-4" />
    default: return <Shield className="h-4 w-4" />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'identified': return <AlertTriangle className="h-4 w-4" />
    case 'acknowledged': return <Eye className="h-4 w-4" />
    case 'in_progress': return <Activity className="h-4 w-4" />
    case 'resolved': return <CheckCircle className="h-4 w-4" />
    case 'false_positive': return <XCircle className="h-4 w-4" />
    case 'accepted_risk': return <Shield className="h-4 w-4" />
    default: return <AlertCircle className="h-4 w-4" />
  }
}

const DOMAIN_COLORS = {
  'ISO27001': 'bg-green-100 text-green-700 border-green-200',
  'GDPR': 'bg-blue-100 text-blue-700 border-blue-200',
  'SOX': 'bg-purple-100 text-purple-700 border-purple-200',
  'HIPAA': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'PCI_DSS': 'bg-orange-100 text-orange-700 border-orange-200',
  'DEFAULT': 'bg-gray-100 text-gray-700 border-gray-200'
}

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
  const [showFilters, setShowFilters] = useState(false)

  const {
    gaps,
    isLoading,
    error,
    loadGaps,
    clearError
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

  // Filter gaps based on search term
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
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Gaps</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage compliance gaps across audit sessions
          </p>
        </div>
        <Button asChild>
          <Link to="/chat" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Start New Audit</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
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
                  />
                </div>
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button onClick={handleSearch}>
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
                  <Button onClick={handleSearch} size="sm">
                    Apply Filters
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

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
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5" />
                        <span>
                          {sessionId === 'no-session' ? 'Unassigned Gaps' : `Audit Session`}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                          ({sessionStats.total} gaps)
                        </span>
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
                          <Link to={`/audit-sessions/${sessionId}`}>
                            View Session
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {sessionGaps.map((gap, index) => {
                      const domainColor = DOMAIN_COLORS[gap.compliance_domain as keyof typeof DOMAIN_COLORS] || DOMAIN_COLORS.DEFAULT
                      const riskColor = getRiskLevelColor(gap.risk_level)
                      const statusColor = getStatusColor(gap.status)
                      const riskIcon = getRiskIcon(gap.risk_level)
                      const statusIcon = getStatusIcon(gap.status)

                      return (
                        <div
                          key={gap.id}
                          className={`p-4 hover:bg-muted/20 transition-colors ${
                            index < sessionGaps.length - 1 ? 'border-b' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {riskIcon}
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <Link 
                                    to={`/compliance-gaps/${gap.id}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    <h4 className="font-medium text-foreground hover:underline">
                                      {gap.gap_title}
                                    </h4>
                                  </Link>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {gap.gap_description}
                                  </p>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                                    {gap.risk_level.toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                    {statusIcon}
                                    <span className="ml-1">{gap.status.replace('_', ' ').toUpperCase()}</span>
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${domainColor}`}>
                                    {gap.compliance_domain}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-xs text-muted-foreground ml-11">
                                <div className="flex items-center space-x-1">
                                  <Target className="h-3 w-3" />
                                  <span>Type: {gap.gap_type.replace('_', ' ')}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Detected: {getRelativeTime(gap.detected_at)}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Zap className="h-3 w-3" />
                                  <span>Confidence: {Math.round((gap.confidence_score || 0) * 100)}%</span>
                                </div>
                                
                                {gap.potential_fine_amount && (
                                  <div className="flex items-center space-x-1 text-red-600">
                                    <DollarSign className="h-3 w-3" />
                                    <span>Fine: ${gap.potential_fine_amount.toLocaleString()}</span>
                                  </div>
                                )}
                                
                                {gap.assigned_to && (
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <User className="h-3 w-3" />
                                    <span>Assigned</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/compliance-gaps/${gap.id}`}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
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