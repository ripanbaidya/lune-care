import clsx from "clsx";

interface Props {
    message?: string;
    id?: string; // for aria-describedby
    className?: string;
}

export function FieldErrorMessage({message, id, className}: Props) {
    if (!message) return null;

    return (
        <p
            id={id}
            role="alert"
            aria-live="polite"
            className={clsx(
                "mt-1 text-xs sm:text-sm text-red-500",
                "break-words",
                className,
            )}
        >
            {message}
        </p>
    );
}
