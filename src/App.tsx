import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { ResetPassword } from "./pages/ResetPassword";
import { Modules } from "./pages/Modules";
import { ModuleDetail } from "./pages/ModuleDetail";
import { Dashboard } from "./pages/Dashboard";
import { RiskDashboard } from "./pages/RiskDashboard";
import { Leaderboards } from "./pages/Leaderboards";
import { Profile } from "./pages/Profile";
import Simulations from "./pages/Simulations";
import AlertsPage from "./components/alerts/AlertsPage";
import BroadcastAlerts from "./pages/BroadcastAlerts";
import NotFound from "./pages/NotFound";
import "@/lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ndma-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/modules" element={
                  <ProtectedRoute>
                    <Modules />
                  </ProtectedRoute>
                } />
                <Route path="/modules/:moduleId" element={
                  <ProtectedRoute>
                    <ModuleDetail />
                  </ProtectedRoute>
                } />
                <Route path="/simulations" element={
                  <ProtectedRoute>
                    <Simulations />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <AlertsPage />
                  </ProtectedRoute>
                } />
                <Route path="/broadcast" element={
                  <ProtectedRoute>
                    <BroadcastAlerts />
                  </ProtectedRoute>
                } />
                <Route path="/risk-dashboard" element={
                  <ProtectedRoute>
                    <RiskDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboards" element={
                  <ProtectedRoute>
                    <Leaderboards />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
