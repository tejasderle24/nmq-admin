// import React from 'react'

// function LoginLeftSide() {
//     return (
//         <div className='hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-slate-200'>
//             <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" >
//             </div>

//             <div className="relative z-10 flex flex-col items-start justify-center p-12 lg:p-20 w-full h-full">
//                 <h1 className="text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight tracking-tight">
//                     Nashik <br /> Misal Quese
//                 </h1>
//                 <p className="text-slate-400 text-lg max-w-md leading-relaxed">
//                     Lorem ipsum dolor sit amet consectetur adipisicing elit. Non vel rem illo obcaecati voluptatum dolor facilis nemo numquam ab? Quidem.
//                 </p>
//             </div>
//         </div>
//     )
// }

// export default LoginLeftSide

import React from 'react'
import { Flame, Users, Clock, Sparkles } from 'lucide-react'

function LoginLeftSide() {
  return (
    <div className="hidden md:flex w-1/2 bg-slate-950 relative overflow-hidden border-r border-slate-800 select-none">
      {/* =============================================
          BACKGROUND AMBIENT GLOWS & GRID PATTERN
      ============================================= */}
      {/* Top Left Gradient Glowing Orb */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
      
      {/* Bottom Right Orange Accent Glow (Misal / Spice Theme Accent) */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* =============================================
          MAIN CONTENT CONTAINER
      ============================================= */}
      <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full h-full">
        {/* TOP BRAND BADGE */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-1.5">
              Live Queue Management <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            </span>
          </div>
        </div>

        {/* MIDDLE HERO HEADLINE & TEXT */}
        <div className="my-auto py-8">
          <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold tracking-wider text-xs uppercase">
            <Flame className="w-4 h-4" />
            Authentic Nashik Taste
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-6">
            Skip the Line, <br />
            Savor the <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Spicy Misal</span>
          </h1>

          <p className="text-slate-400 text-base lg:text-lg max-w-md leading-relaxed font-normal">
            Real-time queue tracking and token management for Nashik’s iconic food spots. Get notified when your table is ready!
          </p>
        </div>

        {/* BOTTOM LIVE HIGHLIGHT CARDS */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Avg Wait Time</div>
              <div className="text-sm font-bold text-white mt-0.5">~12 Mins</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">Daily Foodies</div>
              <div className="text-sm font-bold text-white mt-0.5">1,200+ Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginLeftSide