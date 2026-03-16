import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, BookOpen, Users, Loader2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const nameSchema = z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100);

interface AuthProps {
  mode: "login" | "signup";
}

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, signUp, resendVerification } = useAuth();
  const { toast } = useToast();
  const { stats } = useRealtimeStats();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      // Don't redirect if we are in the middle of a password reset flow
      if (window.location.hash.includes("type=recovery")) {
        return;
      }

      console.log('[AUTH PAGE useEffect] User detected, redirecting...', { userId: user.id });
      // Fetch user role and redirect to appropriate dashboard
      const redirectUser = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("role, is_admin")
          .eq("user_id", user.id)
          .maybeSingle();

        const userRole = data?.role;
        const isAdmin = data?.is_admin;
        console.log('[AUTH PAGE useEffect] Redirecting based on role/admin status.');

        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else if (userRole === "mentor") {
          navigate("/mentor-dashboard", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      };

      redirectUser();
    }
  }, [user, authLoading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const { error } = await resendVerification(verificationEmail);
      if (error) {
        toast({ variant: "destructive", title: "Failed to resend", description: error.message });
      } else {
        toast({ title: "Email sent!", description: "A new verification email has been sent." });
        setResendCooldown(60);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.issues[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues[0].message;
    }

    if (mode === "signup") {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.issues[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === "login") {
        console.log('[AUTH PAGE] Attempting login...');
        const { error } = await signIn(email, password);
        console.log('[AUTH PAGE] Login response:', { hasError: !!error });

        if (error) {
          console.error('[AUTH PAGE] Login error:', error.message);
          if (error.message.includes("Email not confirmed")) {
            setVerificationEmail(email);
            setShowVerification(true);
            toast({
              variant: "destructive",
              title: "Email not verified",
              description: "Please verify your email before logging in.",
            });
          } else if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: error.message,
            });
          }
        } else {
          console.log('[AUTH PAGE] Login successful, getting user role...');
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });

          // Wait a moment for auth state to update, then redirect
          setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log('[AUTH PAGE] Current user after login:', { userId: user?.id });

            if (user) {
              const { data } = await supabase
                .from("profiles")
                .select("role, is_admin")
                .eq("user_id", user.id)
                .maybeSingle();

              const userRole = data?.role;
              const isAdmin = data?.is_admin;
              console.log('[AUTH PAGE] User role:', userRole);

              if (isAdmin) {
                navigate("/admin");
              } else if (userRole === "mentor") {
                navigate("/mentor-dashboard");
              } else {
                navigate("/home");
              }
            }
          }, 500);
        }
      } else {
        const { error } = await signUp(email, password, fullName, "student");
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              variant: "destructive",
              title: "Signup failed",
              description: "An account with this email already exists. Please log in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signup failed",
              description: error.message,
            });
          }
        } else {
          setVerificationEmail(email);
          setShowVerification(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Acad<span className="text-primary">Buddy</span>
            </span>
          </Link>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Check your email</h1>
            <p className="text-muted-foreground">
              We've sent a verification link to{" "}
              <span className="font-medium text-foreground">{verificationEmail}</span>.
              Please click the link to verify your account.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
            <p>Didn't receive the email? Check your spam folder or click below to resend.</p>
          </div>

          <Button
            onClick={handleResendVerification}
            disabled={resendLoading || resendCooldown > 0}
            variant="outline"
            className="w-full"
          >
            {resendLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              "Resend verification email"
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setShowVerification(false);
              setVerificationEmail("");
            }}
          >
            Back to {mode === "signup" ? "sign up" : "log in"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 animate-fade-in z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-all group-hover:scale-105 group-hover:bg-primary/20">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Acad<span className="text-primary">Buddy</span>
            </span>
          </Link>

          <div className="space-y-6">

            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold tracking-tight mb-2">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "login"
                  ? "Enter your credentials to access your dashboard"
                  : "Join AcadBuddy to connect with top-tier student mentors"}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`bg-background/50 focus:bg-background ${errors.fullName ? "border-destructive" : ""}`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-background/50 focus:bg-background ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-background/50 focus:bg-background ${errors.password ? "border-destructive" : ""}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                {mode === "login" && (
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline inline-block mt-1"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Log In" : "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={googleLoading}
              onClick={async () => {
                setGoogleLoading(true);
                try {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    toast({
                      variant: "destructive",
                      title: "Google sign-in failed",
                      description: error instanceof Error ? error.message : "An error occurred",
                    });
                  }
                } catch (err) {
                  toast({
                    variant: "destructive",
                    title: "Google sign-in failed",
                    description: "Could not connect to Google. Please try again.",
                  });
                } finally {
                  setGoogleLoading(false);
                }
              }}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="mt-6 text-center text-sm">
              {mode === "login" ? (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Log in
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

        <div className="max-w-md z-10 text-center space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-24 h-24 bg-card/50 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-white/20">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Unlock your academic potential</h2>
            <p className="text-lg text-muted-foreground">Join thousands of students connecting with experienced mentors to achieve their learning goals faster.</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground p-6 bg-card/30 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{stats.mentors > 0 ? `${stats.mentors}+` : "0"}</span>
              <span>Mentors</span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{stats.subjects > 0 ? `${stats.subjects}+` : "0"}</span>
              <span>Subjects</span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{stats.sessions > 0 ? `${stats.sessions}+` : "10+"}</span>
              <span>Sessions</span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-foreground">{stats.averageRating > 0 ? `${stats.averageRating}/5` : "4.5/5"}</span>
              <span>Avg Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
