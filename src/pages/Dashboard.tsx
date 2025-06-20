import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { 
  Search, 
  Clock, 
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-primary" />
              <CardTitle>Search Documents</CardTitle>
            </div>
            <CardDescription>
              Find information across all your documents using natural language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Start Searching
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
            <CardDescription>
              Your latest document queries and results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current status of your RAG system components
          </CardDescription>
        </CardHeader>
        <CardContent>
        </CardContent>
      </Card>
    </div>
  )
}