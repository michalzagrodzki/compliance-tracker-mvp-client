import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { 
  Clock, 
  Plus,
  Shield,
  Upload,
  FileText,
  TriangleAlert,
  ClipboardList,
  PlusCircle,
  Search,
  Edit
} from 'lucide-react'
import DashboardCard from '@/components/DashboardCard'

export default function Dashboard() {
  const { user } = useAuthStore()

  const actionCards = [
    {
      title: "Create Audit Report",
      description: "Generate a new audit report from existing session data",
      icon: Edit,
      linkTo: "/audit-reports/new",
      linkTitle: "New Report",
      variant: "default" as const
    },
    {
      title: "Create Audit Session",
      description: "Start a new compliance audit session to track regulatory review",
      icon: Plus,
      linkTo: "/audit-sessions/new",
      linkTitle: "New Session",
      variant: "default" as const
    },
    {
      title: "Create Compliance Gap",
      description: "Document a new compliance gap for tracking and resolution",
      icon: PlusCircle,
      linkTo: "/compliance-gaps/new",
      linkTitle: "New Gap",
      variant: "default" as const
    },
    {
      title: "Upload Document",
      description: "Add new documents to the knowledge base for compliance analysis",
      icon: Upload,
      linkTo: "/documents/upload",
      linkTitle: "Upload PDF",
      variant: "default" as const
    },
  ]

  const browseCards = [
    {
      title: "View Audit Reports",
      description: "Access and review all generated audit reports and findings",
      icon: ClipboardList,
      linkTo: "/audit-reports",
      linkTitle: "Browse Reports",
      variant: "outline" as const
    },
    {
      title: "View Audit Sessions",
      description: "Review and manage your existing compliance audit sessions",
      icon: Shield,
      linkTo: "/audit-sessions",
      linkTitle: "Browse Sessions",
      variant: "outline" as const
    },
    {
      title: "View Compliance Gaps",
      description: "Review and manage identified compliance gaps and issues",
      icon: TriangleAlert,
      linkTo: "/compliance-gaps",
      linkTitle: "Browse Gaps",
      variant: "outline" as const
    },
    {
      title: "Browse Documents",
      description: "View and manage all documents in the knowledge base",
      icon: FileText,
      linkTo: "/documents",
      linkTitle: "View Documents",
      variant: "outline" as const
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your compliance management today
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Total uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Gaps</CardTitle>
            <TriangleAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

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
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              linkTo={card.linkTo}
              linkTitle={card.linkTitle}
              variant={card.variant}
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Browse & Manage</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {browseCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              linkTo={card.linkTo}
              linkTitle={card.linkTitle}
              variant={card.variant}
            />
          ))}
        </div>
      </div>
    </div>
  )
}