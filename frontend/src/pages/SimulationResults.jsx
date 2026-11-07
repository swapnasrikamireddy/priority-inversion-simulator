import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingDown, Clock, ArrowRight, CheckCircle, AlertTriangle, Activity, List, Table2, ChevronLeft } from 'lucide-react'

const PROCESS_COLORS = {
  L: '#10b981',   // emerald
  M: '#f59e0b',   // amber
  H: '#ef4444',   // red
  IDLE: '#334155' // slate
}

export default function SimulationResults({ result, processes, setActivePage }) {
  const { withoutPI, withPI, metrics } = result

  const blockingChartData = [
    {
      name: 'H Blocking Time',
      'Without PI': metrics.blockingWithout,
      'With PI': metrics.blockingWith,
    }
  ]

  const totalTimeChartData = [
    {
      name: 'Total Sim Time',
      'Without PI': metrics.totalWithout,
      'With PI': metrics.totalWith,
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SIMULATION RESULTS</h1>
          <p className="text-slate-400 mt-1">Actual output from your compiled C++ simulator</p>
        </div>
        <button
          onClick={() => setActivePage('workspace')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm transition-colors"
        >
          <ChevronLeft size={16} />
          New Simulation
        </button>
      </div>

      {/* ======================== METRICS ======================== */}
      <section>
        <SectionTitle icon={<Activity size={18} />} title="Performance Metrics" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="H Blocking Without PI"
            value={`${metrics.blockingWithout} units`}
            icon={<AlertTriangle size={20} className="text-orange-400" />}
            color="orange"
          />
          <MetricCard
            label="H Blocking With PI"
            value={`${metrics.blockingWith} units`}
            icon={<CheckCircle size={20} className="text-green-400" />}
            color="green"
          />
          <MetricCard
            label="Blocking Time Saved"
            value={`${metrics.saved} units`}
            icon={<TrendingDown size={20} className="text-blue-400" />}
            color="blue"
          />
          <MetricCard
            label="Percentage Improvement"
            value={metrics.blockingWithout > 0 ? `${metrics.percentImprovement}%` : 'N/A'}
            icon={<Clock size={20} className="text-purple-400" />}
            color="purple"
            highlight
          />
        </div>
      </section>

      {/* ======================== BAR CHARTS ======================== */}
      <section>
        <SectionTitle icon={<BarChart size={18} />} title="Performance Comparison" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="H Process Blocking Time">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={blockingChartData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1528', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="Without PI" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="With PI" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Total Simulation Duration">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={totalTimeChartData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0d1528', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="Without PI" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="With PI" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* ======================== GANTT CHARTS ======================== */}
      <section>
        <SectionTitle icon={<Clock size={18} />} title="Gantt Charts" />
        <div className="space-y-4">
          <GanttChart title="Without Priority Inheritance" segments={withoutPI.ganttChart} />
          <GanttChart title="With Priority Inheritance" segments={withPI.ganttChart} />
        </div>
      </section>

      {/* ======================== PROCESS TABLES ======================== */}
      <section>
        <SectionTitle icon={<Table2 size={18} />} title="Process Execution Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProcessTable title="Without Priority Inheritance" rows={withoutPI.processDetails} />
          <ProcessTable title="With Priority Inheritance" rows={withPI.processDetails} />
        </div>
      </section>

      {/* ======================== EVENT LOG ======================== */}
      <section>
        <SectionTitle icon={<List size={18} />} title="Event Trace" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventLog title="Without Priority Inheritance" events={withoutPI.eventLog} />
          <EventLog title="With Priority Inheritance" events={withPI.eventLog} />
        </div>
      </section>

      {/* ======================== SUMMARY ======================== */}
      <section>
        <SectionTitle icon={<CheckCircle size={18} />} title="Analysis & Conclusion" />
        <div className="rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-blue-800/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={16} />
                Without Priority Inheritance
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                H arrived and immediately tried to acquire resource R — already held by L.
                H got blocked. Meanwhile, M (medium priority) preempted L since M has no resource dependency.
                L remained stuck running at low priority while M completed. This caused H to wait{' '}
                <span className="text-orange-400 font-semibold">{metrics.blockingWithout} time units</span> — a classic
                priority inversion.
              </p>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <CheckCircle size={16} />
                With Priority Inheritance
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                When H blocked, L immediately inherited H's priority. This prevented M from preempting L.
                L quickly completed its critical section and released R. H acquired R without further delay.
                H's blocking time reduced to{' '}
                <span className="text-green-400 font-semibold">{metrics.blockingWith} time units</span> —
                a <span className="text-blue-400 font-semibold">{metrics.percentImprovement}%</span> improvement.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 flex items-center gap-3 text-sm text-slate-300">
            <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold">
              Without PI: {metrics.blockingWithout} units blocked
            </div>
            <ArrowRight size={16} className="text-slate-500" />
            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-semibold">
              With PI: {metrics.blockingWith} units blocked
            </div>
            <ArrowRight size={16} className="text-slate-500" />
            <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
              {metrics.percentImprovement}% improvement
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// =================== SUB COMPONENTS ===================

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-blue-400">{icon}</span>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="flex-1 h-px bg-slate-800 ml-3" />
    </div>
  )
}

function MetricCard({ label, value, icon, color, highlight }) {
  const colors = {
    orange: 'border-orange-800/30 bg-orange-900/10',
    green: 'border-green-800/30 bg-green-900/10',
    blue: 'border-blue-800/30 bg-blue-900/10',
    purple: 'border-purple-800/30 bg-purple-900/10',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]} ${highlight ? 'ring-1 ring-purple-500/30' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-xs font-medium leading-tight">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-purple-300' : 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 text-sm">{title}</h3>
      {children}
    </div>
  )
}

function GanttChart({ title, segments }) {
  if (!segments || segments.length === 0) return null

  const maxTime = Math.max(...segments.map(s => s.end))
  const totalDuration = maxTime || 1

  return (
    <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <div className="flex gap-3">
          {['L','M','H','IDLE'].map(name => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PROCESS_COLORS[name] }} />
              <span className="text-slate-400 text-xs">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Bar */}
      <div className="relative h-14 rounded-lg overflow-hidden flex">
        {segments.map((seg, i) => {
          const width = ((seg.end - seg.start) / totalDuration) * 100
          const color = PROCESS_COLORS[seg.name] || '#475569'
          return (
            <div
              key={i}
              className="h-full flex items-center justify-center text-white text-xs font-bold relative group"
              style={{
                width: `${width}%`,
                backgroundColor: color,
                borderRight: i < segments.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none'
              }}
              title={`${seg.name}: ${seg.start} → ${seg.end}`}
            >
              {width > 4 && seg.name}
            </div>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="relative mt-1 flex" style={{ height: '20px' }}>
        {segments.map((seg, i) => {
          const leftPct = (seg.start / totalDuration) * 100
          return (
            <div
              key={i}
              className="absolute text-slate-500 text-xs"
              style={{ left: `${leftPct}%` }}
            >
              {seg.start}
            </div>
          )
        })}
        <div
          className="absolute text-slate-500 text-xs"
          style={{ right: 0 }}
        >
          {maxTime}
        </div>
      </div>

      {/* Segment Labels */}
      <div className="mt-3 flex flex-wrap gap-2">
        {segments.map((seg, i) => (
          <span
            key={i}
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: `${PROCESS_COLORS[seg.name]}20`, color: PROCESS_COLORS[seg.name], border: `1px solid ${PROCESS_COLORS[seg.name]}40` }}
          >
            {seg.name} [{seg.start}–{seg.end}]
          </span>
        ))}
      </div>
    </div>
  )
}

function ProcessTable({ title, rows }) {
  return (
    <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Process','Base Pri','Arrival','Burst','Crit. Sec','Blocked','Completion'].map(h => (
                <th key={h} className="pb-2 text-left text-slate-400 text-xs font-medium pr-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50">
                <td className="py-2 pr-3">
                  <span className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: `${PROCESS_COLORS[row.process]}20`, color: PROCESS_COLORS[row.process] }}>
                    {row.process}
                  </span>
                </td>
                <td className="py-2 pr-3 text-slate-300">{row.basePriority}</td>
                <td className="py-2 pr-3 text-slate-300">{row.arrival}</td>
                <td className="py-2 pr-3 text-slate-300">{row.burst}</td>
                <td className="py-2 pr-3 text-slate-300">{row.criticalSection}</td>
                <td className="py-2 pr-3">
                  <span className={row.blockedTime > 0 ? 'text-orange-400 font-semibold' : 'text-slate-300'}>
                    {row.blockedTime}
                  </span>
                </td>
                <td className="py-2 text-slate-300">{row.completionTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EventLog({ title, events }) {
  const getEventStyle = (event) => {
    if (event.includes('locks')) return 'text-blue-400'
    if (event.includes('releases')) return 'text-green-400'
    if (event.includes('BLOCKED')) return 'text-orange-400'
    if (event.includes('inherits')) return 'text-purple-400'
    if (event.includes('COMPLETED')) return 'text-emerald-400'
    if (event.includes('becomes READY')) return 'text-cyan-400'
    if (event.includes('restores')) return 'text-yellow-400'
    if (event.includes('arrives')) return 'text-slate-300'
    return 'text-slate-400'
  }

  return (
    <div className="bg-[#0d1528] border border-slate-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      <div className="space-y-1 max-h-72 overflow-y-auto">
        {events.map((event, i) => {
          const timeMatch = event.match(/^Time (\d+): (.+)$/)
          return (
            <div key={i} className="flex items-start gap-3 py-1">
              {timeMatch ? (
                <>
                  <span className="text-slate-500 text-xs w-14 flex-shrink-0 font-mono pt-0.5">
                    t={timeMatch[1]}
                  </span>
                  <span className={`text-xs leading-relaxed ${getEventStyle(timeMatch[2])}`}>
                    {timeMatch[2]}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-xs">{event}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
