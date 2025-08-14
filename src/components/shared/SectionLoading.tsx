import { Card, CardContent } from '@/components/ui/card'
import { type ComponentType } from 'react'

interface SectionLoadingProps {
  title: string
  description?: string
  icon?: ComponentType<{ className?: string }>
}

export default function SectionLoading({ title, description, icon: Icon }: SectionLoadingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              {Icon && (
                <Icon className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Loading</h3>
              {description && (
                <p className="text-muted-foreground max-w-md">{description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

