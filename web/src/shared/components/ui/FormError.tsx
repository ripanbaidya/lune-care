import clsx from "clsx";

interface Props {
    error?: string | null;
    className?: string;
}

export function FormError({error, className}: Props) {
    if (!error) return null;

    return (
        <div
            role="alert"
            aria-live="polite"
            className={clsx(
                "w-full rounded-md border border-red-200 bg-red-50",
                "px-3 py-2 sm:px-4 sm:py-3",
                "text-xs sm:text-sm text-red-700",
                "break-words",
                className,
            )}
        >
            {error}
        </div>
    );
}
