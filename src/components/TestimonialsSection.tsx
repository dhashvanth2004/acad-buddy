import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Aditya Mehta",
    role: "2nd Year • CSE",
    avatar: "🧑‍🎓",
    content: "AcadBuddy helped me ace my Data Structures exam! My mentor Priya explained concepts in a way that finally made sense. The platform is so easy to use.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sneha Patel",
    role: "1st Year • ECE",
    avatar: "👩‍🎓",
    content: "As a fresher, I was struggling with the transition from school to college. My senior mentor not only helped with academics but also shared valuable tips for campus life.",
    rating: 5,
  },
  {
    id: 3,
    name: "Karthik Rao",
    role: "3rd Year • Mechanical",
    avatar: "👨‍🎓",
    content: "I started as a junior seeking help, and now I'm a mentor myself! This platform creates a beautiful cycle of knowledge sharing within our college.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Students <span className="text-primary font-extrabold">Say</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real stories from students who transformed their academic journey with AcadBuddy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="relative overflow-hidden hover:shadow-lg transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-xl shadow-md">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
