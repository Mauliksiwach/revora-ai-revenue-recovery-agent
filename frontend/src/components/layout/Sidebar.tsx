import React from "react";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Bot,
  VolumeX,
  FlaskConical,
  History,
  Settings,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    {
      id: "command_center",
      label: "Revenue Command Center",
      icon: LayoutDashboard,
      phase: "Phase 1",
      active: true,
      ready: true,
    },
    {
      id: "revenue_detective",
      label: "AI Revenue Detective",
      icon: Search,
      phase: "Phase 2",
      ready: true,
    },
    {
      id: "recovery_opportunities",
      label: "Recovery Opportunities",
      icon: Sparkles,
      phase: "Phase 3",
      ready: false,
    },
    {
      id: "revora_agent",
      label: "Revora Agent",
      icon: Bot,
      phase: "Phase 4",
      ready: false,
    },
    {
      id: "smart_silence",
      label: "Smart Silence",
      icon: VolumeX,
      phase: "Phase 5",
      ready: false,
    },
    {
      id: "recovery_lab",
      label: "Recovery Lab",
      icon: FlaskConical,
      phase: "Phase 6",
      ready: false,
    },
    {
      id: "decision_timeline",
      label: "Decision Timeline",
      icon: History,
      phase: "Phase 7",
      ready: false,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-gray-800/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-60px)]">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase px-3 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => item.ready && setActiveTab(item.id)}
                  disabled={!item.ready}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group text-left ${
                    isSelected
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                      : item.ready
                      ? "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      : "text-gray-600 cursor-not-allowed opacity-60 hover:bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected
                          ? "text-blue-400"
                          : item.ready
                          ? "text-gray-400 group-hover:text-gray-200"
                          : "text-gray-600"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        item.ready
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {item.phase}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Phase Info Box */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-900/60 p-3.5 rounded-xl border border-gray-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-300 font-semibold">Active Milestone</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              1 of 7
            </span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed mb-3">
            Payment Intelligence Dashboard with real-time Indian payment failure patterns and synthetic generation.
          </p>
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[14.28%]" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-gray-800/80">
        <div className="flex items-center justify-between text-xs text-gray-500 px-2">
          <span>Razorpay AI Buildathon</span>
          <span className="font-mono text-[10px]">2026</span>
        </div>
      </div>
    </aside>
  );
};
