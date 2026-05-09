import React from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

interface StarRatingProps {
  value: number; // 0–5, supports decimals in display mode
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean; // render the numeric value beside stars
  className?: string;
}

const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = "md",
  showValue = false,
  className,
}) => {
  const [hovered, setHovered] = React.useState<number>(0);
  const px = SIZE_MAP[size];
  const active = !readOnly && hovered > 0 ? hovered : value;

  const handleClick = (star: number) => {
    if (readOnly || !onChange) return;
    onChange(star);
  };

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = active >= star;
          const half = !filled && active >= star - 0.5 && readOnly;

          return (
            <span
              key={star}
              role={readOnly ? "img" : "button"}
              aria-label={readOnly ? `${star} star` : `Rate ${star}`}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(0)}
              className={clsx(
                "relative transition-transform",
                !readOnly && "cursor-pointer hover:scale-110",
              )}
            >
              {/* Background star (empty) */}
              <Star size={px} className="text-gray-700" fill="currentColor" />
              {/* Overlay for filled / half */}
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: half ? "50%" : "100%" }}
                >
                  <Star
                    size={px}
                    className="text-amber-400"
                    fill="currentColor"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span
          className={clsx(
            "font-semibold text-gray-300 tabular-nums",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
          )}
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};
