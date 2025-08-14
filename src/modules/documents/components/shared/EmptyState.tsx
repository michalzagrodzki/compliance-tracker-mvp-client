import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  showAction?: boolean
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel = "Upload Document",
  actionTo = "/documents/upload",
  showAction = true
}: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        </div>
        {showAction && (
          <Button asChild>
            <Link to={actionTo} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{actionLabel}</span>
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}