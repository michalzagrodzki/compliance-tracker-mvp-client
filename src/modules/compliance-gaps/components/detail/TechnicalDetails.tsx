import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TechnicalDetailsProps {
  id: string
  gap_type: string
  confidence_score?: number | null
}

export default function TechnicalDetails({ id, gap_type, confidence_score }: TechnicalDetailsProps) {
  const score = Math.round((confidence_score || 0) * 100)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Technical Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Gap ID</h4>
          <p className="text-xs font-mono bg-muted p-2 rounded break-all">{id}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Gap Type</h4>
          <p className="text-sm">{gap_type?.replace('_', ' ') || 'Unknown'}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Confidence Score</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-medium">{score}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

