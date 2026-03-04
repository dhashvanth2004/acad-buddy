import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger, getErrorMessage } from "@/lib/error-logger";

interface ReviewFormProps {
  sessionId: string;
  mentorId: string;
  studentId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ sessionId, mentorId, studentId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ variant: "destructive", title: "Please select a rating" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        session_id: sessionId,
        mentor_id: mentorId,
        student_id: studentId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      onReviewSubmitted();
    } catch (error) {
      logger.error("Failed to submit review", error, {
        component: "ReviewForm",
        sessionId,
        mentorId,
      });
      const errorMessage = getErrorMessage(error);
      toast({
        variant: "destructive",
        title: "Failed to submit review",
        description: errorMessage.includes("duplicate") 
          ? "You've already reviewed this session." 
          : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "text-accent fill-current"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
      </div>
      <Textarea
        placeholder="Share your experience (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="resize-none"
      />
      <Button onClick={handleSubmit} disabled={submitting || rating === 0} size="sm" className="gap-2">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Submit Review
      </Button>
    </div>
  );
};

export default ReviewForm;
