import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import MentorCard from "@/components/MentorCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, SlidersHorizontal, X } from "lucide-react";

// Mock data for mentors
const mockMentors = [
  {
    id: "1",
    name: "Priya Sharma",
    avatar: "👩‍💻",
    department: "Computer Science",
    year: "4th Year",
    subjects: ["Data Structures", "Algorithms", "Python", "Machine Learning"],
    rating: 4.9,
    reviewCount: 47,
    hourlyRate: 200,
    availability: "Evenings & Weekends",
    bio: "Passionate about teaching programming concepts. I've helped 50+ students ace their coding interviews and improve their grades.",
  },
  {
    id: "2",
    name: "Rahul Verma",
    avatar: "👨‍🔬",
    department: "Physics",
    year: "3rd Year",
    subjects: ["Mechanics", "Electromagnetism", "Quantum Physics"],
    rating: 4.7,
    reviewCount: 32,
    hourlyRate: 150,
    availability: "Weekdays",
    bio: "Physics enthusiast with a knack for simplifying complex theories. Let's make physics fun together!",
  },
  {
    id: "3",
    name: "Ananya Patel",
    avatar: "👩‍🎓",
    department: "Mathematics",
    year: "4th Year",
    subjects: ["Calculus", "Linear Algebra", "Statistics", "Probability"],
    rating: 5.0,
    reviewCount: 63,
    hourlyRate: 250,
    availability: "Flexible",
    bio: "Mathematics gold medalist. I believe every student can excel in math with the right guidance and practice.",
  },
  {
    id: "4",
    name: "Arjun Reddy",
    avatar: "👨‍💻",
    department: "Computer Science",
    year: "3rd Year",
    subjects: ["Web Development", "React", "Node.js", "JavaScript"],
    rating: 4.8,
    reviewCount: 28,
    hourlyRate: 0,
    availability: "Weekends",
    bio: "Full-stack developer and open source contributor. Happy to help fellow students for free!",
  },
  {
    id: "5",
    name: "Sneha Gupta",
    avatar: "👩‍⚕️",
    department: "Chemistry",
    year: "4th Year",
    subjects: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
    rating: 4.6,
    reviewCount: 41,
    hourlyRate: 180,
    availability: "Mornings",
    bio: "Chemistry can be magical when you understand the concepts. Let me help you discover the beauty of molecules!",
  },
  {
    id: "6",
    name: "Vikram Singh",
    avatar: "👨‍🏫",
    department: "Economics",
    year: "3rd Year",
    subjects: ["Microeconomics", "Macroeconomics", "Econometrics"],
    rating: 4.5,
    reviewCount: 19,
    hourlyRate: 120,
    availability: "Evenings",
    bio: "Economics student with internship experience at top consulting firms. Real-world insights included!",
  },
  {
    id: "7",
    name: "Kavya Nair",
    avatar: "👩‍🔬",
    department: "Biology",
    year: "4th Year",
    subjects: ["Molecular Biology", "Genetics", "Biochemistry"],
    rating: 4.9,
    reviewCount: 55,
    hourlyRate: 200,
    availability: "Flexible",
    bio: "Research assistant with published papers. I can help you understand complex biological concepts with visual aids.",
  },
  {
    id: "8",
    name: "Rohan Mehta",
    avatar: "👨‍💼",
    department: "Business",
    year: "3rd Year",
    subjects: ["Accounting", "Finance", "Marketing"],
    rating: 4.4,
    reviewCount: 22,
    hourlyRate: 100,
    availability: "Weekdays",
    bio: "Business student with case competition wins. Let's tackle those case studies together!",
  },
];

const departments = [
  "All Departments",
  "Computer Science",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
  "Economics",
  "Business",
];

const subjects = [
  "Data Structures",
  "Algorithms",
  "Python",
  "Machine Learning",
  "Web Development",
  "React",
  "Calculus",
  "Linear Algebra",
  "Statistics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Accounting",
];

const Mentors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filteredMentors = useMemo(() => {
    let result = [...mockMentors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(query) ||
          mentor.subjects.some((s) => s.toLowerCase().includes(query)) ||
          mentor.department.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment !== "All Departments") {
      result = result.filter((mentor) => mentor.department === selectedDepartment);
    }

    // Subject filter
    if (selectedSubjects.length > 0) {
      result = result.filter((mentor) =>
        selectedSubjects.some((subject) =>
          mentor.subjects.some((s) => s.toLowerCase().includes(subject.toLowerCase()))
        )
      );
    }

    // Price filter
    result = result.filter(
      (mentor) => mentor.hourlyRate >= priceRange[0] && mentor.hourlyRate <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "price-high":
        result.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case "reviews":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [searchQuery, selectedDepartment, selectedSubjects, priceRange, sortBy]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("All Departments");
    setSelectedSubjects([]);
    setPriceRange([0, 300]);
    setSortBy("rating");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDepartment !== "All Departments" ||
    selectedSubjects.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 300;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
            <p className="text-muted-foreground">
              Browse through our verified senior mentors and find the right match for your
              academic needs.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, subject, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-card rounded-xl border border-border animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="w-4 h-4" />
                    Clear all
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Department */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}/hr
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={300}
                    step={10}
                    className="mt-4"
                  />
                </div>

                {/* Subjects */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Popular Subjects</label>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {subjects.slice(0, 8).map((subject) => (
                      <Badge
                        key={subject}
                        variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => toggleSubject(subject)}
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredMentors.length}</span>{" "}
              mentors
            </p>
          </div>

          {filteredMentors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMentors.map((mentor, index) => (
                <div
                  key={mentor.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <MentorCard {...mentor} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Mentors;
