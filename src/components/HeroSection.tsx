import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, BookOpen, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <Badge variant="outline" className="mb-6 gap-2">
              <Sparkles className="w-3 h-3" />
              Peer-to-Peer Academic Support
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Connect with Senior
              <span className="block mt-2 text-primary">Mentors</span>
              <span className="block text-muted-foreground text-2xl md:text-3xl lg:text-4xl font-medium mt-4">
                Who Understand Your Journey
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              AcadBuddy bridges the gap between junior students seeking academic guidance and experienced seniors ready to help. Get personalized tutoring tailored to your college curriculum.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button variant="hero" size="xl" asChild>
                <Link to="/mentors" className="gap-2">
                  Find a Mentor
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/become-mentor">Become a Mentor</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                  <Users className="w-6 h-6" />
                  500+
                </div>
                <p className="text-sm text-muted-foreground">Active Mentors</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                  <BookOpen className="w-6 h-6" />
                  50+
                </div>
                <p className="text-sm text-muted-foreground">Subjects Covered</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-accent">
                  <Star className="w-6 h-6 fill-current" />
                  4.9
                </div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Main Card */}
            <div className="bg-card rounded-3xl shadow-card p-8 border border-border max-w-md w-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl">
                  👩‍🎓
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Priya Sharma</h3>
                  <p className="text-muted-foreground text-sm">Senior • CSE • 4th Year</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-current" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">(48 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="subject">Data Structures</Badge>
                <Badge variant="subject">Algorithms</Badge>
                <Badge variant="subject">DBMS</Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                "I love helping juniors navigate through tough subjects. Having been through the same curriculum, I understand exactly where students struggle."
              </p>
              <Button variant="default" className="w-full">
                Request Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
