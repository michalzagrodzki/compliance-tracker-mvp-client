import { type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description: string
  actionButton?: {
    href?: string
    onClick?: () => void
    icon?: ReactNode
    text: string
    asChild?: boolean
  }
}

export default function PageHeader({ title, description, actionButton }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {actionButton && (
        <Button 
          asChild={actionButton.asChild} 
          onClick={actionButton.onClick}
        >
          {actionButton.href && actionButton.asChild ? (
            <Link to={actionButton.href} className="flex items-center space-x-2">
              {actionButton.icon}
              <span>{actionButton.text}</span>
            </Link>
          ) : actionButton.href ? (
            <a href={actionButton.href} className="flex items-center space-x-2">
              {actionButton.icon}
              <span>{actionButton.text}</span>
            </a>
          ) : (
            <div className="flex items-center space-x-2">
              {actionButton.icon}
              <span>{actionButton.text}</span>
            </div>
          )}
        </Button>
      )}
    </div>
  )
}