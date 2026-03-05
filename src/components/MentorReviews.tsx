import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student_name: string | null;
}

interface MentorReviewsProps {
  mentorUserId: string;
}

const MentorReviews = ({ mentorUserId }: MentorReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, student_id")
        .eq("mentor_id", mentorUserId)
        .order("created_at", { ascending: false });

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Fetch student names
      const studentIds = [...new Set(data.map((r) => r.student_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", studentIds);

      const enrichedReviews = data.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        student_name: profiles?.find((p) => p.user_id === r.student_id)?.full_name || "Anonymous",
      }));

      setReviews(enrichedReviews);
      if (enrichedReviews.length > 0) {
        setAverageRating(enrichedReviews.reduce((sum, r) => sum + r.rating, 0) / enrichedReviews.length);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [mentorUserId]);

  const getInitials = (name: string | null) => {
    if (!name || name === "Anonymous") return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Student Reviews
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({averageRating.toFixed(1)} avg · {reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet.</p>
            <p className="text-sm mt-1">Be the first to review this mentor.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(review.student_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.student_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= review.rating ? "text-accent fill-current" : "text-muted-foreground/30"
                          }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MentorReviews;
