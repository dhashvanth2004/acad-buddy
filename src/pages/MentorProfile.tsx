import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Clock,
  GraduationCap,
  BookOpen,
  MessageCircle,
  Mail,
  ArrowLeft,
  IndianRupee,
  Loader2,
  Send,
  Calendar as CalendarIcon,
  User,
  CalendarPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MentorData {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  year: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
}

// Mock data for when mentor not found in DB (for demo purposes)
const mockMentors: Record<string, MentorData & { rating: number; reviewCount: number; availability: string }> = {
  "1": {
    id: "1",
    user_id: "1",
    full_name: "Priya Sharma",
    avatar_url: null,
    department: "Computer Science",
    year: "4th Year",
    bio: "Passionate about teaching programming concepts. I've helped 50+ students ace their coding interviews and improve their grades. My approach focuses on building strong fundamentals while keeping things practical and engaging. I believe in learning by doing, so expect lots of hands-on coding exercises!",
    subjects: ["Data Structures", "Algorithms", "Python", "Machine Learning"],
    hourly_rate: 200,
    rating: 4.9,
    reviewCount: 47,
    availability: "Evenings & Weekends",
  },
  "2": {
    id: "2",
    user_id: "2",
    full_name: "Rahul Verma",
    avatar_url: null,
    department: "Physics",
    year: "3rd Year",
    bio: "Physics enthusiast with a knack for simplifying complex theories. Let's make physics fun together! I specialize in breaking down difficult concepts using real-world examples and analogies that stick with you.",
    subjects: ["Mechanics", "Electromagnetism", "Quantum Physics"],
    hourly_rate: 150,
    rating: 4.7,
    reviewCount: 32,
    availability: "Weekdays",
  },
  "3": {
    id: "3",
    user_id: "3",
    full_name: "Ananya Patel",
    avatar_url: null,
    department: "Mathematics",
    year: "4th Year",
    bio: "Mathematics gold medalist. I believe every student can excel in math with the right guidance and practice. My teaching style is patient and methodical, focusing on building confidence alongside skills.",
    subjects: ["Calculus", "Linear Algebra", "Statistics", "Probability"],
    hourly_rate: 250,
    rating: 5.0,
    reviewCount: 63,
    availability: "Flexible",
  },
  "4": {
    id: "4",
    user_id: "4",
    full_name: "Arjun Reddy",
    avatar_url: null,
    department: "Computer Science",
    year: "3rd Year",
    bio: "Full-stack developer and open source contributor. Happy to help fellow students for free! I've worked on multiple production applications and love sharing practical web development tips.",
    subjects: ["Web Development", "React", "Node.js", "JavaScript"],
    hourly_rate: 0,
    rating: 4.8,
    reviewCount: 28,
    availability: "Weekends",
  },
  "5": {
    id: "5",
    user_id: "5",
    full_name: "Sneha Gupta",
    avatar_url: null,
    department: "Chemistry",
    year: "4th Year",
    bio: "Chemistry can be magical when you understand the concepts. Let me help you discover the beauty of molecules! I use visual aids and molecular models to make abstract concepts tangible.",
    subjects: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
    hourly_rate: 180,
    rating: 4.6,
    reviewCount: 41,
    availability: "Mornings",
  },
  "6": {
    id: "6",
    user_id: "6",
    full_name: "Vikram Singh",
    avatar_url: null,
    department: "Economics",
    year: "3rd Year",
    bio: "Economics student with internship experience at top consulting firms. Real-world insights included! I can help you understand economic principles through case studies and current events.",
    subjects: ["Microeconomics", "Macroeconomics", "Econometrics"],
    hourly_rate: 120,
    rating: 4.5,
    reviewCount: 19,
    availability: "Evenings",
  },
  "7": {
    id: "7",
    user_id: "7",
    full_name: "Kavya Nair",
    avatar_url: null,
    department: "Biology",
    year: "4th Year",
    bio: "Research assistant with published papers. I can help you understand complex biological concepts with visual aids. My strength lies in connecting molecular concepts to real-world applications in medicine and biotechnology.",
    subjects: ["Molecular Biology", "Genetics", "Biochemistry"],
    hourly_rate: 200,
    rating: 4.9,
    reviewCount: 55,
    availability: "Flexible",
  },
  "8": {
    id: "8",
    user_id: "8",
    full_name: "Rohan Mehta",
    avatar_url: null,
    department: "Business",
    year: "3rd Year",
    bio: "Business student with case competition wins. Let's tackle those case studies together! I bring a structured approach to business problems with frameworks that work.",
    subjects: ["Accounting", "Finance", "Marketing"],
    hourly_rate: 100,
    rating: 4.4,
    reviewCount: 22,
    availability: "Weekdays",
  },
};

const MentorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [mentor, setMentor] = useState<(MentorData & { rating?: number; reviewCount?: number; availability?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [bookingTime, setBookingTime] = useState("");
  const [bookingDuration, setBookingDuration] = useState("60");
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // First try to fetch from database
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("role", "mentor")
        .maybeSingle();

      if (data) {
        setMentor({
          ...data,
          rating: 4.8,
          reviewCount: 0,
          availability: "Flexible",
        });
      } else if (mockMentors[id]) {
        // Fall back to mock data for demo
        setMentor(mockMentors[id]);
      }

      setLoading(false);
    };

    fetchMentor();
  }, [id]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Empty message",
        description: "Please write a message before sending.",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to contact mentors.",
      });
      navigate("/signup");
      return;
    }

    if (!mentor?.user_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find mentor information.",
      });
      return;
    }

    setSendingMessage(true);
    
    try {
      const { error } = await supabase
        .from('mentor_contacts')
        .insert({
          student_id: user.id,
          mentor_id: mentor.user_id,
          message: message.trim()
        });

      if (error) throw error;
      
      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${mentor?.full_name}. They'll get back to you soon!`,
      });
      
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to book a session.",
      });
      navigate("/login");
      return;
    }

    if (!bookingDate || !bookingTime) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a date and time for your session.",
      });
      return;
    }

    setBookingLoading(true);

    try {
      // Combine date and time
      const [hours, minutes] = bookingTime.split(":").map(Number);
      const scheduledAt = new Date(bookingDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from("sessions").insert({
        student_id: user.id,
        mentor_id: mentor?.user_id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: parseInt(bookingDuration),
        subject: bookingSubject || null,
        notes: bookingNotes || null,
        status: "upcoming",
      });

      if (error) throw error;

      toast({
        title: "Session booked!",
        description: `Your session with ${mentor?.full_name} has been scheduled for ${format(scheduledAt, "MMMM d, yyyy 'at' h:mm a")}.`,
      });

      // Reset form
      setBookingOpen(false);
      setBookingDate(undefined);
      setBookingTime("");
      setBookingDuration("60");
      setBookingSubject("");
      setBookingNotes("");
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "There was an error booking your session. Please try again.",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const getInitials = (name: string | null) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Mentor Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The mentor you're looking for doesn't exist or may have been removed.
          </p>
          <Button asChild>
            <Link to="/mentors">Browse All Mentors</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back Navigation */}
      <div className="container mx-auto px-4 pt-20">
        <Button variant="ghost" asChild className="gap-2 mb-4">
          <Link to="/mentors">
            <ArrowLeft className="w-4 h-4" />
            Back to Mentors
          </Link>
        </Button>
      </div>

      {/* Profile Header */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
                  <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.full_name || "Mentor"} />
                  <AvatarFallback className="text-4xl gradient-primary text-primary-foreground">
                    {getInitials(mentor.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{mentor.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {mentor.department}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {mentor.year}
                    </span>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(mentor.rating || 0)
                              ? "text-accent fill-current"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{mentor.rating?.toFixed(1)}</span>
                    <span className="text-muted-foreground">({mentor.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Price & Availability */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">
                      {mentor.hourly_rate === 0 ? "Free Sessions" : `₹${mentor.hourly_rate}/hour`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 text-accent-foreground" />
                    <span className="font-medium">{mentor.availability}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    About Me
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {mentor.bio || "This mentor hasn't added a bio yet."}
                  </p>
                </CardContent>
              </Card>

              {/* Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Subjects I Teach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mentor.subjects && mentor.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {mentor.subjects.map((subject) => (
                        <Badge key={subject} variant="subject" className="text-sm py-1.5 px-4">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No subjects listed yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Reviews Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Student Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Reviews coming soon!</p>
                    <p className="text-sm mt-1">Be the first to review this mentor.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact {mentor.full_name?.split(" ")[0]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Send a message to introduce yourself and discuss your learning goals.
                  </p>
                  
                  <Textarea
                    placeholder={`Hi ${mentor.full_name?.split(" ")[0]}, I'm interested in learning...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />

                  <Button
                    className="w-full gap-2"
                    onClick={handleSendMessage}
                    disabled={sendingMessage}
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  {/* Book Session Button */}
                  <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <CalendarPlus className="w-4 h-4" />
                        Book a Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Book a Session with {mentor.full_name?.split(" ")[0]}</DialogTitle>
                        <DialogDescription>
                          Schedule a mentoring session. Choose your preferred date and time.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {/* Date Picker */}
                        <div className="space-y-2">
                          <Label>Select Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !bookingDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={bookingDate}
                                onSelect={setBookingDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Time Picker */}
                        <div className="space-y-2">
                          <Label>Select Time</Label>
                          <Select value={bookingTime} onValueChange={setBookingTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {format(new Date(`2000-01-01T${time}:00`), "h:mm a")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                          <Label>Session Duration</Label>
                          <Select value={bookingDuration} onValueChange={setBookingDuration}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="90">1.5 hours</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                          <Label>Subject (Optional)</Label>
                          {mentor.subjects && mentor.subjects.length > 0 ? (
                            <Select value={bookingSubject} onValueChange={setBookingSubject}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {mentor.subjects.map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                    {subject}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="e.g., Data Structures"
                              value={bookingSubject}
                              onChange={(e) => setBookingSubject(e.target.value)}
                            />
                          )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label>Notes (Optional)</Label>
                          <Textarea
                            placeholder="Any specific topics you'd like to cover..."
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            rows={3}
                            className="resize-none"
                          />
                        </div>

                        {/* Price estimate */}
                        {mentor.hourly_rate !== null && mentor.hourly_rate > 0 && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Estimated Cost</span>
                              <span className="font-semibold text-primary">
                                ₹{Math.round((mentor.hourly_rate / 60) * parseInt(bookingDuration))}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full gap-2"
                          onClick={handleBookSession}
                          disabled={bookingLoading}
                        >
                          {bookingLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Booking...
                            </>
                          ) : (
                            <>
                              <CalendarPlus className="w-4 h-4" />
                              Confirm Booking
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Session Rate</span>
                      <span className="font-semibold text-primary">
                        {mentor.hourly_rate === 0 ? "Free" : `₹${mentor.hourly_rate}/hr`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Availability</span>
                      <span className="font-medium">{mentor.availability}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MentorProfile;
