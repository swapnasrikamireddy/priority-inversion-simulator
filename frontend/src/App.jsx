import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SimulationWorkspace from './pages/SimulationWorkspace'
import SimulationResults from './pages/SimulationResults'
import './animations.css'

export default function App() {
  const [started, setStarted] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [simulationResult, setSimulationResult] = useState(null)
  const [inputProcesses, setInputProcesses] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSimulationComplete = (result, processes) => {
    setSimulationResult(result)
    setInputProcesses(processes)
    setActivePage('results')
  }

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />
  }

  return (
    <div className="flex min-h-screen bg-[#080d1a]">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        hasResults={!!simulationResult}
      />
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '260px' }}
      >
        <main className="max-w-6xl mx-auto px-6 py-8">
          {activePage === 'dashboard' && (
            <Dashboard setActivePage={setActivePage} />
          )}
          {activePage === 'workspace' && (
            <SimulationWorkspace onComplete={handleSimulationComplete} />
          )}
          {activePage === 'results' && simulationResult && (
            <SimulationResults
              result={simulationResult}
              processes={inputProcesses}
              setActivePage={setActivePage}
            />
          )}
          {activePage === 'results' && !simulationResult && (
            <div className="text-center py-32">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-400 text-lg mb-6">No simulation results yet.</p>
              <button
                onClick={() => setActivePage('workspace')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold transition-all"
              >
                Run a Simulation
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
