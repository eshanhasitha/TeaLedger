import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import ActivityLogsPage from '../pages/ActivityLogs/ActivityLogsPage'
import CollectionsPage from '../pages/Collections/CollectionsPage'
import CollectorsPage from '../pages/Collectors/CollectorsPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import FarmerDetailsPage from '../pages/Farmers/FarmerDetailsPage'
import FarmersPage from '../pages/Farmers/FarmersPage'
import LoginPage from '../pages/Login/LoginPage'
import ReportsPage from '../pages/Reports/ReportsPage'
import SettingsPage from '../pages/Settings/SettingsPage'
import SettlementsPage from '../pages/Settlements/SettlementsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="farmers" element={<FarmersPage />} />
        <Route path="farmers/:id" element={<FarmerDetailsPage />} />
        <Route path="collectors" element={<CollectorsPage />} />
        <Route path="settlements" element={<SettlementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="activity" element={<ActivityLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
