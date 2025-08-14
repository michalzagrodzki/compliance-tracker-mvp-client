import { CheckCircle, AlertCircle, AlertTriangle, XCircle, Shield } from 'lucide-react'
import { getRiskLevelColor } from '@/lib/compliance'

interface RiskLevelBadgeProps {
  level: string
  showIcon?: boolean
  className?: string
}

export const getRiskIcon = (level: string) => {
  switch (level) {
    case 'low': return CheckCircle
    case 'medium': return AlertCircle
    case 'high': return AlertTriangle
    case 'critical': return XCircle
    default: return Shield
  }
}

export default function RiskLevelBadge({ 
  level, 
  showIcon = true, 
  className = '' 
}: RiskLevelBadgeProps) {
  const riskColor = getRiskLevelColor(level)
  const RiskIcon = getRiskIcon(level)

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${riskColor} flex items-center space-x-1 ${className}`}>
      {showIcon && <RiskIcon className="h-3 w-3" />}
      <span>{level.toUpperCase()} RISK</span>
    </span>
  )
}