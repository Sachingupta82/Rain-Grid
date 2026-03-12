import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import MapView from "../components/Map/MapView";
import SimulationPanel from "../components/Simulation/SimulationPanel";
import RainfallTimeline from "../components/Simulation/RainfallTimeline";
import GridInsightsPanel from "../components/Dashboard/GridInsightsPanel";

/**
 * Dashboard Component
 * * The central command interface for FloodSense.
 * Adheres to the SecureOne Design System:
 * - Slate-50 neutral backgrounds
 * - Premium rounded-3xl cards
 * - Motion-driven entrance effects
 * - High-contrast functional typography
 */
export default function Dashboard() {
  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ─── MAIN WORKSPACE AREA ─── */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* 1. GEOSPATIAL ENGINE (Full-bleed Map) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <MapView />
        </motion.div>

        {/* 2. SYSTEM STATUS OVERLAY (Top-Left) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          className="absolute left-6 top-6 z-[1500] pointer-events-none"
        >
          {/* <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-40" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">System Live</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Zap size={10} className="text-blue-600 fill-blue-600" /> SecureOne Nodes Active
              </span>
            </div>
          </div> */}
        </motion.div>

        {/* 3. SIMULATION INTELLIGENCE (Floating Panel Top-Right) */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 15 }}
          className="absolute right-6 top-6 z-[1500] pointer-events-none w-full max-w-[340px]"
        >
          <div className="pointer-events-auto">
            {/* SimulationPanel handles its own SecureOne Card styling internally */}
            <SimulationPanel />
          </div>
        </motion.div>

        {/* 4. CONTEXTUAL INSIGHTS (Right-side Sliding Drawer) */}
        <div className="z-[2000]">
          <GridInsightsPanel />
        </div>
      </div>

      {/* ─── TEMPORAL CONTROL BAR (Integrated Bottom) ─── */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
        className="h-24 bg-white border-t border-slate-100 z-[1000] relative shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]"
      >
        {/* <RainfallTimeline /> */}
      </motion.div>
    </div>
  );
}