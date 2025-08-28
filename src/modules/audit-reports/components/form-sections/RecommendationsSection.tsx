/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Info } from 'lucide-react';
import { type Recommendation } from '../../types';

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  onAddRecommendation: () => void;
  onUpdateRecommendation: (index: number, field: keyof Recommendation, value: any) => void;
  onRemoveRecommendation: (index: number) => void;
}

export default function RecommendationsSection({
  recommendations,
  onAddRecommendation,
  onUpdateRecommendation,
  onRemoveRecommendation
}: RecommendationsSectionProps) {
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <div key={recommendation.id || `recommendation-${index}`} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recommendation {index + 1}</h4>
            <Button
              type="button"
              onClick={() => onRemoveRecommendation(index)}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={recommendation.title}
                onChange={(e) => onUpdateRecommendation(index, 'title', e.target.value)}
                placeholder="Recommendation title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={recommendation.priority}
                onChange={(e) => onUpdateRecommendation(index, 'priority', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                value={recommendation.category}
                onChange={(e) => onUpdateRecommendation(index, 'category', e.target.value)}
                placeholder="e.g., process_improvement, policy_update"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Effort</label>
              <Input
                value={recommendation.estimated_effort}
                onChange={(e) => onUpdateRecommendation(index, 'estimated_effort', e.target.value)}
                placeholder="e.g., 2-4 weeks, 1 month"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={recommendation.description}
              onChange={(e) => onUpdateRecommendation(index, 'description', e.target.value)}
              placeholder="Detailed description of the recommendation"
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      ))}
      
      {recommendations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2" />
          <p>No recommendations added yet</p>
          <p className="text-sm">Click "Generate Recommendations" to generate strategic recommendations</p>
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button type="button" onClick={onAddRecommendation} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Generate Recommendations
        </Button>
      </div>
    </div>
  );
}