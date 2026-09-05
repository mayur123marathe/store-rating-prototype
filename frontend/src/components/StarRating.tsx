import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxRating?: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onChange?: (score: number) => void;
  showScore?: boolean;
  reviewCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  size = 'md',
  onChange,
  showScore = false,
  reviewCount,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const activeScore = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = activeScore >= starValue;
          const isHalf = !isFilled && activeScore >= starValue - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform'
                  : 'cursor-default'
              } p-0.5 focus:outline-none`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-300/50 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600 fill-transparent'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
