/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Plus,
  FileText,
  Calendar
} from 'lucide-react'
import { auditSessionService } from '../services/auditSessionService'
import { ChatButton } from '@/modules/chat/components/ChatButton'

interface Chat {
  id: string
  conversation_id: string
  audit_session_id: string
  compliance_domain: string
  created_at: string
  updated_at: string
  message_count: number
  first_question: string
  last_activity: string
  has_compliance_gaps?: boolean
  gap_count?: number
  user_id?: string
  session_summary?: string
}

interface AuditSessionChatsProps {
  sessionId: string
  sessionName: string
  complianceDomain: string
}

export default function AuditSessionChats({ 
  sessionId, 
  sessionName, 
  complianceDomain 
}: AuditSessionChatsProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  
  const loadChats = useCallback(async () => {
    setLocalLoading(true)
    setLocalError(null)

    try {
      const chatHistory = await auditSessionService.getAuditSessionHistory(sessionId)

      const chatMap = new Map<string, any>()
      
      chatHistory.forEach((item: any) => {
        const conversationId = item.conversation_id || 'default'
        
        if (!chatMap.has(conversationId)) {
          chatMap.set(conversationId, {
            id: conversationId,
            conversation_id: conversationId,
            audit_session_id: sessionId,
            compliance_domain: complianceDomain,
            created_at: item.created_at,
            updated_at: item.created_at,
            message_count: 0,
            first_question: item.question,
            last_activity: item.created_at,
            has_compliance_gaps: false,
            gap_count: 0,
            user_id: item.user_id,
            messages: []
          })
        }
        
        const chat = chatMap.get(conversationId)
        chat.message_count += 2 // question + answer
        chat.last_activity = item.created_at
        chat.updated_at = item.created_at
        chat.messages.push(item)

        const gapKeywords = [
          'gap', 'missing', 'lacking', 'absent', 'incomplete', 'insufficient',
          'non-compliant', 'violation', 'breach', 'issue', 'problem', 'concern',
          'risk', 'vulnerability', 'weakness', 'deficiency'
        ]
        
        const text = (item.question + ' ' + item.answer).toLowerCase()
        const hasGapIndicators = gapKeywords.some(keyword => text.includes(keyword))
        
        if (hasGapIndicators) {
          chat.has_compliance_gaps = true
          chat.gap_count += 1
        }
      })
      
      const chatList = Array.from(chatMap.values()).map(chat => ({
        ...chat,
        session_summary: chat.first_question.length > 100 
          ? chat.first_question.substring(0, 100) + '...' 
          : chat.first_question
      }))

      chatList.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
      
      setChats(chatList)
    } catch (error: any) {
      console.error('Error loading chats:', error)
      setLocalError(error.message || 'Failed to load chat history')
      setChats([])
    } finally {
      setLocalLoading(false)
    }
  }, [sessionId, complianceDomain])

  useEffect(() => {
    if (sessionId && complianceDomain) {
      loadChats()
    }
  }, [sessionId, complianceDomain])

  const handleRefresh = useCallback(() => {
    loadChats()
  }, [])

  const clearError = () => {
    setLocalError(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    }
  }

  if (localLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading chat sessions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Chat Sessions</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({chats.length})
              </span>
            </CardTitle>
            <CardDescription>
              Chat conversations and compliance inquiries for this audit session
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={localLoading}
            >
              <RefreshCw className={`h-4 w-4 ${localLoading ? 'animate-spin' : ''}`} />
            </Button>
            <ChatButton
              sessionId={sessionId}
              sessionName={sessionName}
              complianceDomain={complianceDomain}
              variant="default"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </ChatButton>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {localError && (
          <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>{localError}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {chats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No chat sessions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a chat session to ask questions about compliance requirements and documents
            </p>
            <ChatButton
              sessionId={sessionId}
              sessionName={sessionName}
              complianceDomain={complianceDomain}
            >
              <Plus className="h-4 w-4 mr-2" />
              Start First Chat
            </ChatButton>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-1">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <div className="flex items-baseline space-x-2">
                  <p className="text-sm font-medium">Total Chats</p>
                  <p className="text-lg font-bold">{chats.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div className="flex items-baseline space-x-2">
                  <p className="text-sm font-medium">Total Messages</p>
                  <p className="text-lg font-bold">
                    {chats.reduce((sum, chat) => sum + chat.message_count, 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div className="flex items-baseline space-x-2">
                  <p className="text-sm font-medium">Potential Gaps</p>
                  <p className="text-lg font-bold">
                    {chats.filter(chat => chat.has_compliance_gaps).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat List */}
            <div className="space-y-3">
              {chats.map((chat) => (
                <Card key={chat.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-foreground">
                                Chat Session #{chat.conversation_id.slice(-8)}
                              </h4>
                              {chat.has_compliance_gaps && (
                                <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Potential Gaps ({chat.gap_count})</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {chat.session_summary}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{chat.message_count} messages</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Last: {getRelativeTime(chat.last_activity)}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Started: {formatDate(chat.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {chat.has_compliance_gaps ? (
                              <div className="flex items-center space-x-1 text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  {chat.gap_count} potential compliance gap{chat.gap_count !== 1 ? 's' : ''} identified
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">No compliance issues detected</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <ChatButton
                              sessionId={sessionId}
                              sessionName={sessionName}
                              complianceDomain={complianceDomain}
                              chatId={chat.conversation_id}
                              variant="outline"
                              size="sm"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Continue
                            </ChatButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
