import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Clock, IndianRupee, X, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const mentorProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  department: z.string().min(1, "Please select a department"),
  year: z.string().min(1, "Please select your year"),
  bio: z.string().trim().min(50, "Bio must be at least 50 characters").max(500),
  subjects: z.array(z.string()).min(1, "Add at least one subject"),
  hourlyRate: z.number().min(0, "Rate cannot be negative").max(1000),
  availability: z.string().min(1, "Please select your availability"),
});

const departments = [
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
  "Other",
];

const years = ["2nd Year", "3rd Year", "4th Year", "5th Year", "Postgraduate", "PhD"];

const availabilityOptions = [
  "Weekdays",
  "Weekends",
  "Evenings",
  "Mornings",
  "Flexible",
  "Evenings & Weekends",
];

const suggestedSubjects = [
  "Data Structures",
  "Algorithms",
  "Python",
  "JavaScript",
  "React",
  "Machine Learning",
  "Calculus",
  "Linear Algebra",
  "Statistics",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Accounting",
  "Marketing",
  "Finance",
];

const BecomeMentor = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [availability, setAvailability] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login required",
        description: "Please log in or sign up to become a mentor.",
      });
      navigate("/signup");
    }
  }, [user, authLoading, navigate, toast]);

  const addSubject = (subject: string) => {
    const trimmed = subject.trim();
    if (trimmed && !subjects.includes(trimmed) && subjects.length < 10) {
      setSubjects([...subjects, trimmed]);
      setSubjectInput("");
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter((s) => s !== subject));
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject(subjectInput);
    }
  };

  const validateForm = () => {
    const result = mentorProfileSchema.safeParse({
      fullName,
      department,
      year,
      bio,
      subjects,
      hourlyRate,
      availability,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        newErrors[path] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!user) return;

    setLoading(true);

    try {
      // Update the user's profile to mentor role with all the details
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role: "mentor",
          department,
          year,
          bio,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Welcome to the AcadBuddy mentor community. Your profile is now live!",
      });

      navigate("/mentors");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto animate-slide-up">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Become a Mentor</h1>
            <p className="text-muted-foreground">
              Share your knowledge, help fellow students, and earn while making a difference in
              their academic journey.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Set your own rates</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium">Flexible schedule</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium">Teach what you love</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>Complete Your Mentor Profile</CardTitle>
              <CardDescription>
                Fill in the details below to create your mentor profile. Students will see this
                information when browsing for mentors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      1
                    </span>
                    Basic Information
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className={errors.department ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-destructive">{errors.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Current Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className={errors.year ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      2
                    </span>
                    Subjects You Can Teach
                  </h3>

                  <div className="space-y-2">
                    <Label>Add Subjects (up to 10)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a subject and press Enter"
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={handleSubjectKeyDown}
                        className={errors.subjects ? "border-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSubject(subjectInput)}
                      >
                        Add
                      </Button>
                    </div>
                    {errors.subjects && (
                      <p className="text-sm text-destructive">{errors.subjects}</p>
                    )}
                  </div>

                  {subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <Badge key={subject} variant="default" className="gap-1 pr-1">
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-sm">Quick add:</Label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSubjects
                        .filter((s) => !subjects.includes(s))
                        .slice(0, 8)
                        .map((subject) => (
                          <Badge
                            key={subject}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => addSubject(subject)}
                          >
                            + {subject}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Bio & Availability */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      3
                    </span>
                    About You
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell students about yourself, your experience, and teaching style. What makes you a great mentor?"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className={errors.bio ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between text-sm">
                      {errors.bio ? (
                        <p className="text-destructive">{errors.bio}</p>
                      ) : (
                        <span className="text-muted-foreground">Minimum 50 characters</span>
                      )}
                      <span className="text-muted-foreground">{bio.length}/500</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min={0}
                        max={1000}
                        placeholder="0 for free sessions"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className={errors.hourlyRate ? "border-destructive" : ""}
                      />
                      {errors.hourlyRate && (
                        <p className="text-sm text-destructive">{errors.hourlyRate}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Set to 0 if you want to offer free mentoring
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Select value={availability} onValueChange={setAvailability}>
                        <SelectTrigger className={errors.availability ? "border-destructive" : ""}>
                          <SelectValue placeholder="When are you available?" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.availability && (
                        <p className="text-sm text-destructive">{errors.availability}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-border">
                  <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    By submitting, you agree to our mentor guidelines and terms of service.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeMentor;
