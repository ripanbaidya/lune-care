import React from "react";

export type FilterTab = "all" | "unread" | "read";

interface NotificationTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-1 bg-gray-900/50 border border-gray-800/50 rounded-xl p-1 w-fit">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={[
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === t.key
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
              : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50",
          ].join(" ")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
