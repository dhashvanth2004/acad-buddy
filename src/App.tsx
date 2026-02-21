import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Mentors from "./pages/Mentors";
import MentorProfile from "./pages/MentorProfile";
import Auth from "./pages/Auth";
import BecomeMentor from "./pages/BecomeMentor";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import StudyAssistant from "./pages/StudyAssistant";
import Chat from "./pages/Chat";
import EditProfile from "./pages/EditProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PasswordResetSuccess from "./pages/PasswordResetSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth mode="login" />} />
            <Route path="/home" element={<Index />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
            <Route path="/become-mentor" element={<BecomeMentor />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/study-assistant" element={<StudyAssistant />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
