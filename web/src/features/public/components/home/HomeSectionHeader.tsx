import React from "react";

interface HomeSectionHeaderProps {
  badge?: string;
  title: string;
  subtitle: string;
  centered?: boolean;
}

const HomeSectionHeader: React.FC<HomeSectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  centered = false,
}) => {
  return (
    <div className={centered ? "text-center max-w-3xl mx-auto" : "max-w-3xl"}>
      {badge ? (
        <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
          {badge}
        </span>
      ) : null}
      <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white leading-tight">
        {title}
      </h2>
      <p className="mt-3 text-gray-400 text-base sm:text-lg leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};

export default HomeSectionHeader;
