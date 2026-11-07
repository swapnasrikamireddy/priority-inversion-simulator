import { Cpu, BarChart2, Play } from 'lucide-react'

export default function Navbar({ activePage, setActivePage }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Cpu },
    { id: 'workspace', label: 'Simulation', icon: Play },
    { id: 'results', label: 'Results', icon: BarChart2 },
  ]

  return (
    <nav className="border-b border-slate-800 bg-[#0d1528] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cpu size={20} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">
                Priority Inversion & Inheritance
              </div>
              <div className="text-xs text-slate-400 leading-tight">
                Real-Time OS Scheduling Simulator
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
