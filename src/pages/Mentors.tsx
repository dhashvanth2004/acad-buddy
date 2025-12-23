import { useState, useMemo, useEffect } from "react";
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
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  department: string;
  year: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: string;
  bio: string;
}

const departments = [
  "All Departments",
  "Computer Science",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
  "Economics",
  "Business",
  "Engineering",
  "Medicine",
  "Law",
  "Arts",
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
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "mentor");

      if (error) {
        console.error("Error fetching mentors:", error);
        setLoading(false);
        return;
      }

      const formattedMentors: Mentor[] = (data || []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || "Anonymous Mentor",
        avatar: profile.avatar_url || getDefaultAvatar(profile.department),
        department: profile.department || "General",
        year: profile.year || "Student",
        subjects: profile.subjects || [],
        rating: 4.5 + Math.random() * 0.5, // Placeholder until reviews are implemented
        reviewCount: Math.floor(Math.random() * 50), // Placeholder
        hourlyRate: profile.hourly_rate || 0,
        availability: "Flexible", // Placeholder until availability is added
        bio: profile.bio || "Experienced mentor ready to help you succeed.",
      }));

      setMentors(formattedMentors);
      setLoading(false);
    };

    fetchMentors();
  }, []);

  const getDefaultAvatar = (department: string | null): string => {
    const avatars: Record<string, string> = {
      "Computer Science": "👩‍💻",
      "Physics": "👨‍🔬",
      "Mathematics": "👩‍🎓",
      "Chemistry": "🧪",
      "Biology": "🧬",
      "Economics": "📊",
      "Business": "💼",
      "Engineering": "⚙️",
      "Medicine": "👨‍⚕️",
      "Law": "⚖️",
      "Arts": "🎨",
    };
    return avatars[department || ""] || "👨‍🏫";
  };

  const filteredMentors = useMemo(() => {
    let result = [...mentors];

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
  }, [mentors, searchQuery, selectedDepartment, selectedSubjects, priceRange, sortBy]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("All Departments");
    setSelectedSubjects([]);
    setPriceRange([0, 500]);
    setSortBy("rating");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDepartment !== "All Departments" ||
    selectedSubjects.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500;

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
                    max={500}
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredMentors.length}</span>{" "}
                  {filteredMentors.length === 1 ? "mentor" : "mentors"}
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
                    {mentors.length === 0
                      ? "Be the first to become a mentor!"
                      : "Try adjusting your filters or search query"}
                  </p>
                  {mentors.length === 0 ? (
                    <Button asChild>
                      <a href="/become-mentor">Become a Mentor</a>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Mentors;
