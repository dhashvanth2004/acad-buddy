import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface MentorCardProps {
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

const MentorCard = ({
  id,
  name,
  avatar,
  department,
  year,
  subjects,
  rating,
  reviewCount,
  hourlyRate,
  availability,
  bio,
}: MentorCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{name}</h3>
            <p className="text-muted-foreground text-sm">
              {department} • {year}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "text-accent fill-current"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({reviewCount})
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} variant="subject">
              {subject}
            </Badge>
          ))}
          {subjects.length > 3 && (
            <Badge variant="muted">+{subjects.length - 3}</Badge>
          )}
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{bio}</p>

        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {availability}
          </div>
          <div className="font-semibold text-primary">
            {hourlyRate === 0 ? "Free" : `₹${hourlyRate}/hr`}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="default" className="flex-1" asChild>
            <Link to={`/mentor/${id}`}>View Profile</Link>
          </Button>
          <Button variant="outline" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorCard;
