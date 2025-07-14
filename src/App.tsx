import { Routes, Route } from 'react-router'
import { useAuthStore } from './modules/auth/store/authStore'

// Auth components
import LoginForm from './modules/auth/components/LoginForm'
import SignupForm from './modules/auth/components/SignupForm'
import AuthGuard from './modules/auth/components/AuthGuard'
import ProtectedRoute from './modules/auth/components/ProtectedRoute'

// Audit components
import AuditSessionsList from './modules/audit/components/AuditSessionsList'
import AuditSessionDetail from './modules/audit/components/AuditSessionDetail'
import NewAuditSessionForm from './modules/audit/components/NewAuditSessionForm'

// Document components
import DocumentsList from './modules/documents/components/DocumentsList'
import DocumentUploadForm from './modules/documents/components/DocumentUploadForm'
import DocumentDetail from './modules/documents/components/DocumentDetail'

// Chat components
import ChatSession from './modules/chat/components/ChatSession'

// Pages
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import ChatLayout from './components/ChatLayout'

import Loading from './components/Loading'
import ComplianceGapDetail from './modules/compliance-gaps/components/ComplianceGapDetail'
import ComplianceGapsList from './modules/compliance-gaps/components/ComplianceGapsList'
import ComplianceGapCreatePage from './modules/compliance-gaps/components/ComplianceGapCreate'
import CreateAuditReportPage from './modules/audit-reports/components/CreateAuditReportPage'
import AuditReportsList from './modules/audit-reports/components/AuditReportsList'
import AuditReportItem from './modules/audit-reports/components/AuditReportItem'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
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
      
      {isAuthenticated && (
        <>
          <Route
            path="/audit-sessions"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AuditSessionsList />} />
          </Route>
          
          <Route
            path="/audit-sessions/new"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NewAuditSessionForm />} />
          </Route>
          <Route
            path="/audit-sessions/:sessionId"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AuditSessionDetail />} />
          </Route>
          <Route
            path="/audit-sessions/:sessionId/chat/:chatId"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
            >
            <Route index element={<ChatSession />} />
          </Route>
          <Route
            path="/audit-sessions/:sessionId/create-report"
            element={
              <ProtectedRoute>
                <ChatLayout />
              </ProtectedRoute>
            }
            >
            <Route index element={<CreateAuditReportPage />} />
          </Route>
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DocumentsList />} />
          </Route>

          <Route
            path="/documents/upload"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DocumentUploadForm />} />
          </Route>

          <Route
            path="/documents/:documentId"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DocumentDetail />} />
          </Route>
          <Route
            path="/compliance-gaps/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
            >
            <Route index element={<ComplianceGapsList />} />
          </Route>
          <Route
            path="/compliance-gaps/:gapId"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
            >
            <Route index element={<ComplianceGapDetail />} />
          </Route>
          <Route
            path="/compliance-gaps/new"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
            >
            <Route index element={<ComplianceGapCreatePage />} />
          </Route>
          <Route
            path="/audit-report"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AuditReportsList />} />
          </Route>
          <Route
            path="/audit-report/:reportId"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AuditReportItem />} />
          </Route>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>
        </>
      )}
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