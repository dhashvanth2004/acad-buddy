import { Search, Calendar, MessageCircle, Star } from "lucide-react";
const steps = [{
  icon: Search,
  title: "Find Your Mentor",
  description: "Search for senior mentors by subject, rating, or availability. Our smart matching helps you find the perfect fit.",
  color: "bg-primary/10 text-primary"
}, {
  icon: Calendar,
  title: "Book a Session",
  description: "Choose a convenient time slot and book a one-on-one tutoring session. Get instant confirmation.",
  color: "bg-accent/20 text-accent-foreground"
}, {
  icon: MessageCircle,
  title: "Learn & Connect",
  description: "Meet with your mentor in-person or online. Get personalized help tailored to your college curriculum.",
  color: "bg-success/10 text-success"
}, {
  icon: Star,
  title: "Rate & Review",
  description: "Share your experience to help other students find great mentors. Build a trusted community.",
  color: "bg-primary/10 text-primary"
}];
const HowItWorks = () => {
  return <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-gradient">AcadBuddy</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes. Our simple process connects you with the right mentor for your academic needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => <div key={step.title} className="relative group animate-slide-up" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              {/* Connector Line */}
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border" />}

              <div className="relative bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-lg transition-shadow">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                  {index + 1}
                </div>

                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorks;