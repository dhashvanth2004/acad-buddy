import { Users, Shield, Clock, Award, Wallet, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Smart Matching",
    description: "Our algorithm connects you with mentors who specialize in your subjects and match your learning style.",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All senior mentors are verified through their academic credentials ensuring trust and authenticity.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your timetable. Mentors set their availability for your convenience.",
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "Rating and review system ensures high-quality mentorship. Only the best rise to the top.",
  },
  {
    icon: Wallet,
    title: "Affordable Rates",
    description: "Peer-to-peer model keeps costs low. Some mentors even offer free sessions for recognition.",
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description: "Communicate seamlessly with your mentor. Share notes, ask questions, and stay connected.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="text-primary font-extrabold">AcadBuddy</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built by students, for students. We understand the challenges of academic life and designed features that truly help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
