import { 
  LayoutDashboard, 
  Play, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Cpu
} from 'lucide-react'

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  collapsed, 
  setCollapsed, 
  hasResults 
}) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & Theory' },
    { id: 'workspace', label: 'Simulation', icon: Play, desc: 'Workload & Execution' },
    { 
      id: 'results', 
      label: 'Results & Charts', 
      icon: BarChart3, 
      desc: 'Metrics & Timelines',
      badge: hasResults ? 'Ready' : null
    },
  ]

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0d1424] border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out select-none shadow-xl`}
      style={{ width: collapsed ? '72px' : '260px' }}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Cpu size={22} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-white font-bold text-sm tracking-wide leading-tight truncate">
                RTOS Simulator
              </span>
              <span className="text-slate-400 text-[11px] font-medium tracking-wider uppercase">
                CSE 302 Project
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation section */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        <div>
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
          )}
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/10 text-white font-semibold border border-blue-500/30 shadow-inner' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon 
                    size={20} 
                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`} 
                  />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="truncate">
                        <div className="text-sm leading-snug truncate">{item.label}</div>
                        <div className="text-[11px] text-slate-400 font-normal leading-tight truncate">
                          {item.desc}
                        </div>
                      </div>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0a0f1d]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} text-xs text-slate-500`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400 font-mono text-[11px]">C++ Engine: Online</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">v1.0</span>
            </>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="C++ Engine Online" />
          )}
        </div>
      </div>
    </aside>
  )
}
