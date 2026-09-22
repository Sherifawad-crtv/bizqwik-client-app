import { motion } from "motion/react";
import { Star, Clock, Calendar } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Badge } from "../ui/badge";

interface SessionCardProps {
  title: string;
  instructor: {
    name: string;
    photo: string;
  };
  rating: number;
  description: string;
  duration: number; // in minutes
  timeSlots: string[];
  tags: string[];
  onBook: () => void;
}

export function SessionCard({
  title,
  instructor,
  rating,
  description,
  duration,
  timeSlots,
  tags,
  onBook,
}: SessionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[1.5rem] overflow-hidden border border-[var(--bq-neutral-dark)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--transition-base)]"
    >
      {/* Header with Instructor */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[var(--bq-primary)]/10">
            <ImageWithFallback
              src={instructor.photo}
              alt={instructor.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[var(--bq-text-primary)] truncate">
              {title}
            </h3>
            <p className="text-sm text-[var(--bq-text-secondary)] truncate">
              {instructor.name}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[var(--bq-neutral)] px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="w-4 h-4 text-[var(--bq-accent)] fill-[var(--bq-accent)]" />
            <span className="font-mono text-sm text-[var(--bq-text-primary)]">{rating}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-[var(--bq-primary)]/10 text-[var(--bq-primary)] border-0 rounded-full px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--bq-text-secondary)] line-clamp-2 mb-3">
          {description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)]">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--bq-text-secondary)]">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{timeSlots.length} slots</span>
          </div>
        </div>

        {/* Time Slots */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {timeSlots.slice(0, 3).map((slot, index) => (
            <button
              key={index}
              className="px-3 py-1.5 bg-[var(--bq-neutral)] rounded-lg text-sm text-[var(--bq-text-secondary)] hover:bg-[var(--bq-primary)]/10 hover:text-[var(--bq-primary)] transition-colors duration-[var(--transition-fast)] whitespace-nowrap flex-shrink-0"
            >
              {slot}
            </button>
          ))}
          {timeSlots.length > 3 && (
            <div className="px-3 py-1.5 text-sm text-[var(--bq-text-tertiary)] whitespace-nowrap flex-shrink-0">
              +{timeSlots.length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Book Button */}
      <div className="px-4 pb-4">
        <button
          onClick={onBook}
          className="w-full h-11 bg-[var(--bq-primary)] text-white rounded-[1rem] transition-all duration-[var(--transition-base)] hover:bg-[var(--bq-primary-dark)] active:scale-[0.98] shadow-sm flex items-center justify-center"
        >
          Book Session
        </button>
      </div>
    </motion.div>
  );
}
