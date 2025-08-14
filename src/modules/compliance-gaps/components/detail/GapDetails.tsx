/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ShieldCheck, Target, FileText, Zap } from 'lucide-react'
import { getRiskLevelColor, getBusinessImpactColor } from '@/lib/compliance'
import { getRiskIcon as getRiskIconComp } from '@/components/shared/RiskLevelBadge'

interface GapDetailsProps {
  gap: any
}

export default function GapDetails({ gap }: GapDetailsProps) {
  const RiskIcon = getRiskIconComp(gap.risk_level)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Gap Details</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p className="text-sm leading-relaxed">{gap.gap_description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Gap Type</h4>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{gap.gap_type.replace('_', ' ')}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Category</h4>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{gap.gap_category}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">ISO Control:</h4>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span>{gap.iso_control}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Risk Level</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(gap.risk_level)}`}>
                <RiskIcon className="h-4 w-4" />
                <span className="ml-1">{gap.risk_level.toUpperCase()}</span>
              </span>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Business Impact</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getBusinessImpactColor(gap.business_impact)}`}>
                {gap.business_impact.toUpperCase()}
              </span>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Confidence Score</h4>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span>{Math.round((gap.confidence_score || 0) * 100)}%</span>
              </div>
            </div>

            {gap.regulatory_requirement && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Regulatory Requirement</h4>
                <div className="flex items-center space-x-2 text-red-600">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Yes</span>
                </div>
              </div>
            )}
          </div>

          {gap.potential_fine_amount && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Potential Fine: ${gap.potential_fine_amount.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

