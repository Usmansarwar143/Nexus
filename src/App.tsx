import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';



// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { EntrepreneurDashboard } from './pages/dashboard/EntrepreneurDashboard';
import { InvestorDashboard } from './pages/dashboard/InvestorDashboard';

// Profile Pages
import { EntrepreneurProfile } from './pages/profile/EntrepreneurProfile';
import { InvestorProfile } from './pages/profile/InvestorProfile';

// Feature Pages
import { InvestorsPage } from './pages/investors/InvestorsPage';
import { EntrepreneursPage } from './pages/entrepreneurs/EntrepreneursPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { HelpPage } from './pages/help/HelpPage';
import { DealsPage } from './pages/deals/DealsPage';

// Chat Pages
import { ChatPage } from './pages/chat/ChatPage';

// Meeting Pages
import { VideoCallPage } from './pages/meeting/VideoCallPage';

// Payments Page
import { WalletPage } from './pages/wallet/WalletPage';

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Dashboard Routes with Role Guards */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route element={<ProtectedRoute allowedRoles={['entrepreneur']} />}>
                  <Route path="entrepreneur" element={<EntrepreneurDashboard />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['investor']} />}>
                  <Route path="investor" element={<InvestorDashboard />} />
                </Route>
              </Route>
              
              {/* Profile Routes - All authenticated users can see profiles, but we want to protect the layout */}
              <Route path="/profile" element={<DashboardLayout />}>
                <Route path="entrepreneur/:id" element={<EntrepreneurProfile />} />
                <Route path="investor/:id" element={<InvestorProfile />} />
              </Route>
              
              {/* Feature Routes */}
              <Route path="/investors" element={<DashboardLayout />}>
                <Route index element={<InvestorsPage />} />
              </Route>
              
              <Route path="/entrepreneurs" element={<DashboardLayout />}>
                <Route index element={<EntrepreneursPage />} />
              </Route>
              
              <Route path="/messages" element={<DashboardLayout />}>
                <Route index element={<MessagesPage />} />
              </Route>
              
              <Route path="/notifications" element={<DashboardLayout />}>
                <Route index element={<NotificationsPage />} />
              </Route>
              
              <Route path="/documents" element={<DashboardLayout />}>
                <Route index element={<DocumentsPage />} />
              </Route>
              
              <Route path="/settings" element={<DashboardLayout />}>
                <Route index element={<SettingsPage />} />
              </Route>
              
              <Route path="/help" element={<DashboardLayout />}>
                <Route index element={<HelpPage />} />
              </Route>
              
              <Route path="/deals" element={<DashboardLayout />}>
                <Route index element={<DealsPage />} />
              </Route>

              {/* Wallet / Payments Route */}
              <Route path="/wallet" element={<DashboardLayout />}>
                <Route index element={<WalletPage />} />
              </Route>
              
              {/* Chat Routes */}
              <Route path="/chat" element={<DashboardLayout />}>
                <Route index element={<ChatPage />} />
                <Route path=":userId" element={<ChatPage />} />
              </Route>
              
              {/* Call Routes (Independent Fullscreen UI) */}
              <Route element={<ProtectedRoute allowedRoles={['entrepreneur', 'investor']} />}>
                <Route path="/call/:id" element={<VideoCallPage />} />
              </Route>
              
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all other routes and redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;