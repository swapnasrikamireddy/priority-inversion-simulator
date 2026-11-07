import { useState } from 'react'
import { Play, RotateCcw, Loader2, AlertCircle, Zap, Lock, ChevronRight, Info } from 'lucide-react'

const DEFAULT_PROCESSES = [
  { id: 'L', label: 'LOW PRIORITY PROCESS', color: 'emerald', priority: 1, arrivalTime: 0, burstTime: 5, criticalSection: 4 },
  { id: 'M', label: 'MEDIUM PRIORITY PROCESS', color: 'yellow', priority: 2, arrivalTime: 1, burstTime: 5, criticalSection: 0 },
  { id: 'H', label: 'HIGH PRIORITY PROCESS', color: 'red', priority: 3, arrivalTime: 2, burstTime: 2, criticalSection: 1 },
]

const EXAMPLES = [
  {
    label: 'Case 1',
    desc: 'Classic Priority Inversion',
    processes: [
      { id: 'L', priority: 1, arrivalTime: 0, burstTime: 5, criticalSection: 4 },
      { id: 'M', priority: 2, arrivalTime: 1, burstTime: 5, criticalSection: 0 },
      { id: 'H', priority: 3, arrivalTime: 2, burstTime: 2, criticalSection: 1 },
    ]
  },
  {
    label: 'Case 2',
    desc: 'Extended Critical Section',
    processes: [
      { id: 'L', priority: 1, arrivalTime: 0, burstTime: 8, criticalSection: 6 },
      { id: 'M', priority: 3, arrivalTime: 1, burstTime: 5, criticalSection: 0 },
      { id: 'H', priority: 4, arrivalTime: 2, burstTime: 2, criticalSection: 1 },
    ]
  },
  {
    label: 'Case 3',
    desc: 'High Priority Gap Arrival',
    processes: [
      { id: 'L', priority: 2, arrivalTime: 0, burstTime: 10, criticalSection: 7 },
      { id: 'M', priority: 4, arrivalTime: 2, burstTime: 4, criticalSection: 0 },
      { id: 'H', priority: 6, arrivalTime: 4, burstTime: 3, criticalSection: 2 },
    ]
  },
]

const PROCESS_COLORS = {
  L: { border: 'border-emerald-500/40', bg: 'bg-emerald-900/20', badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  M: { border: 'border-yellow-500/40', bg: 'bg-yellow-900/20', badge: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400', text: 'text-yellow-400' },
  H: { border: 'border-red-500/40', bg: 'bg-red-900/20', badge: 'bg-red-500/20 text-red-400', dot: 'bg-red-400', text: 'text-red-400' },
}

export default function SimulationWorkspace({ onComplete }) {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES.map(p => ({ ...p })))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateProcess = (id, field, value) => {
    setProcesses(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p
    ))
    setError(null)
  }

  const applyExample = (example) => {
    setProcesses(prev => prev.map(p => {
      const ex = example.processes.find(e => e.id === p.id)
      return ex ? { ...p, ...ex } : p
    }))
    setError(null)
  }

  const reset = () => {
    setProcesses(DEFAULT_PROCESSES.map(p => ({ ...p })))
    setError(null)
  }

  const runSimulation = async () => {
    setLoading(true)
    setError(null)

    try {
      let response
      try {
        response = await fetch('/api/simulation/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processes: processes.map(p => ({
            id: p.id,
            priority: p.priority,
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            criticalSection: p.criticalSection
          })) })
        })
      } catch (networkErr) {
        throw new Error(
          'Cannot connect to backend. Make sure the backend server is running:\n' +
          '  cd backend && node server.js\n' +
          '(It should be listening on port 3001)'
        )
      }

      // Safely parse JSON — avoid "Unexpected end of JSON input"
      let data
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(
          `Backend returned non-JSON response (status ${response.status}).\n` +
          `Response preview: ${text.substring(0, 200)}`
        )
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`)
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Simulation returned no results')
      }

      onComplete(data.data, processes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">SIMULATION WORKSPACE</h1>
        <p className="text-slate-400 mt-1">Configure the workload and run the C++ simulator</p>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-[#0d1528] border border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Lock size={14} className="text-blue-400" />
          <span>Shared mutex: <span className="text-blue-400 font-semibold">R</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Info size={14} className="text-blue-400" />
          <span>Higher number = Higher priority</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <ChevronRight size={14} className="text-blue-400" />
          <span>Priority order: <span className="text-emerald-400">L</span> &lt; <span className="text-yellow-400">M</span> &lt; <span className="text-red-400">H</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Info size={14} className="text-blue-400" />
          <span>Critical section ≤ CPU burst</span>
        </div>
      </div>

      {/* Example Buttons */}
      <div className="flex flex-wrap gap-3">
        <span className="text-slate-400 text-sm self-center font-medium">Load Example:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => applyExample(ex)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Zap size={13} className="text-blue-400" />
            {ex.label}
            <span className="text-slate-400 text-xs">— {ex.desc}</span>
          </button>
        ))}
      </div>

      {/* Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {processes.map(p => {
          const colors = PROCESS_COLORS[p.id]
          const label = p.id === 'L' ? 'LOW PRIORITY PROCESS' : p.id === 'M' ? 'MEDIUM PRIORITY PROCESS' : 'HIGH PRIORITY PROCESS'
          return (
            <div key={p.id} className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl ${colors.badge} flex items-center justify-center text-xl font-bold`}>
                  {p.id}
                </div>
                <div>
                  <div className={`text-xs font-bold ${colors.text} tracking-wider`}>{label}</div>
                  <div className="text-slate-500 text-xs">Process {p.id}</div>
                </div>
                <div className={`ml-auto w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              </div>

              <div className="space-y-4">
                <InputField label="Priority" value={p.priority} min={1} max={1000}
                  onChange={v => updateProcess(p.id, 'priority', v)} color={colors.text} />
                <InputField label="Arrival Time" value={p.arrivalTime} min={0} max={10000}
                  onChange={v => updateProcess(p.id, 'arrivalTime', v)} color={colors.text} />
                <InputField label="CPU Burst" value={p.burstTime} min={1} max={10000}
                  onChange={v => updateProcess(p.id, 'burstTime', v)} color={colors.text} />
                <InputField
                  label={`Critical Section${p.id === 'M' ? ' (0 = no resource)' : ''}`}
                  value={p.criticalSection} min={0} max={p.burstTime}
                  onChange={v => updateProcess(p.id, 'criticalSection', v)} color={colors.text}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={reset}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          onClick={runSimulation}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Running C++ Simulator...
            </>
          ) : (
            <>
              <Play size={18} />
              Run Simulation
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function InputField({ label, value, min, max, onChange, color }) {
  return (
    <div>
      <label className="block text-slate-400 text-xs font-medium mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-[#0a0f1e] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all`}
      />
    </div>
  )
}
