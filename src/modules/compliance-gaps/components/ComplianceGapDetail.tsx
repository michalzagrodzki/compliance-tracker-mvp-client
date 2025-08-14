/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useComplianceGap } from '../hooks/useComplianceGap'
import SectionLoading from '@/components/shared/SectionLoading'
import { Shield as ShieldIcon } from 'lucide-react'
import { ArrowLeft, Shield, AlertCircle,  } from 'lucide-react'
import ErrorDisplay from '@/modules/documents/components/shared/ErrorDisplay'
import type { ComplianceGapStatusUpdate } from '../types'
import { getRelativeTime, getRiskLevelColor, getStatusColor } from '@/lib/compliance'
import { getStatusIcon } from '@/lib/gap-detail'
import { getRiskIcon as getRiskIconComp } from '@/components/shared/RiskLevelBadge'
import GapActions from './detail/GapActions'
import GapDetails from './detail/GapDetails'
import Recommendations from './detail/Recommendations'
import RelatedChatMessage from './detail/RelatedChatMessage'
import RelatedDocuments from './detail/RelatedDocuments'
import StatusUpdate from './detail/StatusUpdate'
import AssignForm from './detail/AssignForm'
import Timeline from './detail/Timeline'
import TechnicalDetails from './detail/TechnicalDetails'
import AssignmentSummary from './detail/AssignmentSummary'

export default function ComplianceGapDetail() {
  const { gapId } = useParams<{ gapId: string }>()
  const {
    currentGap,
    relatedChatMessage,
    isLoading,
    error,
    loadGapById,
    updateGapStatus,
    assignGap,
    reviewGap,
    clearError
  } = useComplianceGap()

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
      loadGapById(gapId).catch((err) => {
        console.error('Error fetching compliance gap:', err)
      })
    }
  }, [gapId, loadGapById, clearError])


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
      <SectionLoading title="Compliance Gap" description="Loading gap details..." icon={ShieldIcon} />
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
        <ErrorDisplay error={error} />
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

  const statusIcon = getStatusIcon(currentGap.status)
  const RiskIcon = getRiskIconComp(currentGap.risk_level)

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
            <RiskIcon className="h-4 w-4" />
            <span className="ml-1">{currentGap.risk_level.toUpperCase()} RISK</span>
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(currentGap.status)}`}>
            {statusIcon}
            <span className="ml-1">{currentGap.status.replace('_', ' ').toUpperCase()}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GapActions
            gapId={currentGap.id}
            onShowStatusUpdate={() => setShowStatusUpdate(true)}
            onShowAssignForm={() => setShowAssignForm(true)}
            onMarkReviewed={handleMarkReviewed}
          />
          <GapDetails gap={currentGap} />
            <Recommendations
              recommendation_type={currentGap.recommendation_type}
              recommendation_text={currentGap.recommendation_text}
              recommended_actions={currentGap.recommended_actions}
            />
          {relatedChatMessage && (
            <RelatedChatMessage originalQuestion={currentGap.original_question} relatedChatMessage={relatedChatMessage as any} />
          )}
          <RelatedDocuments documents={currentGap.related_documents} />
        </div>
        <div className="space-y-6">
          {showStatusUpdate && (
            <StatusUpdate
              status={statusForm.status}
              resolution_notes={statusForm.resolution_notes || ''}
              onChange={(v) => setStatusForm(v)}
              onUpdate={handleStatusUpdate}
              onCancel={() => setShowStatusUpdate(false)}
            />
          )}

          {showAssignForm && (
            <AssignForm
              assigned_to={assignForm.assigned_to}
              due_date={assignForm.due_date}
              onChange={(v) => setAssignForm(v)}
              onAssign={handleAssign}
              onCancel={() => setShowAssignForm(false)}
            />
          )}
          <AssignmentSummary assigned_to={currentGap.assigned_to} due_date={currentGap.due_date} />
          <Timeline detected_at={currentGap.detected_at} created_at={currentGap.created_at} updated_at={currentGap.updated_at} />
          <TechnicalDetails id={currentGap.id} gap_type={currentGap.gap_type} confidence_score={currentGap.confidence_score} />
        </div>
      </div>
    </div>
  )
}
