import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Target } from 'lucide-react'
import { formatRecommendationContent } from '@/lib/gap-detail'

interface RecommendationsProps {
  recommendation_type?: string | null
  recommendation_text?: string | null
  recommended_actions?: string[] | null
}

export default function Recommendations({ recommendation_type, recommendation_text, recommended_actions }: RecommendationsProps) {
  const hasActions = !!(recommended_actions && recommended_actions.length > 0)
  const hasText = !!(recommendation_text && recommendation_text.trim())
  if (!hasActions && !hasText && !recommendation_type) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation_type && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommendation Type</h4>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{recommendation_type.replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {hasText && (
          <div>
            <div className="p-4 bg-gray-100 border border-gray-300 rounded-md">
              <div className="prose prose-sm max-w-none">{formatRecommendationContent(recommendation_text!)}</div>
            </div>
          </div>
        )}

        {hasActions && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              {recommended_actions!.map((action, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">{index + 1}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-green-900">{action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasText && !hasActions && (
          <div className="text-center py-6">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

