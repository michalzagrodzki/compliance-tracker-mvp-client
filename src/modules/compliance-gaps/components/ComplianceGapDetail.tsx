import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useComplianceGap } from '../hooks/useComplianceGap'
import Loading from '@/components/Loading'
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  Target,
  FileText,
  Edit,
  Save,
  X,
  Activity,
  Zap,
  TrendingUp,
  Users,
  FileSearch,
  History,
  UserCheck,
  Calendar as CalendarIcon,
  ExternalLink,
  Download,
  Share,
  Eye,
} from 'lucide-react'
import type { ComplianceGapResponse, ComplianceGapUpdate, ComplianceGapStatusUpdate, RiskLevel, BusinessImpactLevel, GapStatus } from '../types'

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

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'critical': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getBusinessImpactColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'medium': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'high': return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'critical': return 'text-pink-600 bg-pink-50 border-pink-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'identified': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'acknowledged': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'in_progress': return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
    case 'false_positive': return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'accepted_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'low': return <CheckCircle className="h-4 w-4" />
    case 'medium': return <AlertCircle className="h-4 w-4" />
    case 'high': return <AlertTriangle className="h-4 w-4" />
    case 'critical': return <XCircle className="h-4 w-4" />
    default: return <Shield className="h-4 w-4" />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'identified': return <AlertTriangle className="h-4 w-4" />
    case 'acknowledged': return <Eye className="h-4 w-4" />
    case 'in_progress': return <Activity className="h-4 w-4" />
    case 'resolved': return <CheckCircle className="h-4 w-4" />
    case 'false_positive': return <X className="h-4 w-4" />
    case 'accepted_risk': return <Shield className="h-4 w-4" />
    default: return <AlertCircle className="h-4 w-4" />
  }
}

const calculateBusinessMetrics = (gap: ComplianceGapResponse) => {
  // Calculate estimated cost of non-compliance
  const costOfNonCompliance = gap.potential_fine_amount || 
    (gap.risk_level === 'critical' ? 100000 : 
     gap.risk_level === 'high' ? 50000 :
     gap.risk_level === 'medium' ? 25000 : 10000)

  // Estimate remediation effort in days
  const remediationEffort = 
    gap.risk_level === 'critical' ? 30 :
    gap.risk_level === 'high' ? 21 :
    gap.risk_level === 'medium' ? 14 : 7

  // Business process impact score
  const processImpact = 
    gap.business_impact === 'critical' ? 90 :
    gap.business_impact === 'high' ? 70 :
    gap.business_impact === 'medium' ? 50 : 30

  return {
    costOfNonCompliance,
    remediationEffort,
    processImpact
  }
}

export default function ComplianceGapDetail() {
  const { gapId } = useParams<{ gapId: string }>()
  const {
    currentGap,
    isLoading,
    error,
    loadGap,
    updateGap,
    updateGapStatus,
    assignGap,
    reviewGap,
    clearError
  } = useComplianceGap()

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<ComplianceGapUpdate>({})
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [statusForm, setStatusForm] = useState<ComplianceGapStatusUpdate>({
    status: 'identified',
    resolution_notes: ''
  })
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignForm, setAssignForm] = useState({
    assigned_to: '',
    due_date: ''
  })

  useEffect(() => {
    if (gapId) {
      clearError()
      loadGap(gapId).catch((err) => {
        console.error('Error fetching compliance gap:', err)
      })
    }
  }, [gapId, loadGap, clearError])

  useEffect(() => {
    if (currentGap) {
      // Convert ComplianceGapResponse to ComplianceGapUpdate format
      setEditForm({
        gap_title: currentGap.gap_title,
        gap_description: currentGap.gap_description,
        risk_level: currentGap.risk_level,
        business_impact: currentGap.business_impact,
        regulatory_requirement: currentGap.regulatory_requirement,
        potential_fine_amount: currentGap.potential_fine_amount || undefined,
        assigned_to: currentGap.assigned_to || undefined,
        due_date: currentGap.due_date || undefined,
        resolution_notes: currentGap.resolution_notes || undefined,
        recommendation_type: currentGap.recommendation_type || undefined,
        recommendation_text: currentGap.recommendation_text,
        recommended_actions: currentGap.recommended_actions,
        related_documents: currentGap.related_documents,
        confidence_score: currentGap.confidence_score,
        false_positive_likelihood: currentGap.false_positive_likelihood,
        session_context: currentGap.session_context
      })
      setStatusForm({
        status: currentGap.status,
        resolution_notes: ''
      })
    }
  }, [currentGap])

  const handleSaveEdit = async () => {
    if (!currentGap) return
    
    try {
      await updateGap(currentGap.id, editForm)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating gap:', error)
    }
  }

  const handleStatusUpdate = async () => {
    if (!currentGap) return
    
    try {
      await updateGapStatus(currentGap.id, statusForm)
      setShowStatusUpdate(false)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleAssign = async () => {
    if (!currentGap) return
    
    try {
      await assignGap(currentGap.id, assignForm)
      setShowAssignForm(false)
    } catch (error) {
      console.error('Error assigning gap:', error)
    }
  }

  const handleMarkReviewed = async () => {
    if (!currentGap) return
    
    try {
      await reviewGap(currentGap.id, { reviewer_notes: 'Reviewed from detail view' })
    } catch (error) {
      console.error('Error marking as reviewed:', error)
    }
  }

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
            <Link to="/compliance-gaps" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Compliance Gaps</span>
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

  if (!currentGap) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/compliance-gaps" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Compliance Gaps</span>
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Compliance gap not found</h3>
            <p className="text-muted-foreground">The compliance gap you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const businessMetrics = calculateBusinessMetrics(currentGap)
  const statusIcon = getStatusIcon(currentGap.status)
  const riskIcon = getRiskIcon(currentGap.risk_level)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/compliance-gaps" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Compliance Gaps</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>{currentGap.gap_title}</span>
            </h1>
            <p className="text-muted-foreground">
              {currentGap.gap_category} • Detected {getRelativeTime(currentGap.detected_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRiskLevelColor(currentGap.risk_level)}`}>
            {riskIcon}
            <span className="ml-1">{currentGap.risk_level.toUpperCase()} RISK</span>
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(currentGap.status)}`}>
            {statusIcon}
            <span className="ml-1">{currentGap.status.replace('_', ' ').toUpperCase()}</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Cost of Non-Compliance</p>
                <p className="text-2xl font-bold text-red-600">
                  ${businessMetrics.costOfNonCompliance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Remediation Effort</p>
                <p className="text-2xl font-bold text-blue-600">
                  {businessMetrics.remediationEffort} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Process Impact</p>
                <p className="text-2xl font-bold text-purple-600">
                  {businessMetrics.processImpact}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Gap Details</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  <span className="ml-1">{isEditing ? 'Cancel' : 'Edit'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Gap Title</label>
                    <Input
                      value={editForm.gap_title || ''}
                      onChange={(e) => setEditForm({...editForm, gap_title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full min-h-[100px] p-2 border rounded-md"
                      value={editForm.gap_description || ''}
                      onChange={(e) => setEditForm({...editForm, gap_description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Risk Level</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={editForm.risk_level || ''}
                        onChange={(e) => setEditForm({...editForm, risk_level: e.target.value as RiskLevel})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Business Impact</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={editForm.business_impact || ''}
                        onChange={(e) => setEditForm({...editForm, business_impact: e.target.value as BusinessImpactLevel})}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                    <p className="text-sm leading-relaxed">{currentGap.gap_description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Gap Type</h4>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{currentGap.gap_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Category</h4>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{currentGap.gap_category}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Risk Level</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(currentGap.risk_level)}`}>
                        {riskIcon}
                        <span className="ml-1">{currentGap.risk_level.toUpperCase()}</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Business Impact</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getBusinessImpactColor(currentGap.business_impact)}`}>
                        {currentGap.business_impact.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Confidence Score</h4>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span>{Math.round((currentGap.confidence_score || 0) * 100)}%</span>
                      </div>
                    </div>

                    {currentGap.regulatory_requirement && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Regulatory Requirement</h4>
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Yes</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {currentGap.potential_fine_amount && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Potential Fine: ${currentGap.potential_fine_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {(currentGap.recommendation_text || currentGap.recommended_actions?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentGap.recommendation_type && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommendation Type</h4>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{currentGap.recommendation_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}

                {currentGap.recommendation_text && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Recommendation</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm leading-relaxed text-blue-900">{currentGap.recommendation_text}</p>
                    </div>
                  </div>
                )}

                {currentGap.recommended_actions && currentGap.recommended_actions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">Recommended Actions</h4>
                    <div className="space-y-2">
                      {currentGap.recommended_actions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-green-900">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!currentGap.recommendation_text && (!currentGap.recommended_actions || currentGap.recommended_actions.length === 0) && (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recommendations available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Related Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ISO27001 Section 4.3.2.pdf</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowStatusUpdate(true)}
              >
                <Activity className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAssignForm(true)}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign to User
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleMarkReviewed}
              >
                <Eye className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </Button>
              
              <Button variant="outline" className="w-full">
                <Share className="h-4 w-4 mr-2" />
                Share Gap
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          {showStatusUpdate && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({...statusForm, status: e.target.value as GapStatus})}
                  >
                    <option value="identified">Identified</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_positive">False Positive</option>
                    <option value="accepted_risk">Accepted Risk</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Resolution Notes</label>
                  <textarea 
                    className="w-full p-2 border rounded-md"
                    value={statusForm.resolution_notes}
                    onChange={(e) => setStatusForm({...statusForm, resolution_notes: e.target.value})}
                    placeholder="Add notes about this status change..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleStatusUpdate}>Update</Button>
                  <Button variant="outline" onClick={() => setShowStatusUpdate(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showAssignForm && (
            <Card>
              <CardHeader>
                <CardTitle>Assign Gap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Assign to User</label>
                  <Input 
                    placeholder="Enter user ID or email"
                    value={assignForm.assigned_to}
                    onChange={(e) => setAssignForm({...assignForm, assigned_to: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input 
                    type="datetime-local"
                    value={assignForm.due_date}
                    onChange={(e) => setAssignForm({...assignForm, due_date: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAssign}>Assign</Button>
                  <Button variant="outline" onClick={() => setShowAssignForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentGap.assigned_to ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Assigned to</span>
                  </div>
                  <p className="text-sm">{currentGap.assigned_to}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Not assigned</p>
                </div>
              )}

              {currentGap.due_date && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Due Date</span>
                  </div>
                  <p className="text-sm">{formatDate(currentGap.due_date)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Detected</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(currentGap.detected_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(currentGap.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(currentGap.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Gap ID</h4>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {currentGap.id}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Gap Type</h4>
                <p className="text-sm">{currentGap.gap_type.replace('_', ' ')}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Confidence Score</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(currentGap.confidence_score || 0) * 100}%`}}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round((currentGap.confidence_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}