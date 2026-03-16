import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
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
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

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

  const { data: mentors = [], isLoading: loading } = useQuery({
    queryKey: ["mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "mentor");

      if (error) throw error;

      const mentorUserIds = (data || []).map((p) => p.user_id);

      const reviewMap: Record<string, { sum: number; count: number }> = {};
      if (mentorUserIds.length > 0) {
        const { data: allReviews } = await supabase
          .from("reviews")
          .select("mentor_id, rating")
          .in("mentor_id", mentorUserIds);

        (allReviews || []).forEach((r) => {
          if (!reviewMap[r.mentor_id]) reviewMap[r.mentor_id] = { sum: 0, count: 0 };
          reviewMap[r.mentor_id].sum += r.rating;
          reviewMap[r.mentor_id].count += 1;
        });
      }

      return (data || []).map((profile) => {
        const stats = reviewMap[profile.user_id];
        return {
          id: profile.id,
          name: profile.full_name || "Anonymous Mentor",
          avatar: profile.avatar_url || getDefaultAvatar(profile.department),
          department: profile.department || "General",
          year: profile.year || "Student",
          subjects: profile.subjects || [],
          rating: stats ? stats.sum / stats.count : 0,
          reviewCount: stats?.count || 0,
          hourlyRate: profile.hourly_rate || 0,
          availability: "Flexible",
          bio: profile.bio || "Experienced mentor ready to help you succeed.",
        };
      });
    },
    staleTime: 5 * 60 * 1000 // Cache locally for 5 minutes instead of re-fetching instantly
  });

  const filteredMentors = useMemo(() => {
    let result = [...mentors];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
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
  }, [mentors, debouncedSearch, selectedDepartment, selectedSubjects, priceRange, sortBy]);

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
      <section className="scroll-mt-20 pt-24 pb-8 bg-gradient-to-b from-primary/5 to-background">
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 bg-card rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    Filters
                  </h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search mentors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 focus:bg-background transition-colors"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium mb-3 block text-foreground/80">Department</label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="bg-background/50">
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
                  <div className="pt-2">
                    <label className="text-sm font-medium mb-4 flex justify-between text-foreground/80">
                      <span>Hourly Rate</span>
                      <span className="text-primary font-semibold">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  {/* Subjects */}
                  <div className="pt-2 pb-2">
                    <label className="text-sm font-medium mb-3 block text-foreground/80">Popular Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.slice(0, 8).map((subject) => (
                        <Badge
                          key={subject}
                          variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                          className={`cursor-pointer transition-all hover:scale-[1.02] ${selectedSubjects.includes(subject) ? 'shadow-sm' : 'hover:bg-primary/5 hover:border-primary/30'}`}
                          onClick={() => toggleSubject(subject)}
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Results */}
          <main className="w-full lg:w-3/4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <p className="text-muted-foreground text-sm font-medium">
                Showing <span className="font-semibold text-foreground">{filteredMentors.length}</span>{" "}
                {filteredMentors.length === 1 ? "mentor" : "mentors"}
              </p>

              {/* Sort */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground font-medium hidden sm:inline-block">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48 bg-card shadow-sm border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-card rounded-xl border border-border/60 animate-pulse shadow-sm" />
                ))}
              </div>
            ) : filteredMentors.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMentors.map((mentor, index) => (
                  <div
                    key={mentor.id}
                    className="animate-fade-in h-full"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <MentorCard {...mentor} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card border border-dashed rounded-xl border-border">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No mentors found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {mentors.length === 0
                    ? "Be the first to become a mentor upon the platform!"
                    : "Try adjusting your filters, clearing subjects, or broadening your search query."}
                </p>
                {mentors.length === 0 ? (
                  <Button asChild className="shadow-sm">
                    <a href="/become-mentor">Become a Mentor</a>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={clearFilters} className="bg-background">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Mentors;
