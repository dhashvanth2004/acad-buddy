import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sessionService } from "@/services/session.service";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Video,
} from "lucide-react";
import { format } from "date-fns";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_SLOTS = [
  { start: "09:00", end: "12:00" },
  { start: "14:00", end: "17:00" },
  { start: "18:00", end: "21:00" },
];

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMentor, setIsMentor] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  useEffect(() => {
    const checkMentorStatus = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, hourly_rate")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role !== "mentor") {
        toast({
          title: "Access Denied",
          description: "You must be a mentor to access this dashboard.",
          variant: "destructive",
        });
        navigate("/become-mentor");
        return;
      }
      setIsMentor(true);
      setHourlyRate(profile.hourly_rate || 0);
    };
    checkMentorStatus();
  }, [user, navigate, toast]);

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["mentor_sessions", user?.id],
    queryFn: () => sessionService.getMentorSessions(user!.id),
    enabled: !!user?.id && isMentor,
  });

  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ["mentor_availability", user?.id],
    queryFn: () => sessionService.getMentorAvailability(user!.id),
    enabled: !!user?.id && isMentor,
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => sessionService.updateSessionStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mentor_sessions", user?.id] });
      toast({
        title: variables.status === "upcoming" ? "Session Accepted" : "Session Declined",
        description: `The session has been ${variables.status === "upcoming" ? "accepted" : "declined"}.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update session status.",
        variant: "destructive",
      });
    }
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (vars: { dayOfWeek: number, slot: { start: string, end: string }, existingSlot: any }) => {
      return sessionService.toggleAvailability(user!.id, vars.dayOfWeek, vars.slot.start, vars.slot.end, vars.existingSlot?.id, vars.existingSlot?.is_available);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor_availability", user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update availability.",
        variant: "destructive",
      });
    }
  });

  const handleSessionAction = async (sessionId: string, newStatus: "upcoming" | "cancelled") => {
    updateSessionMutation.mutate({ id: sessionId, status: newStatus });

    // Send email notification to student via EmailJS
    try {
      const { data: sessionData } = await supabase
        .from("sessions")
        .select("scheduled_at, duration_minutes, subject, student_id")
        .eq("id", sessionId)
        .maybeSingle();

      if (sessionData) {
        const { data: studentProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", sessionData.student_id)
          .maybeSingle();

        const { data: mentorProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user!.id)
          .maybeSingle();

        if (studentProfile?.email) {
          if (newStatus === "upcoming") {
            const { sendBookingAcceptedEmail } = await import("@/services/email.service");
            await sendBookingAcceptedEmail({
              studentEmail: studentProfile.email,
              studentName: studentProfile.full_name || "Student",
              mentorName: mentorProfile?.full_name || "Your mentor",
              date: new Date(sessionData.scheduled_at).toLocaleString(),
              duration: sessionData.duration_minutes + " minutes",
              subject: sessionData.subject || undefined,
            });
          } else {
            const { sendBookingDeclinedEmail } = await import("@/services/email.service");
            await sendBookingDeclinedEmail({
              studentEmail: studentProfile.email,
              studentName: studentProfile.full_name || "Student",
              mentorName: mentorProfile?.full_name || "Your mentor",
              date: new Date(sessionData.scheduled_at).toLocaleString(),
              subject: sessionData.subject || undefined,
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to notify student", e);
    }
  };

  const handleJoinSession = async (sessionId: string, currentStatus: string) => {
    if (currentStatus === "upcoming") {
      await sessionService.updateSessionStatus(sessionId, "in_progress");
      queryClient.invalidateQueries({ queryKey: ["mentor_sessions", user?.id] });
    }
    navigate(`/room/${sessionId}`);
  };

  const isSlotAvailable = (dayOfWeek: number, slotIndex: number) => {
    const slot = DEFAULT_SLOTS[slotIndex];
    const existingSlot = availability?.find(
      (a) => a.day_of_week === dayOfWeek && a.start_time === slot.start + ":00" && a.end_time === slot.end + ":00"
    );
    return existingSlot?.is_available ?? false;
  };

  const toggleAvailability = (dayOfWeek: number, slotIndex: number) => {
    const slot = DEFAULT_SLOTS[slotIndex];
    const existingSlot = availability?.find(
      (a) => a.day_of_week === dayOfWeek && a.start_time === slot.start + ":00" && a.end_time === slot.end + ":00"
    );
    toggleAvailabilityMutation.mutate({ dayOfWeek, slot, existingSlot });
  };

  const getInitials = (name: string | null) => {
    if (!name) return "S";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const pendingSessions = sessions?.filter((s) => s.status === "pending") || [];
  const upcomingSessions = sessions?.filter((s) => (s.status === "upcoming" || s.status === "in_progress") && new Date(s.scheduled_at) >= new Date(Date.now() - 3600000)) || [];
  const completedSessions = sessions?.filter((s) => s.status === "completed") || [];

  const totalEarnings = completedSessions.reduce((sum, session) => sum + (session.duration_minutes / 60) * hourlyRate, 0);

  if (!isMentor) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Manage your sessions, availability, and track your earnings</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold text-foreground">{upcomingSessions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingSessions.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Session Requests */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <CardTitle className="text-xl">Session Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : pendingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No pending session requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSessions.map((session: any) => (
                    <div key={session.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.student?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(session.student?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {session.student?.full_name || "Student"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(session.scheduled_at), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{session.duration_minutes} minutes</span>
                          </div>
                          {session.subject && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{session.subject}</span>
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                      </div>
                      {session.notes && (
                        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          "{session.notes}"
                        </p>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleSessionAction(session.id, "upcoming")}
                          disabled={updateSessionMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleSessionAction(session.id, "cancelled")}
                          disabled={updateSessionMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                          onClick={() => navigate(`/chat?with=${session.student_id}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.student?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(session.student?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {session.student?.full_name || "Student"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(new Date(session.scheduled_at), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        {session.subject && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{session.subject}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleJoinSession(session.id, session.status)}
                        >
                          <Video className="h-4 w-4 shrink-0" />
                          <span className="hidden sm:inline">{session.status === "in_progress" ? "Join" : "Start"}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                          onClick={() => navigate(`/chat?with=${session.student_id}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Availability Management */}
        <Card className="mt-8 shadow-card">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-xl">Manage Availability</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Toggle time slots when you're available for sessions</p>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAvailability ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">Day</th>
                      {DEFAULT_SLOTS.map((slot, i) => (
                        <th key={i} className="text-center p-2 text-sm font-medium text-muted-foreground">
                          {slot.start} - {slot.end}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_OF_WEEK.map((day, dayIndex) => (
                      <tr key={day} className="border-t border-border">
                        <td className="p-3 font-medium text-foreground">{day}</td>
                        {DEFAULT_SLOTS.map((_, slotIndex) => (
                          <td key={slotIndex} className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                id={`${dayIndex}-${slotIndex}`}
                                checked={isSlotAvailable(dayIndex, slotIndex)}
                                onCheckedChange={() => toggleAvailability(dayIndex, slotIndex)}
                              />
                              <Label htmlFor={`${dayIndex}-${slotIndex}`} className="text-xs text-muted-foreground sr-only">
                                {isSlotAvailable(dayIndex, slotIndex) ? "Available" : "Unavailable"}
                              </Label>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Rate Info */}
        <Card className="mt-8 shadow-card">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Your Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">${hourlyRate}/hour</p>
                <p className="text-sm text-muted-foreground mt-1">Update your rate in your profile settings</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/become-mentor")}>
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default MentorDashboard;
