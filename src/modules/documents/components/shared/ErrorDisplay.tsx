import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorDisplayProps {
  error: string
  className?: string
}

export default function ErrorDisplay({ error, className = '' }: ErrorDisplayProps) {
  return (
    <Card className={`border-destructive/50 bg-destructive/5 ${className}`}>
      <CardContent className="flex items-center space-x-2 pt-6">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-destructive">{error}</span>
      </CardContent>
    </Card>
  )
}