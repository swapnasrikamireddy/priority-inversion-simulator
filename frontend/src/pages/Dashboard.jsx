import { AlertTriangle, Shield, Share2, Zap, ChevronRight, Info } from 'lucide-react'

export default function Dashboard({ setActivePage }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-[#0d1528] border border-blue-800/30 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <Zap size={12} />
            Operating Systems Project
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            PRIORITY INVERSION
          </h1>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            & PRIORITY INHERITANCE
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mb-6">
            Real-Time Operating Systems Scheduling Simulator — Demonstrating priority inversion
            problems and priority inheritance solutions with live C++ simulation.
          </p>
          <button
            onClick={() => setActivePage('workspace')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
          >
            Launch Simulator
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConceptCard
          icon={<AlertTriangle className="text-orange-400" size={24} />}
          color="orange"
          title="Priority Inversion"
          description="A problem where a high-priority task is blocked by a lower-priority task that holds a shared resource, while medium-priority tasks preempt the low-priority holder — causing the high-priority task to wait longer than necessary."
          badge="The Problem"
        />
        <ConceptCard
          icon={<Shield className="text-green-400" size={24} />}
          color="green"
          title="Priority Inheritance"
          description="A solution where the low-priority task holding a resource temporarily inherits the priority of the highest-priority blocked task. This prevents medium-priority tasks from preempting it, reducing the high-priority task's blocking time."
          badge="The Solution"
        />
        <ConceptCard
          icon={<Share2 className="text-blue-400" size={24} />}
          color="blue"
          title="Shared Mutex R"
          description="The shared resource (mutex R) is the contention point. Low (L) acquires it first for its critical section, High (H) then tries to acquire it and gets blocked. Medium (M) has no critical section — it can freely preempt L without PI."
          badge="Shared Resource"
        />
      </div>

      {/* Simulation Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-blue-400" size={20} />
            <h3 className="text-white font-semibold text-lg">Simulation Capabilities</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Three processes: Low (L), Medium (M), High (H) priority',
              'One shared mutex resource R',
              'Preemptive priority-based scheduling',
              'Side-by-side Without PI vs With PI comparison',
              'Real-time Gantt chart visualization',
              'Chronological event trace from C++ engine',
              'Quantitative blocking time metrics',
              'Percentage improvement calculation'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">How It Works</h3>
          <div className="space-y-4">
            {[
              { step: '1', label: 'Configure Processes', desc: 'Set priorities, arrival times, burst durations, and critical section lengths for L, M, and H.' },
              { step: '2', label: 'Run Simulation', desc: 'The backend executes your compiled C++ simulator with the provided inputs via stdin.' },
              { step: '3', label: 'Parse Results', desc: 'C++ output is parsed: Gantt charts, event logs, process details, and metrics extracted.' },
              { step: '4', label: 'Visualize', desc: 'Results displayed as interactive charts, Gantt timelines, tables, and event traces.' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{label}</div>
                  <div className="text-slate-400 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConceptCard({ icon, color, title, description, badge }) {
  const colors = {
    orange: 'border-orange-800/30 bg-orange-900/10',
    green: 'border-green-800/30 bg-green-900/10',
    blue: 'border-blue-800/30 bg-blue-900/10'
  }
  const badgeColors = {
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  }

  return (
    <div className={`rounded-2xl border p-6 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-slate-800/60">{icon}</div>
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${badgeColors[color]}`}>
          {badge}
        </span>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
