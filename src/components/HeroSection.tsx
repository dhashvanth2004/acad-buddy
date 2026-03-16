import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, BookOpen, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/error-logger";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";

const HeroSection = () => {
  const { user } = useAuth();
  const [isMentor, setIsMentor] = useState(false);
  const { stats } = useRealtimeStats();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data?.role === "mentor") setIsMentor(true); });
  }, [user]);

  return <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{
        animationDelay: '1s'
      }} />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center animate-slide-up">
          <Badge variant="outline" className="mb-6 gap-2">
            <Sparkles className="w-3 h-3" />
            Peer-to-Peer Academic Support
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl">
            Connect with Senior Mentors 
            
            <span className="block text-2xl md:text-3xl lg:text-4xl font-medium mt-4 text-primary">
              Who Understand Your Journey
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            AcadBuddy bridges the gap between junior students seeking academic guidance and experienced seniors ready to help. Get personalized tutoring tailored to your college curriculum.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" asChild>
              <Link to="/mentors" className="gap-2">
                Find a Mentor
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            {!isMentor && (
              <Button variant="outline" size="xl" asChild>
                <Link to="/become-mentor">Become a Mentor</Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-12 justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                <Users className="w-6 h-6" />
                {stats.mentors > 0 ? `${stats.mentors}+` : "0"}
              </div>
              <p className="text-sm text-muted-foreground">Active Mentors</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                <BookOpen className="w-6 h-6" />
                {stats.subjects > 0 ? `${stats.subjects}+` : "0"}
              </div>
              <p className="text-sm text-muted-foreground">Subjects Covered</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                <Sparkles className="w-6 h-6" />
                {stats.sessions > 0 ? `${stats.sessions}+` : "10+"}
              </div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-accent">
                <Star className="w-6 h-6 fill-current" />
                {stats.averageRating > 0 ? stats.averageRating : "4.5"}
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;