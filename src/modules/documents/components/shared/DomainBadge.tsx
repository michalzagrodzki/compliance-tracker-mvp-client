import { getDomainColor } from '@/lib/documents'

interface DomainBadgeProps {
  domain?: string
  className?: string
}

export default function DomainBadge({ domain, className = '' }: DomainBadgeProps) {
  if (!domain) return null
  
  const domainColor = getDomainColor(domain)

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${domainColor} ${className}`}>
      {domain}
    </span>
  )
}