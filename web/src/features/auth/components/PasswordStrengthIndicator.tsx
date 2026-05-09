interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = [
      "",
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-emerald-500",
    ];

    return {
      level: Math.min(strength, 5),
      label: levels[Math.min(strength, 5)],
      color: colors[Math.min(strength, 5)],
    };
  };

  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
              i <= strength.level ? strength.color : "bg-gray-700/30"
            }`}
          ></div>
        ))}
      </div>
      <p
        className={`text-xs font-medium ${
          strength.level === 0
            ? "text-gray-400"
            : strength.level <= 2
              ? "text-red-400"
              : strength.level === 3
                ? "text-yellow-400"
                : "text-green-400"
        }`}
      >
        Strength: {strength.label}
      </p>
    </div>
  );
}