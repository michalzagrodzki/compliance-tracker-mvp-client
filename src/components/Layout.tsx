import { Outlet, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { Shield, Menu, User, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Compliance Tracker</h1>
              </Link>
            </div>
            
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border rounded-md shadow-lg z-50">
                  <div className="py-2">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user?.name || 'User'}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-4 py-2 h-auto"
                        asChild
                      >
                        <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </Button>
                    </div>

                    <div className="py-1 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-4 py-2 h-auto text-destructive hover:text-destructive"
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleLogout()
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Compliance Tracker</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2025 Compliance Tracker. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
}