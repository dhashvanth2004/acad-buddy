import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MessageSquare, User, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface ContactedMentor {
  id: string;
  mentor_id: string;
  message: string;
  created_at: string;
  mentor: {
    full_name: string | null;
    avatar_url: string | null;
    department: string | null;
    subjects: string[] | null;
  };
}

interface Session {
  id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  subject: string | null;
  mentor: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const StudentDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<ContactedMentor[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch contacted mentors
        const { data: contactsData } = await supabase
          .from("mentor_contacts")
          .select("id, mentor_id, message, created_at")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false });

        if (contactsData && contactsData.length > 0) {
          const mentorIds = contactsData.map((c) => c.mentor_id);
          const { data: mentorsData } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, department, subjects")
            .in("user_id", mentorIds);

          const contactsWithMentors = contactsData.map((contact) => ({
            ...contact,
            mentor: mentorsData?.find((m) => m.user_id === contact.mentor_id) || {
              full_name: null,
              avatar_url: null,
              department: null,
              subjects: null,
            },
          }));

          setContacts(contactsWithMentors);
        }

        // Fetch upcoming sessions
        const { data: sessionsData } = await supabase
          .from("sessions")
          .select("id, mentor_id, scheduled_at, duration_minutes, status, subject")
          .eq("student_id", user.id)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true });

        if (sessionsData && sessionsData.length > 0) {
          const mentorIds = sessionsData.map((s) => s.mentor_id);
          const { data: mentorsData } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", mentorIds);

          const sessionsWithMentors = sessionsData.map((session) => ({
            ...session,
            mentor: mentorsData?.find((m) => m.user_id === session.mentor_id) || {
              full_name: null,
              avatar_url: null,
            },
          }));

          setSessions(sessionsWithMentors);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

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
      case "upcoming":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                  <Button onClick={() => navigate("/mentors")} variant="outline">
                    Find a Mentor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.mentor.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(session.mentor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {session.mentor.full_name || "Mentor"}
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
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
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
              ) : contacts.length === 0 ? (
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
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/mentor/${contact.mentor_id}`)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contact.mentor.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(contact.mentor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {contact.mentor.full_name || "Mentor"}
                        </p>
                        {contact.mentor.department && (
                          <p className="text-sm text-muted-foreground">
                            {contact.mentor.department}
                          </p>
                        )}
                        {contact.mentor.subjects && contact.mentor.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contact.mentor.subjects.slice(0, 3).map((subject) => (
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
