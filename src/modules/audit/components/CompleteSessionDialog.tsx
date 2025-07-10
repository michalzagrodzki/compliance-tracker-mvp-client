// src/components/CompleteSessionDialog.tsx
import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Square } from 'lucide-react'
import { useAuditSessionStore } from './../store/auditSessionStore'

export function CompleteSessionDialog({ sessionId }: { sessionId: string }) {
  const { closeSession } = useAuditSessionStore()
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState('')
  const templates = [
    'All compliance controls reviewed; no outstanding issues.',
    'Key gaps documented; ready for remediation planning.',
    'Evidence collected and validated; session closed.',
    'Controls tested, findings summarized with recommendations.',
    'Audit finalized: see detailed report for next steps.',
  ]

  const handleConfirm = async () => {
    await closeSession(sessionId, summary)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Square className="h-4 w-4" />
          <span>Complete Session</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Audit Session</DialogTitle>
          <DialogDescription>
            Confirm closing this session and add an optional summary.
          </DialogDescription>
        </DialogHeader>

        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Enter session summary"
          className="w-full border rounded p-2 mb-4"
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {templates.map(t => (
            <Button
              key={t}
              size="sm"
              variant="outline"
              onClick={() => setSummary(t)}
            >
              {t}
            </Button>
          ))}
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Complete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
