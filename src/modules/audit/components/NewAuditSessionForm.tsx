import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuditSessionStore } from '../store/auditSessionStore'
import { Plus, AlertCircle } from 'lucide-react'

const COMPLIANCE_DOMAINS = [
  { value: 'ISO27001', label: 'ISO 27001 - Information Security Management' },
]

export default function NewAuditSessionForm() {
  const [sessionName, setSessionName] = useState('')
  const [complianceDomain, setComplianceDomain] = useState('')
  const [formError, setFormError] = useState('')
  
  const { createSession, isLoading, error } = useAuditSessionStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!sessionName.trim()) {
      setFormError('Session name is required')
      return
    }

    if (!complianceDomain) {
      setFormError('Please select a compliance domain')
      return
    }

    try {
      const newSession = await createSession({
        session_name: sessionName.trim(),
        compliance_domain: complianceDomain
      })

      navigate(`/audit-sessions/${newSession.id}`)
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  const generateSessionName = () => {
    const domain = COMPLIANCE_DOMAINS.find(d => d.value === complianceDomain)?.value || 'Compliance'
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    return `${domain} Audit - ${date}`
  }

  const handleDomainChange = (value: string) => {
    setComplianceDomain(value)
    if (!sessionName.trim()) {
      setSessionName(generateSessionName())
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create New Audit Session</h1>
        <p className="text-muted-foreground">
          Start a new compliance audit session to track your regulatory review process
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Session Details</span>
          </CardTitle>
          <CardDescription>
            Provide basic information about your audit session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {(formError || error) && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{formError || error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="compliance-domain" className="text-sm font-medium">
                Compliance Domain *
              </label>
              <select
                id="compliance-domain"
                value={complianceDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                disabled={isLoading}
                required
              >
                <option value="">Select a compliance framework...</option>
                {COMPLIANCE_DOMAINS.map((domain) => (
                  <option key={domain.value} value={domain.value}>
                    {domain.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="session-name" className="text-sm font-medium">
                Session Name *
              </label>
              <Input
                id="session-name"
                type="text"
                placeholder="Enter a descriptive name for this audit session"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Example: "Q4 2024 GDPR Compliance Review" or "Annual ISO 27001 Audit"
              </p>
            </div>
            {complianceDomain && (
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionName(generateSessionName())}
                  disabled={isLoading}
                >
                  Generate Session Name
                </Button>
                <span className="text-xs text-muted-foreground">
                  Auto-generate a name based on domain and date
                </span>
              </div>
            )}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || !sessionName.trim() || !complianceDomain}
              >
                {isLoading ? 'Creating Session...' : 'Create Audit Session'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/audit-sessions')}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <h4 className="font-medium">What happens next?</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>Your audit session will be created and tracked automatically</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>All compliance queries and document access will be logged</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                <span>You'll be able to generate audit reports and evidence trails</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}