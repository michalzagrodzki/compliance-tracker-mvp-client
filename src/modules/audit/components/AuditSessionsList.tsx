import { useEffect } from 'react'
import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuditSessionStore } from '../store/auditSessionStore'
import { useAuthStore } from '@/modules/auth/store/authStore'
import Loading from './../../../components/Loading'
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  Shield
} from 'lucide-react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDurationText = (startedAt: string, endedAt?: string) => {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes}m`
}

const getStatusInfo = (isActive: boolean, endedAt?: string) => {
  if (isActive) {
    return {
      icon: Clock,
      text: 'Active',
      className: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  } else if (endedAt) {
    return {
      icon: CheckCircle,
      text: 'Completed',
      className: 'text-green-600 bg-green-50 border-green-200'
    }
  } else {
    return {
      icon: AlertCircle,
      text: 'Inactive',
      className: 'text-orange-600 bg-orange-50 border-orange-200'
    }
  }
}

const DOMAIN_COLORS = {
  'ISO27001': 'bg-green-100 text-green-700 border-green-200',
  'DEFAULT': 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function AuditSessionsList() {
  const { sessions, isLoading, error, fetchUserSessions } = useAuditSessionStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.id) {
      fetchUserSessions(user.id)
    }
  }, [user?.id, fetchUserSessions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review your compliance audit sessions
          </p>
        </div>
        <Button asChild>
          <Link to="/audit-sessions/new" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Session</span>
          </Link>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No audit sessions yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first audit session to start tracking compliance activities
              </p>
            </div>
            <Button asChild>
              <Link to="/audit-sessions/new" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create First Session</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const status = getStatusInfo(session.is_active, session.ended_at)
            const StatusIcon = status.icon
            const domainColor = DOMAIN_COLORS[session.compliance_domain as keyof typeof DOMAIN_COLORS] || DOMAIN_COLORS.DEFAULT

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">
                          <Link 
                            to={`/audit-sessions/${session.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {session.session_name}
                          </Link>
                        </CardTitle>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${status.className}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {status.text}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4" />
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${domainColor}`}>
                            {session.compliance_domain}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Started: {formatDate(session.started_at)}</span>
                        </div>
                        {session.ended_at && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Duration: {getDurationText(session.started_at, session.ended_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {session.total_queries !== undefined && (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{session.total_queries} queries</span>
                        </div>
                      )}
                      {!session.is_active && session.ended_at && (
                        <div className="text-xs">
                          Completed: {formatDate(session.ended_at)}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/audit-sessions/${session.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}