import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, History } from 'lucide-react'
import { formatDate } from '@/lib/compliance'

interface TimelineProps {
  detected_at: string
  created_at?: string
  updated_at?: string
}

export default function Timeline({ detected_at, created_at, updated_at }: TimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Detected</p>
              <p className="text-xs text-muted-foreground">{formatDate(detected_at)}</p>
            </div>
          </div>
          {created_at && (
            <div className="flex items-center space-x-3">
              <History className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-xs text-muted-foreground">{formatDate(created_at)}</p>
              </div>
            </div>
          )}
          {updated_at && (
            <div className="flex items-center space-x-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-xs text-muted-foreground">{formatDate(updated_at)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

