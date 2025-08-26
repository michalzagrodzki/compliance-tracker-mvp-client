import { Card, CardContent } from '@/components/ui/card'
import RiskLevelBadge, { getRiskIcon } from '@/components/shared/RiskLevelBadge'
import BusinessImpactBadge from '@/components/shared/BusinessImpactBadge'
import ComplianceStatusBadge from '@/components/shared/ComplianceStatusBadge'
import { formatDate, hasRecommendation } from '@/lib/compliance'
import { ArrowRight, BookOpen, Calendar, Eye, FileText, Lightbulb, Shield, User } from 'lucide-react'
import { safeReplaceUnderscore } from '@/lib/utils'
import type { ComplianceGapResponse } from '../../types'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'

interface SessionGapItemProps {
  gap: ComplianceGapResponse
}

export default function SessionGapItem({ gap }: SessionGapItemProps) {
  const IconComponent = getRiskIcon(gap.risk_level)
  return (
    <Card key={gap.id} className="hover:shadow-md transition-shadow mx-4 my-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-foreground">{gap.gap_title}</h4>
                  <div className="flex items-center space-x-1">
                    <RiskLevelBadge level={gap.risk_level} showIcon={false} />
                    <BusinessImpactBadge level={gap.business_impact} />
                    <ComplianceStatusBadge status={gap.status} />
                  </div>
                </div>
                {gap.iso_control && (
                  <div className="flex items-center space-x-1 mb-2">
                    <BookOpen className="h-3 w-3 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">ISO Control: {gap.iso_control}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-2">{gap.gap_description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {hasRecommendation(gap.recommendation_text) && (
                      <div className="flex items-center space-x-1">
                        <span className="px-2 py-1 rounded border border-gray-300 text-gray-500 bg-grey-50 text-xs font-medium">
                          Recommendation is available
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>Detected: {formatDate(gap.detected_at)}</span>
                    </div>
                    
                    {gap.recommendation_type && (
                      <div className="flex items-center space-x-1">
                        <Lightbulb className="h-3 w-3" />
                        <span>Recommendation type: {safeReplaceUnderscore(gap.recommendation_type)}</span>
                      </div>
                    )}

                    {gap.regulatory_requirement && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Regulatory Requirement: { gap.regulatory_requirement }</span>
                      </div>
                    )}
                                                
                    {gap.assigned_to && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Assigned: { gap.assigned_to }</span>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

