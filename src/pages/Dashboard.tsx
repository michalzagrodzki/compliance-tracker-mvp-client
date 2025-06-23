import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { 
  Clock, 
  Plus,
  Shield,
  ArrowRight,
  Upload,
  FileText
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your documents today
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">
              Document uploaded
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Plus className="h-6 w-6 text-primary" />
              <CardTitle>Create Audit Session</CardTitle>
            </div>
            <CardDescription>
              Start a new compliance audit session to track regulatory review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/audit-sessions/new" className="flex items-center space-x-2">
                <span>New Session</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>View Audit Sessions</CardTitle>
            </div>
            <CardDescription>
              Review and manage your existing compliance audit sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/audit-sessions" className="flex items-center space-x-2">
                <span>Browse Sessions</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="h-6 w-6 text-primary" />
              <CardTitle>Upload Document</CardTitle>
            </div>
            <CardDescription>
              Add new documents to the knowledge base for compliance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/documents/upload" className="flex items-center space-x-2">
                <span>Upload PDF</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Browse Documents</CardTitle>
            </div>
            <CardDescription>
              View and manage all documents in the knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/documents" className="flex items-center space-x-2">
                <span>View Documents</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}