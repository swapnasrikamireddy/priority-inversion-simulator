import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Cpu, Zap, Shield, AlertTriangle, Play, Lock, Clock } from 'lucide-react'

/* ── Animated floating particle ── */
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: style.size,
        height: style.size,
        left: style.left,
        top: style.top,
        background: style.color,
        opacity: 0,
        animation: `float-up ${style.duration}s ease-in-out ${style.delay}s infinite`,
        filter: 'blur(1px)',
      }}
    />
  )
}

/* ── Animated Gantt-like strip ── */
function AnimatedGantt() {
  const segments = [
    { label: 'L', color: '#10b981', w: 8 },
    { label: 'M', color: '#f59e0b', w: 20 },
    { label: 'L', color: '#10b981', w: 15 },
    { label: 'H', color: '#ef4444', w: 10 },
    { label: 'L', color: '#10b981', w: 5 },
  ]

  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % segments.length), 900)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="w-full">
      <div className="text-xs text-slate-500 mb-2 font-mono">GANTT CHART — Live Simulation</div>
      <div className="relative flex h-10 rounded-lg overflow-hidden border border-slate-700 bg-[#0a0f1e] gantt-scan">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={{
              width: `${seg.w * 2}%`,
              background: active === i
                ? `linear-gradient(90deg, ${seg.color}cc, ${seg.color})`
                : `${seg.color}44`,
              borderRight: '1px solid rgba(0,0,0,0.3)',
              color: active === i ? '#fff' : `${seg.color}99`,
              transform: active === i ? 'scaleY(1.05)' : 'scaleY(1)',
              boxShadow: active === i ? `0 0 12px ${seg.color}66` : 'none',
            }}
          >
            {seg.label}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
        {[0,2,4,6,8,10,12].map(t => <span key={t}>{t}</span>)}
      </div>
    </div>
  )
}

/* ── Orbiting process nodes ── */
function OrbitingProcesses() {
  const procs = [
    { label: 'H', color: '#ef4444', cls: 'animate-orbit-1', priority: 3 },
    { label: 'M', color: '#f59e0b', cls: 'animate-orbit-2', priority: 2 },
    { label: 'L', color: '#10b981', cls: 'animate-orbit-3', priority: 1 },
  ]
  return (
    <div className="relative w-52 h-52 flex items-center justify-center mx-auto">
      {/* orbit ring */}
      <div className="absolute w-44 h-44 rounded-full border border-blue-800/30" />
      {/* center CPU */}
      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center shadow-2xl animate-cpu-pulse">
        <Cpu size={28} className="text-white" />
        <span className="text-white text-xs font-bold mt-1">CPU</span>
      </div>
      {/* orbiting processes */}
      {procs.map(p => (
        <div key={p.label} className={`absolute w-44 h-44 flex items-center justify-center ${p.cls}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
            style={{
              background: `${p.color}22`,
              border: `2px solid ${p.color}`,
              color: p.color,
              boxShadow: `0 0 12px ${p.color}44`,
            }}
          >
            {p.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Priority bar widget ── */
function PriorityBar({ label, color, pct, blocked, delay }) {
  return (
    <div className="mb-3" style={{ opacity: 0, animation: `fade-in 0.5s ease-out ${delay}s forwards` }}>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold" style={{ color }}>{label}</span>
        <span className="text-slate-500">{blocked ? '⛔ BLOCKED' : `Priority ${pct}`}</span>
      </div>
      <div className="h-5 rounded-md bg-[#0a0f1e] border border-slate-800 overflow-hidden relative">
        <div
          className="h-full rounded-md transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: blocked
              ? `repeating-linear-gradient(45deg,${color}33,${color}33 8px,${color}66 8px,${color}66 16px)`
              : `linear-gradient(90deg,${color}88,${color})`,
            boxShadow: blocked ? 'none' : `0 0 10px ${color}44`,
          }}
        />
        {blocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock size={10} className="text-orange-400" />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main Landing Page ── */
export default function LandingPage({ onStart }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    size: `${Math.random() * 6 + 3}px`,
    left: `${Math.random() * 100}%`,
    top: `${50 + Math.random() * 50}%`,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 5],
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 5,
  }))

  const [piPhase, setPiPhase] = useState(0)
  // Animate through priority inversion phases
  useEffect(() => {
    const t = setInterval(() => setPiPhase(p => (p + 1) % 4), 2000)
    return () => clearInterval(t)
  }, [])

  const phases = [
    { h: 33, m: 66, l: 100, hBlocked: false, mBlocked: false, note: 'L holds resource R' },
    { h: 33, m: 66, l: 100, hBlocked: true,  mBlocked: false, note: 'H arrives → BLOCKED by L' },
    { h: 33, m: 66, l: 100, hBlocked: true,  mBlocked: false, note: 'M preempts L (No PI!)' },
    { h: 66, m: 66, l: 100, hBlocked: false, mBlocked: false, note: 'L inherits H priority (PI!)' },
  ]
  const phase = phases[piPhase]

  return (
    <div className="min-h-screen bg-[#080d1a] overflow-hidden relative flex flex-col">

      {/* ── Moving grid background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'grid-move 4s linear infinite',
          }}
        />
        {/* Radial glow centers */}
        <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/6 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-cyan-600/5 blur-3xl" />
        {/* Particles */}
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="text-slate-300 text-sm font-semibold tracking-wide">CSE 302 — Operating Systems</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Simulator Ready</span>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full mx-auto">

          {/* Badge */}
          <div
            className="flex justify-center mb-6"
            style={{ opacity: 0, animation: 'fade-in 0.6s ease-out 0.1s forwards' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
              <Zap size={14} />
              Real-Time Operating Systems Project
              <Zap size={14} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h1
              className="text-5xl md:text-7xl font-black leading-tight mb-2"
              style={{ opacity: 0, animation: 'slide-up 0.8s ease-out 0.2s forwards' }}
            >
              <span className="text-white">Priority </span>
              <span className="animate-shimmer">Inversion</span>
            </h1>
            <h1
              className="text-5xl md:text-7xl font-black leading-tight mb-2"
              style={{ opacity: 0, animation: 'slide-up 0.8s ease-out 0.35s forwards' }}
            >
              <span className="text-white">and Priority </span>
              <span className="animate-shimmer">Inheritance</span>
            </h1>
            <h2
              className="text-2xl md:text-3xl font-light text-slate-400 mt-3"
              style={{ opacity: 0, animation: 'slide-up 0.8s ease-out 0.5s forwards' }}
            >
              in{' '}
              <span className="text-cyan-400 font-semibold">Real‑Time Systems</span>
            </h2>
          </div>

          {/* Subtitle */}
          <p
            className="text-center text-slate-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ opacity: 0, animation: 'fade-in 0.8s ease-out 0.6s forwards' }}
          >
            An interactive full-stack simulator that demonstrates how priority inversion
            degrades real-time performance — and how priority inheritance solves it —
            powered by a real C++ scheduling engine.
          </p>

          {/* Start button */}
          <div
            className="flex justify-center mb-16"
            style={{ opacity: 0, animation: 'slide-up 0.8s ease-out 0.7s forwards' }}
          >
            <button
              onClick={onStart}
              className="group relative flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all duration-300 animate-glow hover:scale-105"
            >
              <Play size={22} className="animate-bounce-soft" />
              Start Simulation
              <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
              {/* Ripple ring */}
              <span className="absolute inset-0 rounded-2xl border-2 border-blue-400/40 animate-ping" style={{ animationDuration: '2s' }} />
            </button>
          </div>

          {/* ── Three feature panels ── */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            style={{ opacity: 0, animation: 'fade-in 1s ease-out 0.9s forwards' }}
          >
            {/* Panel 1 — Orbiting CPU */}
            <div className="bg-[#0d1528]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <OrbitingProcesses />
              <div className="text-center mt-4">
                <div className="text-white font-semibold text-sm">Preemptive Scheduler</div>
                <div className="text-slate-500 text-xs mt-1">L, M, H processes compete for CPU</div>
              </div>
            </div>

            {/* Panel 2 — Live Gantt */}
            <div className="bg-[#0d1528]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-center">
              <AnimatedGantt />
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" /> L — Low Priority
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-3 h-3 rounded-sm bg-amber-500" /> M — Medium Priority
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-3 h-3 rounded-sm bg-red-500" /> H — High Priority
                </div>
              </div>
            </div>

            {/* Panel 3 — Priority bars animation */}
            <div className="bg-[#0d1528]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-xs text-slate-500 mb-3 font-mono flex items-center gap-2">
                <Clock size={12} />
                Phase {piPhase + 1}/4 — {phase.note}
              </div>
              <PriorityBar label="H (High)" color="#ef4444" pct={phase.h} blocked={phase.hBlocked} delay={0} />
              <PriorityBar label="M (Med)"  color="#f59e0b" pct={phase.m} blocked={phase.mBlocked} delay={0.1} />
              <PriorityBar label="L (Low)"  color="#10b981" pct={phase.l} blocked={false} delay={0.2} />
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[#0a0f1e] border border-slate-800">
                {piPhase < 3
                  ? <AlertTriangle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  : <Shield size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                }
                <p className="text-xs text-slate-400 leading-relaxed">
                  {piPhase === 0 && 'L runs and locks shared resource R.'}
                  {piPhase === 1 && 'H arrives and tries to acquire R — it is BLOCKED by L.'}
                  {piPhase === 2 && 'Without PI: M freely preempts L, delaying H further.'}
                  {piPhase === 3 && 'With PI: L inherits H\'s priority — M cannot preempt!'}
                </p>
              </div>
              {/* phase dots */}
              <div className="flex justify-center gap-2 mt-4">
                {[0,1,2,3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === piPhase ? 'bg-blue-400 scale-125' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats bar ── */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ opacity: 0, animation: 'fade-in 1s ease-out 1.1s forwards' }}
          >
            {[
              { icon: <Cpu size={18}/>, label: 'Scheduling Algorithm', val: 'Preemptive Priority', color: 'text-blue-400' },
              { icon: <Lock size={18}/>, label: 'Shared Resource', val: 'Mutex R (1 instance)', color: 'text-purple-400' },
              { icon: <AlertTriangle size={18}/>, label: 'Problem Shown', val: 'Priority Inversion', color: 'text-orange-400' },
              { icon: <Shield size={18}/>, label: 'Solution Applied', val: 'Priority Inheritance', color: 'text-emerald-400' },
            ].map(({ icon, label, val, color }) => (
              <div key={label} className="text-center p-4 rounded-xl bg-[#0d1528]/60 border border-slate-800">
                <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
                <div className={`text-sm font-bold ${color}`}>{val}</div>
                <div className="text-slate-600 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 text-center py-4 border-t border-slate-800/40 text-slate-600 text-xs">
        CSE 302 Operating Systems · Priority Inversion & Inheritance Simulator · Powered by C++ Engine
      </div>
    </div>
  )
}
