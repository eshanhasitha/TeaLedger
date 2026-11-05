import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LedgerProvider } from './context/LedgerContext'
import { NotificationProvider } from './context/NotificationContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LedgerProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </NotificationProvider>
        </LedgerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
