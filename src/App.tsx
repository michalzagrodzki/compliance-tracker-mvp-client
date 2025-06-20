import { Routes, Route } from 'react-router'
import { useAuthStore } from './modules/auth/store/authStore'

// Auth components
import LoginForm from './modules/auth/components/LoginForm'
import SignupForm from './modules/auth/components/SignupForm'
import AuthGuard from './modules/auth/components/AuthGuard'
import ProtectedRoute from './modules/auth/components/ProtectedRoute'

// Pages
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthGuard>
            <LoginForm />
          </AuthGuard>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthGuard>
            <SignupForm />
          </AuthGuard>
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ) : (
            <Welcome />
          )
        }
      >
      {isAuthenticated && <Route index element={<Dashboard />} />}
      </Route>
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ) : (
            <Welcome />
          )
        }
      />
    </Routes>
  )
}

export default App