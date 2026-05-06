import React from "react";
import clsx from "clsx";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
    label?: string; // accessibility
}

const sizeMap: Record<SpinnerSize, string> = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-4",
};

const Spinner: React.FC<SpinnerProps> = ({
                                             size = "md",
                                             className,
                                             label = "Loading...",
                                         }) => {
    return (
        <div
            role="status"
            aria-label={label}
            className={clsx(
                "inline-block rounded-full border-gray-300 border-t-black animate-spin",
                sizeMap[size],
                className,
            )}
        />
    );
};

export default Spinner;
