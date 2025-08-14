import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AssignFormProps {
  assigned_to: string
  due_date: string
  onChange: (v: { assigned_to: string; due_date: string }) => void
  onAssign: () => void
  onCancel: () => void
}

export default function AssignForm({ assigned_to, due_date, onChange, onAssign, onCancel }: AssignFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Gap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Assign to User</label>
          <Input
            placeholder="Enter user ID or email"
            value={assigned_to}
            onChange={(e) => onChange({ assigned_to: e.target.value, due_date })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Due Date</label>
          <Input type="datetime-local" value={due_date} onChange={(e) => onChange({ assigned_to, due_date: e.target.value })} />
        </div>
        <div className="flex space-x-2">
          <Button onClick={onAssign}>Assign</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

