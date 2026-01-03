import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
const CTASection = () => {
  return <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-primary-foreground text-sm font-medium"> 1000+ students already learning</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 animate-slide-up">
            Ready to Excel in Your Academics?
          </h2>

          <p className="text-lg text-primary-foreground/90 mb-10 animate-slide-up" style={{
          animationDelay: '0.1s'
        }}>
            Join AcadBuddy today and connect with senior mentors who can guide you through every challenge. Your success story starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{
          animationDelay: '0.2s'
        }}>
            <Button size="xl" className="bg-background text-primary hover:bg-background/90 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" asChild>
              <Link to="/signup" className="gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="border-2 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10" asChild>
              <Link to="/become-mentor">Become a Mentor</Link>
            </Button>
          </div>

          <p className="text-primary-foreground/70 text-sm mt-6 animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            No credit card required • Free to get started • Cancel anytime
          </p>
        </div>
      </div>
    </section>;
};
export default CTASection;