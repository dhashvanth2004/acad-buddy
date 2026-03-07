import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { sessionService } from "@/services/session.service";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MessageSquare, User, BookOpen, Star, Video } from "lucide-react";
import { format } from "date-fns";
import ReviewForm from "@/components/ReviewForm";
import { useState } from "react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Using local state to optimistically hide reviewed sessions
  const [newlyReviewedIds, setNewlyReviewedIds] = useState<Set<string>>(new Set());

  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ["student_contacts", user?.id],
    queryFn: () => sessionService.getStudentContacts(user!.id),
    enabled: !!user?.id,
  });

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["student_upcoming_sessions", user?.id],
    queryFn: () => sessionService.getStudentSessions(user!.id, ["upcoming", "pending", "in_progress"]),
    enabled: !!user?.id,
  });

  const { data: completedSessions, isLoading: loadingCompleted } = useQuery({
    queryKey: ["student_completed_sessions", user?.id],
    queryFn: async () => {
      const allCompleted = await sessionService.getStudentSessions(user!.id, "completed");
      return allCompleted.slice(0, 10);
    },
    enabled: !!user?.id,
  });

  const { data: reviewedSessionIds } = useQuery({
    queryKey: ["student_reviewed_sessions", user?.id],
    queryFn: () => sessionService.getStudentReviewedSessions(user!.id),
    enabled: !!user?.id,
  });

  const loadingData = loadingContacts || loadingSessions || loadingCompleted;

  const getInitials = (name: string | null) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      case "in_progress": return "bg-primary text-primary-foreground border-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const displayReviewedIds = new Set([
    ...(reviewedSessionIds || new Set()),
    ...newlyReviewedIds
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your mentorship journey and track your progress
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : !sessions || sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                  <Button onClick={() => navigate("/mentors")} variant="outline">
                    Find a Mentor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.mentor?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(session.mentor?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {session.mentor?.full_name || "Mentor"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {format(new Date(session.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        {session.subject && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{session.subject}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {session.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/room/${session.id}`);
                            }}
                            title="Join session"
                          >
                            <Video className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">Join</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat?with=${session.mentor_id}`);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contacted Mentors */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <MessageSquare className="h-5 w-5 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Contacted Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : !contacts || contacts.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    You haven't contacted any mentors yet
                  </p>
                  <Button onClick={() => navigate("/mentors")} variant="outline">
                    Browse Mentors
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/mentor/${contact.mentor_id}`)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contact.mentor?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(contact.mentor?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {contact.mentor?.full_name || "Mentor"}
                        </p>
                        {contact.mentor?.department && (
                          <p className="text-sm text-muted-foreground">
                            {contact.mentor.department}
                          </p>
                        )}
                        {contact.mentor?.subjects && contact.mentor.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contact.mentor.subjects.slice(0, 3).map((subject: string) => (
                              <Badge
                                key={subject}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Contacted {format(new Date(contact.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed Sessions - Review */}
        {!loadingData && completedSessions && completedSessions.length > 0 && (
          <Card className="mt-8 shadow-card">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Star className="h-5 w-5 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Review Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {completedSessions.map((session: any) => (
                  <div key={session.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.mentor?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(session.mentor?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{session.mentor?.full_name || "Mentor"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.scheduled_at), "MMM d, yyyy")}
                          {session.subject && ` · ${session.subject}`}
                        </p>
                      </div>
                      {displayReviewedIds.has(session.id) && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="w-3 h-3 fill-current" /> Reviewed
                        </Badge>
                      )}
                    </div>
                    {!displayReviewedIds.has(session.id) && user && (
                      <ReviewForm
                        sessionId={session.id}
                        mentorId={session.mentor_id}
                        studentId={user.id}
                        onReviewSubmitted={() => {
                          setNewlyReviewedIds((prev) => new Set([...prev, session.id]));
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8 shadow-card">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate("/mentors")} className="gap-2">
                <User className="h-4 w-4" />
                Find New Mentors
              </Button>
              <Button variant="outline" onClick={() => navigate("/chat")} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                My Messages
              </Button>
              <Button variant="outline" onClick={() => navigate("/become-mentor")} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Become a Mentor
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
