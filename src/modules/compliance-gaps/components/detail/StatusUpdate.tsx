import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { GapStatus } from '../../types'

interface StatusUpdateProps {
  status: GapStatus
  resolution_notes: string
  onChange: (v: { status: GapStatus; resolution_notes: string }) => void
  onUpdate: () => void
  onCancel: () => void
}

export default function StatusUpdate({ status, resolution_notes, onChange, onUpdate, onCancel }: StatusUpdateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">New Status</label>
          <select
            className="w-full p-2 border rounded-md"
            value={status}
            onChange={(e) => onChange({ status: e.target.value as GapStatus, resolution_notes })}
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
            value={resolution_notes}
            onChange={(e) => onChange({ status, resolution_notes: e.target.value })}
            placeholder="Add notes about this status change..."
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={onUpdate}>Update</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

