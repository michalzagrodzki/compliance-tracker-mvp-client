/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Target,
  DollarSign,
  Zap,
  Eye,
  ArrowRight,
  TriangleAlert
} from 'lucide-react'
import { useComplianceGap } from '@/modules/compliance-gaps/hooks/useComplianceGap'
import type { BusinessImpactLevel, GapStatus, RiskLevel } from '@/modules/compliance-gaps/types'


interface AuditSessionComplianceGapsProps {
  sessionId: string
  sessionName: string
  complianceDomain: string
}

export default function AuditSessionComplianceGaps({ 
  sessionId, 
  sessionName, 
  complianceDomain 
}: AuditSessionComplianceGapsProps) {
  const {
    gaps,
    isLoading,
    error,
    loadSessionGaps,
    clearError
  } = useComplianceGap()

  const [stats, setStats] = useState<{
    total: number;
    byRiskLevel: Record<RiskLevel, number>;
    byBusinessImpact: Record<BusinessImpactLevel, number>;
    byStatus: Record<GapStatus, number>;
    totalPotentialFines: number;
    averageConfidenceScore: number;
  }>({
    total: 0,
    byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 },
    byBusinessImpact: { low: 0, medium: 0, high: 0, critical: 0 },
    byStatus: { identified: 0, acknowledged: 0, in_progress: 0, resolved: 0, false_positive: 0, accepted_risk: 0 },
    totalPotentialFines: 0,
    averageConfidenceScore: 0
  });

  const loadGaps = useCallback(async () => {
    try {
      await loadSessionGaps(sessionId)
    } catch (error) {
      console.error('Error loading compliance gaps:', error)
    }
  }, [sessionId, loadSessionGaps])

  useEffect(() => {
    loadGaps()
  }, [loadGaps])

  // Calculate statistics when gaps change
  useEffect(() => {
    const newStats = {
      total: gaps.length,
      byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 } as Record<RiskLevel, number>,
      byBusinessImpact: { low: 0, medium: 0, high: 0, critical: 0 } as Record<BusinessImpactLevel, number>,
      byStatus: { identified: 0, acknowledged: 0, in_progress: 0, resolved: 0, false_positive: 0, accepted_risk: 0 } as Record<GapStatus, number>,
      totalPotentialFines: 0,
      averageConfidenceScore: 0
    }
  
    gaps.forEach(gap => {
      // Type-safe access with proper type assertions
      const riskLevel = gap.risk_level as RiskLevel;
      const businessImpact = gap.business_impact as BusinessImpactLevel;
      const status = gap.status as GapStatus;
      
      if (riskLevel in newStats.byRiskLevel) {
        newStats.byRiskLevel[riskLevel]++;
      }
      
      if (businessImpact in newStats.byBusinessImpact) {
        newStats.byBusinessImpact[businessImpact]++;
      }
      
      if (status in newStats.byStatus) {
        newStats.byStatus[status]++;
      }
      
      newStats.totalPotentialFines += gap.potential_fine_amount || 0;
      newStats.averageConfidenceScore += gap.confidence_score || 0;
    });
  
    newStats.averageConfidenceScore = gaps.length > 0 ? newStats.averageConfidenceScore / gaps.length : 0;
  
    setStats(newStats);
  }, [gaps]);

  const handleRefresh = useCallback(() => {
    loadGaps()
  }, [loadGaps])

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getBusinessImpactColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'medium': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'high': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'critical': return 'text-pink-600 bg-pink-50 border-pink-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'identified': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'acknowledged': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'in_progress': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'false_positive': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'accepted_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />
      case 'medium': return <AlertCircle className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <XCircle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TriangleAlert className="h-5 w-5" />
            <span>Compliance Gaps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading compliance gaps...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TriangleAlert className="h-5 w-5" />
              <span>Compliance Gaps</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({stats.total})
              </span>
            </CardTitle>
            <CardDescription>
              Identified compliance gaps and risk assessments for this audit session
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {gaps.length === 0 ? (
          <div className="text-center py-8">
            <TriangleAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No compliance gaps identified</h3>
            <p className="text-muted-foreground">
              Great! No compliance gaps have been identified during this audit session.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Gaps</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Critical Risk</p>
                  <p className="text-2xl font-bold text-red-600">{stats.byRiskLevel.critical}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">High Impact</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.byBusinessImpact.high + stats.byBusinessImpact.critical}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Potential Fines</p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.totalPotentialFines > 0 ? `$${stats.totalPotentialFines.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(stats.byRiskLevel).map(([level, count]) => (
                <div key={level} className={`p-3 rounded-lg border ${getRiskLevelColor(level)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(level)}
                      <span className="text-sm font-medium capitalize">{level} Risk</span>
                    </div>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Identified Gaps</h4>
              {gaps.map((gap) => (
                <Card key={gap.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRiskIcon(gap.risk_level)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-foreground">
                                {gap.gap_title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(gap.risk_level)}`}>
                                  {gap.risk_level.toUpperCase()} RISK
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusinessImpactColor(gap.business_impact)}`}>
                                  {gap.business_impact.toUpperCase()} IMPACT
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gap.status)}`}>
                                  {gap.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {gap.gap_description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>Category: {gap.gap_category}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Detected: {getRelativeTime(gap.detected_at)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>Type: {gap.gap_type.replace('_', ' ')}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <Zap className="h-3 w-3" />
                                <span>Confidence: {Math.round((gap.confidence_score || 0) * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pl-11">
                          <div className="flex items-center space-x-4">
                            {gap.regulatory_requirement && (
                              <div className="flex items-center space-x-1 text-red-600">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Regulatory Requirement</span>
                              </div>
                            )}
                            
                            {gap.potential_fine_amount && (
                              <div className="flex items-center space-x-1 text-orange-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Potential Fine: ${gap.potential_fine_amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            
                            {gap.assigned_to && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">Assigned</span>
                              </div>
                            )}
                            
                            {gap.due_date && (
                              <div className="flex items-center space-x-1 text-purple-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Due: {formatDate(gap.due_date)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Navigate to compliance gap detail view
                                console.log('Navigate to gap detail:', gap.id)
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}