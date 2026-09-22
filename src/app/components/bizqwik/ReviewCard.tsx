import { Star } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ReviewCardProps {
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export function ReviewCard({ userName, userAvatar, rating, date, comment }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-[1.25rem] p-4 border border-[var(--bq-neutral-dark)]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--bq-neutral-dark)]">
          <ImageWithFallback
            src={userAvatar}
            alt={userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[var(--bq-text-primary)] truncate">{userName}</h4>
            <span className="text-xs text-[var(--bq-text-tertiary)] flex-shrink-0">{date}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < rating
                    ? "text-[var(--bq-accent)] fill-[var(--bq-accent)]"
                    : "text-[var(--bq-neutral-dark)]"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[var(--bq-text-secondary)] leading-relaxed">
            {comment}
          </p>
        </div>
      </div>
    </div>
  );
}
