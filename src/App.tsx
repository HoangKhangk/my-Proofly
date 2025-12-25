import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Web3Provider } from '@/contexts/Web3Context';
import { SuiWalletProvider } from '@/contexts/SuiWalletContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClassDetail from './pages/ClassDetail';
import SessionView from './pages/SessionView';
import AttendPage from './pages/AttendPage';
import EventDetail from './pages/EventDetail';
import AttendWorkshop from './pages/AttendWorkshop';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // Nếu đã authenticated thì đã kết nối ví rồi
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <SuiWalletProvider>
            <Web3Provider>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/attend/:sessionCode?" element={<AttendPage />} />
              <Route path="/attend-workshop/:workshopCode?" element={<AttendWorkshop />} />
              <Route path="/event/:eventId" element={<EventDetail />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/class/:classId"
                element={
                  <ProtectedRoute>
                    <ClassDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session/:sessionId"
                element={
                  <ProtectedRoute>
                    <SessionView />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
            </Web3Provider>
          </SuiWalletProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;