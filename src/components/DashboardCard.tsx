import React from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, type LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  description: string
  icon: LucideIcon
  linkTo: string
  linkTitle: string
  variant?: 'default' | 'outline'
  className?: string
}

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  linkTo,
  linkTitle,
  variant = 'default',
  className = ''
}: DashboardCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Icon className="h-6 w-6 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant={variant} className="w-full">
          <Link to={linkTo} className="flex items-center space-x-2">
            <span>{linkTitle}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}