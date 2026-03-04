import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy loading route components for massive performance optimization (Code Splitting)
const Index = lazy(() => import("./pages/Index"));
const Mentors = lazy(() => import("./pages/Mentors"));
const MentorProfile = lazy(() => import("./pages/MentorProfile"));
const Auth = lazy(() => import("./pages/Auth"));
const BecomeMentor = lazy(() => import("./pages/BecomeMentor"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const MentorDashboard = lazy(() => import("./pages/MentorDashboard"));
const StudyAssistant = lazy(() => import("./pages/StudyAssistant"));
const Chat = lazy(() => import("./pages/Chat"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PasswordResetSuccess = lazy(() => import("./pages/PasswordResetSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// A generic full-screen loading fallback for route transitions
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Auth mode="login" />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/home" element={<Index />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/mentor/:id" element={<MentorProfile />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

              <Route path="/become-mentor" element={<ProtectedRoute><BecomeMentor /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
              <Route path="/study-assistant" element={<ProtectedRoute><StudyAssistant /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* Catch-All / 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
