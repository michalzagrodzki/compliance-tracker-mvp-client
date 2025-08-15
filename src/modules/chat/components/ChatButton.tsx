import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router'

interface ChatButtonProps {
  sessionId: string
  chatId?: string
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ChatButton({
  sessionId,
  chatId,
  children,
  variant = 'default',
  size = 'default',
  className = '',
}: ChatButtonProps) {
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleChatClick = async () => {
    setIsNavigating(true)
    
    try {
      const targetChatId = chatId || `${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()}`
      const chatUrl = `/audit-sessions/${sessionId}/chat/${targetChatId}`
      
      navigate(chatUrl)
    } catch (error) {
      console.error('Error navigating to chat:', error)
    } finally {
      setIsNavigating(false)
    }
  }

  const defaultContent = chatId ? (
    <>
      <ExternalLink className="h-4 w-4 mr-2" />
      Continue Chat
    </>
  ) : (
    <>
      <MessageSquare className="h-4 w-4 mr-2" />
      Start Chat
    </>
  )

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleChatClick}
      disabled={isNavigating}
    >
      {children || defaultContent}
    </Button>
  )
}