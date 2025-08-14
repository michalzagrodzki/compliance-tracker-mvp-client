import { getBusinessImpactColor } from '@/lib/compliance'

interface BusinessImpactBadgeProps {
  level?: string
  showIcon?: boolean
  className?: string
}

export default function BusinessImpactBadge({ 
  level, 
  showIcon = false, 
  className = '' 
}: BusinessImpactBadgeProps) {
  if (!level) return null

  const impactColor = getBusinessImpactColor(level)

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${impactColor} flex items-center space-x-1 ${className}`}>
      <span>{level.toUpperCase()} IMPACT</span>
    </span>
  )
}