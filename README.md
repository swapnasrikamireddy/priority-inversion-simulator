# Priority Inversion & Priority Inheritance Simulator

A full-stack web application for the CSE302 Operating Systems project.

## Quick Start (Windows)

Simply double-click `start_project.bat` — it will:
1. Compile `main.cpp` into `priority_sim.exe` (if not already compiled)
2. Install npm dependencies (if not already installed)
3. Start the backend on port 3001
4. Start the frontend on port 5173
5. Open http://localhost:5173 in your browser

## Manual Setup

### Prerequisites
- Node.js (https://nodejs.org/)
- Dev-C++ or MinGW (g++ compiler at `C:\Program Files (x86)\Dev-Cpp\MinGW64\bin\g++.exe`)

### Step 1: Compile the C++ Simulator
```bat
"C:\Program Files (x86)\Dev-Cpp\MinGW64\bin\g++.exe" -o priority_sim.exe main.cpp -std=c++11 -static
```

### Step 2: Start Backend
```bat
cd backend
npm install
node server.js
```

### Step 3: Start Frontend (new terminal)
```bat
cd frontend
npm install
npm run dev
```

### Step 4: Open Browser
Navigate to: http://localhost:5173

## Project Structure
```
cse302os/
├── main.cpp              ← Your original C++ simulator (READ-ONLY, never modified)
├── priority_sim.exe      ← Compiled simulator
├── start_project.bat     ← One-click Windows launcher
├── backend/
│   ├── server.js         ← Express server (port 3001)
│   ├── routes/           ← API routes
│   ├── controllers/      ← Request handlers
│   └── services/         ← Simulator, parser, validation
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/        ← Dashboard, SimulationWorkspace, SimulationResults
    │   └── components/   ← Navbar
    └── index.html
```

## Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express.js
- **Simulation**: Original C++ (main.cpp) compiled to priority_sim.exe

## API
`POST /api/simulation/run`
```json
{
  "processes": [
    { "id": "L", "priority": 1, "arrivalTime": 0, "burstTime": 5, "criticalSection": 4 },
    { "id": "M", "priority": 2, "arrivalTime": 1, "burstTime": 5, "criticalSection": 0 },
    { "id": "H", "priority": 3, "arrivalTime": 2, "burstTime": 2, "criticalSection": 1 }
  ]
}
```
