import MentorCard from "./MentorCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const mentors = [
  {
    id: "1",
    name: "Priya Sharma",
    avatar: "👩‍🎓",
    department: "CSE",
    year: "4th Year",
    subjects: ["Data Structures", "Algorithms", "DBMS", "Python"],
    rating: 4.9,
    reviewCount: 48,
    hourlyRate: 150,
    availability: "Available",
    bio: "I love helping juniors navigate through tough subjects. Having been through the same curriculum, I understand exactly where students struggle.",
  },
  {
    id: "2",
    name: "Rahul Kumar",
    avatar: "👨‍💻",
    department: "CSE",
    year: "3rd Year",
    subjects: ["Web Development", "React", "JavaScript", "Node.js"],
    rating: 4.8,
    reviewCount: 32,
    hourlyRate: 0,
    availability: "Weekends",
    bio: "Full-stack enthusiast. I offer free sessions to give back to the community. Let's build something amazing together!",
  },
  {
    id: "3",
    name: "Ananya Reddy",
    avatar: "👩‍💼",
    department: "ECE",
    year: "4th Year",
    subjects: ["Digital Electronics", "Signals", "Microprocessors"],
    rating: 4.7,
    reviewCount: 25,
    hourlyRate: 200,
    availability: "Evenings",
    bio: "Cleared GATE with top rank. I specialize in making complex concepts simple and memorable for competitive exams.",
  },
  {
    id: "4",
    name: "Vikram Singh",
    avatar: "👨‍🔬",
    department: "Mechanical",
    year: "3rd Year",
    subjects: ["Thermodynamics", "Fluid Mechanics", "Machine Design"],
    rating: 4.6,
    reviewCount: 18,
    hourlyRate: 100,
    availability: "Flexible",
    bio: "Practical approach to theoretical concepts. I use real-world examples to make learning engaging and effective.",
  },
];

const MentorsShowcase = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div className="animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Meet Our Top <span className="text-gradient">Mentors</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Experienced seniors ready to guide you through your academic journey
            </p>
          </div>
          <Button variant="outline" asChild className="animate-fade-in">
            <Link to="/mentors" className="gap-2">
              View All Mentors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor, index) => (
            <div
              key={mentor.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MentorCard {...mentor} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MentorsShowcase;
