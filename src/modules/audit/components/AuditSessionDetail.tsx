import { useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuditSessionStore } from '../store/auditSessionStore'
import Loading from './../../../components/Loading'
import AuditSessionDocuments from './AuditSessionDocuments'
import { ChatButton } from '@/modules/chat';
import AuditSessionChats from './AuditSessionChats'
import AuditSessionComplianceGaps from './AuditSessionComplianceGaps'
import { CompleteSessionDialog } from './CompleteSessionDialog'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Shield,
  User,
  Globe,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Play,
  Square,
  RefreshCw
} from 'lucide-react'
import { GenerateAuditReportDialog } from '@/modules/audit-reports/components/GenerateAuditReportDialog'


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

const getDuration = (startedAt: string, endedAt?: string) => {
  const start = new Date(startedAt)
  const end = endedAt ? new Date(endedAt) : new Date()
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours} hours ${diffMinutes} minutes`
  }
  return `${diffMinutes} minutes`
}

const DOMAIN_INFO = {
  'ISO27001': {
    name: 'ISO/IEC 27001',
    description: 'Information security management systems'
  },
}

export default function AuditSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { currentSession, isLoading, error, fetchSessionById, reactivateSession } = useAuditSessionStore()

  useEffect(() => {
    if (sessionId) {
      fetchSessionById(sessionId)
    }
  }, [sessionId, fetchSessionById])


  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-sessions" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sessions</span>
            </Link>
          </Button>
        </div>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center space-x-2 pt-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive">{error}</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-sessions" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sessions</span>
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Session not found</h3>
            <p className="text-muted-foreground">The audit session you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const domainInfo = DOMAIN_INFO[currentSession.compliance_domain as keyof typeof DOMAIN_INFO]
  const isActive = currentSession.is_active
  const isAuditReportEmpty =
    currentSession.audit_report !== null ||
    currentSession.audit_report !== undefined ||
    currentSession.audit_report !== "";
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-sessions" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sessions</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentSession.session_name}</h1>
            <p className="text-muted-foreground">Audit Session Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isActive ? (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <Play className="h-3 w-3" />
              <span>Active Session</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <Square className="h-3 w-3" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Session Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Compliance Domain</h4>
                  <div>
                    <p className="font-semibold">{currentSession.compliance_domain}</p>
                    {domainInfo && (
                      <div className="text-sm text-muted-foreground">
                        <p>{domainInfo.name}</p>
                        <p>{domainInfo.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                  <div className="flex items-center space-x-2">
                    {isActive ? (
                      <>
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600 font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Completed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Started</h4>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(currentSession.started_at)}</span>
                  </div>
                </div>
                {currentSession.ended_at && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Completed</h4>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(currentSession.ended_at)}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Duration</h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{getDuration(currentSession.started_at, currentSession.ended_at)}</span>
                  </div>
                </div>
                {currentSession.total_queries !== undefined && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Total Queries</h4>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{currentSession.total_queries} queries processed</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session Actions</CardTitle>
              <CardDescription>
                Manage your audit session and generate reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <ChatButton
                  sessionId={currentSession.id}
                  sessionName={currentSession.session_name}
                  complianceDomain={currentSession.compliance_domain}
                />
                <GenerateAuditReportDialog
                  disabled={isAuditReportEmpty}
                  sessionId={currentSession.id}
                  sessionName={currentSession.session_name}
                  complianceDomain={currentSession.compliance_domain}
                  startedAt={currentSession.started_at}
                />
                {isAuditReportEmpty ? (
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    disabled
                  >
                    <Download className="h-4 w-4" />
                    <span>Create Manually Audit Report</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    asChild
                  >
                    <Link to={`/audit-sessions/${currentSession.id}/create-report`}>
                      <Download className="h-4 w-4" />
                      <span>Create Manually Audit Report</span>
                    </Link>
                  </Button>
                )}
                { isActive ? (
                  <CompleteSessionDialog sessionId={currentSession.id} />
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => reactivateSession(currentSession.id)}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reactivate Session</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          <AuditSessionComplianceGaps 
            sessionId={currentSession.id}
            complianceDomain={currentSession.compliance_domain}
          />
          <AuditSessionChats 
            sessionId={currentSession.id}
            sessionName={currentSession.session_name}
            complianceDomain={currentSession.compliance_domain}
          />
          <AuditSessionDocuments sessionId={currentSession.id} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Session ID</h4>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {currentSession.id}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">User ID</h4>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono">{currentSession.user_id}</span>
                </div>
              </div>

              {currentSession.ip_address && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">IP Address</h4>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentSession.ip_address}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentSession.created_at)}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentSession.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Framework</CardTitle>
            </CardHeader>
            <CardContent>
              {domainInfo ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-primary">{currentSession.compliance_domain}</h4>
                    <p className="text-sm font-medium">{domainInfo.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {domainInfo.description}
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold">{currentSession.compliance_domain}</h4>
                  <p className="text-sm text-muted-foreground">Custom compliance framework</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}