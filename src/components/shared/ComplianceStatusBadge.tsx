import { getStatusColor } from '@/lib/compliance'

interface ComplianceStatusBadgeProps {
  status: string
  className?: string
}

export default function ComplianceStatusBadge({ 
  status, 
  className = '' 
}: ComplianceStatusBadgeProps) {
  const statusColor = getStatusColor(status)

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColor} flex items-center space-x-1 ${className}`}>
      <span>{status.replace('_', ' ').toUpperCase()}</span>
    </span>
  )
}