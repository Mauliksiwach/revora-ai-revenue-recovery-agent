import React from "react";
import { Activity, ShieldCheck, Zap } from "lucide-react";

interface NavbarProps {
  serverConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ serverConnected }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800/80 px-6 py-3.5 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg tracking-wider">
          R
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">REVORA</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v1.0 • Phase 1
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">AI Revenue Recovery</p>
        </div>
      </div>

      {/* Center Tagline */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 bg-gray-900/60 px-3.5 py-1.5 rounded-full border border-gray-800">
        <Zap className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-gray-300 font-medium italic">"Find lost revenue. Recover it. Learn from it."</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System Health Status */}
        <div className="flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-gray-900/80 border border-gray-800">
          <span className={`w-2 h-2 rounded-full ${serverConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
          <span className="text-gray-300 font-medium">
            {serverConnected ? "Engine Online" : "Connecting..."}
          </span>
        </div>

        {/* Razorpay Buildathon Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-300 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 px-3 py-1 rounded-lg border border-blue-700/30">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-gray-300 font-medium">Razorpay AI Buildathon</span>
        </div>
      </div>
    </header>
  );
};
