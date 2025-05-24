import { ReactNode } from "react";

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
};

export default function MenuItem({ icon, label, active = false, badge }: MenuItemProps) {
  return (
    <div
      className={`flex items-center justify-between px-2 py-3 rounded-md cursor-pointer transition 
        ${active ? 'bg-cyan-700/50 text-white' : 'hover:bg-white/10 text-gray-300'}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-4 h-4 -translate-y-1">{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      {badge && (
        <span className="text-xs bg-cyan-700 px-2 py-0.5 rounded-md text-white font-semibold">
          {badge}
        </span>
      )}
    </div>
  );
}
