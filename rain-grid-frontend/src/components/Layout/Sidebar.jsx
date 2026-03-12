import { useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"

const NAV_ITEMS = [
  {
    to: "/",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Dashboard"
  },
  {
    to: "/command",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Command"
  },
  {
    to: "/pumps",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Pumps"
  },
  {
    to: "/engineers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Engineers"
  },
  {
    to: "/wards",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Wards"
  }
]

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const location = useLocation()

  const isActive = (item) => {
    if (item.exact) return location.pathname === "/"
    return location.pathname.startsWith(item.to)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* ─── SIDEBAR ─── */}
      <aside
        className={`flex-shrink-0 flex flex-col h-full transition-all duration-300 bg-slate-900 border-r border-slate-800 ${
          expanded ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800 min-h-[64px]">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          {expanded && (
            <div className="font-bold text-white tracking-tight">
              <div className="text-base">RainGrid</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1">Command</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {expanded && <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>}
                {active && expanded && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`w-4 h-4 transition-transform duration-300 ${!expanded ? "rotate-180" : ""}`}
            >
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {expanded && <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT Area Fix ─── */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 relative">
          <Outlet />
      </main>
    </div>
  )
}



















// import { useState } from "react"
// import { NavLink, Outlet, useLocation } from "react-router-dom"

// // ─── Nav groups ───────────────────────────────────────────────────────────────
// const NAV_GROUPS = [
//   {
//     label: "Live",
//     items: [
//       {
//         to: "/", exact: true, label: "Map",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/command", label: "Command",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4" strokeLinecap="round"/></svg>
//       },
//       {
//         to: "/clusters", label: "Flood Clusters",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/spread", label: "Flood Spread",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-4.22-7.78-2.12 2.12M6.34 17.66l-2.12 2.12m0-13.56 2.12 2.12m9.9 9.9 2.12 2.12" strokeLinecap="round"/></svg>
//       },
//       {
//         to: "/city-intel", label: "City Intelligence",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       }
//     ]
//   },
//   {
//     label: "Resources",
//     items: [
//       {
//         to: "/pumps", label: "Pumps",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/engineers", label: "Engineers",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       }
//     ]
//   },
//   {
//     label: "Territory",
//     items: [
//       {
//         to: "/wards", label: "Ward Readiness",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/ward-dashboard", label: "Ward Ops",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round"/></svg>
//       }
//     ]
//   },
//   {
//     label: "Planning",
//     items: [
//       {
//         to: "/forecast", label: "Forecast",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/optimization", label: "Pump Placement",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/infrastructure", label: "Infra Risk",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       },
//       {
//         to: "/history", label: "Rainfall History",
//         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//       }
//     ]
//   }
// ]

// const NAV_BOTTOM = [
//   {
//     label: "Alerts",
//     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/></svg>
//   },
//   {
//     label: "Settings",
//     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
//   }
// ]

// export default function Sidebar() {
//   const [expanded, setExpanded] = useState(true)
//   const [tooltip, setTooltip] = useState(null)
//   const location = useLocation()

//   const isActive = (item) =>
//     item.exact ? location.pathname === "/" : location.pathname.startsWith(item.to)

//   return (
//     <div className="flex h-screen w-screen overflow-hidden bg-slate-50">

//       {/* ── SIDEBAR ── */}
//       <aside
//         className={`flex-shrink-0 flex flex-col h-full transition-all duration-300 bg-slate-900 border-r border-slate-800 ${
//           expanded ? "w-56" : "w-[60px]"
//         }`}
//       >
//         {/* Logo */}
//         <div className={`flex items-center border-b border-slate-800 min-h-[60px] ${expanded ? "gap-3 px-4 py-5" : "justify-center py-5"}`}>
//           <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
//             <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
//               <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
//             </svg>
//           </div>
//           {expanded && (
//             <div className="font-bold text-white tracking-tight overflow-hidden">
//               <div className="text-sm">RainGrid</div>
//               <div className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">Command</div>
//             </div>
//           )}
//         </div>

//         {/* Nav groups */}
//         <nav className="flex-1 overflow-y-auto py-3 px-2">
//           {NAV_GROUPS.map((group, gi) => (
//             <div key={group.label} className={gi > 0 ? "mt-2 pt-2 border-t border-slate-800" : ""}>

//               {/* Group label — only when expanded */}
//               {expanded && (
//                 <div className="px-3 pb-1 pt-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
//                   {group.label}
//                 </div>
//               )}

//               <div className="space-y-0.5">
//                 {group.items.map(item => {
//                   const active = isActive(item)
//                   return (
//                     <div key={item.to} className="relative">
//                       <NavLink
//                         to={item.to}
//                         className={`flex items-center py-2.5 rounded-xl transition-all duration-150 ${
//                           expanded ? "gap-3 px-3" : "justify-center w-full"
//                         } ${
//                           active
//                             ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
//                             : "text-slate-400 hover:bg-slate-800 hover:text-white"
//                         }`}
//                         onMouseEnter={() => !expanded && setTooltip(item.label)}
//                         onMouseLeave={() => setTooltip(null)}
//                       >
//                         <span className="flex-shrink-0">{item.icon}</span>
//                         {expanded && (
//                           <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
//                         )}
//                         {active && expanded && (
//                           <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
//                         )}
//                       </NavLink>

//                       {/* Tooltip — only when collapsed */}
//                       {!expanded && tooltip === item.label && (
//                         <div
//                           className="absolute pointer-events-none z-[9999]"
//                           style={{
//                             left: "calc(100% + 10px)",
//                             top: "50%",
//                             transform: "translateY(-50%)",
//                             background: "#0f172a",
//                             border: "1px solid rgba(255,255,255,0.1)",
//                             borderRadius: 8,
//                             padding: "4px 10px",
//                             whiteSpace: "nowrap",
//                             fontSize: 12,
//                             fontWeight: 600,
//                             color: "#fff",
//                             boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
//                           }}
//                         >
//                           {item.label}
//                         </div>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           ))}
//         </nav>

//         {/* Bottom icons — Alerts + Settings */}
//         <div className={`px-2 py-2 border-t border-slate-800 space-y-0.5`}>
//           {NAV_BOTTOM.map(item => (
//             <button
//               key={item.label}
//               title={item.label}
//               className={`flex items-center py-2.5 rounded-xl w-full transition-all duration-150 text-slate-500 hover:bg-slate-800 hover:text-white ${
//                 expanded ? "gap-3 px-3" : "justify-center"
//               }`}
//             >
//               {item.icon}
//               {expanded && <span className="text-xs font-semibold">{item.label}</span>}
//             </button>
//           ))}
//         </div>

//         {/* Collapse toggle */}
//         <div className="p-3 border-t border-slate-800">
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
//           >
//             <svg
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//               className={`w-4 h-4 transition-transform duration-300 ${!expanded ? "rotate-180" : ""}`}
//             >
//               <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//             {expanded && <span className="text-[10px] font-bold uppercase tracking-wider">Collapse</span>}
//           </button>
//         </div>
//       </aside>

//       {/* ── MAIN CONTENT ── */}
//       <main className="flex-1 h-full overflow-y-auto bg-slate-50 relative">
//         <Outlet />
//       </main>
//     </div>
//   )
// }