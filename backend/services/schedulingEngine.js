/**
 * Precise, mathematically correct Real-Time Scheduling Engine
 * for Priority Inversion and Priority Inheritance (PIP) Simulation.
 *
 * Implements:
 * - Preemptive Priority-Based Scheduling
 * - Shared Resource R (Mutex) Locking, Contention, and Blocking
 * - Priority Inheritance Protocol (PIP)
 * - Priority Restoration upon Resource Release
 * - Accurate Cycle-by-Cycle Event Logging
 * - Accurate Gantt Chart Generation (including IDLE segments)
 * - Process Table Metrics (Base Pri, Arrival, Burst, CS Time, Blocked, Completion)
 * - Performance Metrics (H Blocking Time, Total Time, Reduction %)
 */

class RTOSSimulator {
  constructor(processesInput, usePI) {
    this.usePI = usePI;
    this.currentTime = 0;
    this.completedCount = 0;
    this.resourceOwner = -1; // index of owner, or -1
    this.waitingQueue = [];  // indices of blocked processes waiting for R
    this.ganttChart = [];    // { name, start, end }
    this.eventLog = [];      // "Time X: message"

    // Clone and initialize process states
    this.processes = processesInput.map(p => ({
      name: p.id || p.name,
      basePriority: Number(p.priority ?? p.basePriority),
      effectivePriority: Number(p.priority ?? p.basePriority),
      arrivalTime: Number(p.arrivalTime),
      burstTime: Number(p.burstTime),
      remainingTime: Number(p.burstTime),
      criticalSectionDuration: Number(p.criticalSection ?? p.criticalSectionDuration ?? 0),
      criticalSectionRemaining: Number(p.criticalSection ?? p.criticalSectionDuration ?? 0),
      criticalSectionStarted: false,
      hasResource: false,
      state: 'NEW', // 'NEW' | 'READY' | 'RUNNING' | 'BLOCKED' | 'COMPLETED'
      blockedSince: -1,
      totalBlockedTime: 0,
      completionTime: -1,
    }));
  }

  logEvent(message) {
    this.eventLog.push(`Time ${this.currentTime}: ${message}`);
  }

  addArrivals() {
    for (let i = 0; i < this.processes.length; i++) {
      const p = this.processes[i];
      if (p.state === 'NEW' && p.arrivalTime <= this.currentTime) {
        p.state = 'READY';
        this.logEvent(`${p.name} arrives with priority ${p.basePriority}`);
      }
    }
  }

  selectHighestPriorityProcess() {
    let selected = -1;
    for (let i = 0; i < this.processes.length; i++) {
      const p = this.processes[i];
      if (p.state === 'READY') {
        if (selected === -1) {
          selected = i;
        } else {
          const curr = this.processes[selected];
          if (p.effectivePriority > curr.effectivePriority) {
            selected = i;
          } else if (p.effectivePriority === curr.effectivePriority) {
            // Tie-break: earlier arrival time, then smaller index
            if (p.arrivalTime < curr.arrivalTime) {
              selected = i;
            }
          }
        }
      }
    }
    return selected;
  }

  updatePriorityInheritance(ownerIndex) {
    if (!this.usePI || ownerIndex === -1) return;

    const owner = this.processes[ownerIndex];
    let highestWaiting = owner.basePriority;

    for (const waitIdx of this.waitingQueue) {
      const waitingProc = this.processes[waitIdx];
      if (waitingProc.effectivePriority > highestWaiting) {
        highestWaiting = waitingProc.effectivePriority;
      }
    }

    if (owner.effectivePriority !== highestWaiting) {
      owner.effectivePriority = highestWaiting;
      this.logEvent(`${owner.name} inherits priority ${highestWaiting}`);
    }
  }

  requestResource(index) {
    const p = this.processes[index];

    // If process does not need resource or already acquired it
    if (p.criticalSectionDuration === 0 || p.criticalSectionStarted) {
      return true;
    }

    // Resource is currently free
    if (this.resourceOwner === -1) {
      this.resourceOwner = index;
      p.hasResource = true;
      p.criticalSectionStarted = true;
      this.logEvent(`${p.name} locks shared resource R`);
      return true;
    }

    // Resource is busy -> Process blocks
    p.state = 'BLOCKED';
    p.blockedSince = this.currentTime;
    this.waitingQueue.push(index);

    this.logEvent(`${p.name} is BLOCKED waiting for resource R`);
    this.updatePriorityInheritance(this.resourceOwner);

    return false;
  }

  releaseResource(ownerIndex, releaseTime) {
    if (this.resourceOwner !== ownerIndex) return;

    const owner = this.processes[ownerIndex];
    this.logEvent(`${owner.name} releases shared resource R`);
    owner.hasResource = false;

    // Restore base priority
    if (owner.effectivePriority !== owner.basePriority) {
      owner.effectivePriority = owner.basePriority;
      this.logEvent(`${owner.name} restores original priority ${owner.basePriority}`);
    }

    this.resourceOwner = -1;

    if (this.waitingQueue.length === 0) return;

    // Highest effective priority among waiting queue gets resource
    let bestQueuePos = 0;
    for (let i = 1; i < this.waitingQueue.length; i++) {
      const pIdx = this.waitingQueue[i];
      const bestIdx = this.waitingQueue[bestQueuePos];
      if (this.processes[pIdx].effectivePriority > this.processes[bestIdx].effectivePriority) {
        bestQueuePos = i;
      } else if (this.processes[pIdx].effectivePriority === this.processes[bestIdx].effectivePriority) {
        if (this.processes[pIdx].arrivalTime < this.processes[bestIdx].arrivalTime) {
          bestQueuePos = i;
        }
      }
    }

    const nextOwnerIndex = this.waitingQueue[bestQueuePos];
    this.waitingQueue.splice(bestQueuePos, 1);

    const next = this.processes[nextOwnerIndex];
    next.totalBlockedTime += (releaseTime - next.blockedSince);
    next.blockedSince = -1;
    next.state = 'READY';
    next.hasResource = true;
    next.criticalSectionStarted = true;

    this.resourceOwner = nextOwnerIndex;

    this.logEvent(`${next.name} becomes READY and receives resource R`);
    this.updatePriorityInheritance(nextOwnerIndex);
  }

  addGanttSegment(name) {
    if (
      this.ganttChart.length > 0 &&
      this.ganttChart[this.ganttChart.length - 1].name === name &&
      this.ganttChart[this.ganttChart.length - 1].end === this.currentTime
    ) {
      this.ganttChart[this.ganttChart.length - 1].end++;
    } else {
      this.ganttChart.push({
        name,
        start: this.currentTime,
        end: this.currentTime + 1
      });
    }
  }

  run() {
    const maxCycles = 10000;
    let safetyCounter = 0;

    while (this.completedCount < this.processes.length && safetyCounter++ < maxCycles) {
      this.addArrivals();

      const selected = this.selectHighestPriorityProcess();

      if (selected === -1) {
        this.addGanttSegment('IDLE');
        this.logEvent('CPU is IDLE');
        this.currentTime++;
        continue;
      }

      // Try acquiring resource if needed
      if (!this.requestResource(selected)) {
        // Resource request failed -> process blocked, re-evaluate scheduler at same cycle
        continue;
      }

      const p = this.processes[selected];
      p.state = 'RUNNING';

      this.logEvent(`${p.name} executes with effective priority ${p.effectivePriority}`);
      this.addGanttSegment(p.name);
      p.remainingTime--;

      if (p.hasResource && p.criticalSectionRemaining > 0) {
        p.criticalSectionRemaining--;
        if (p.criticalSectionRemaining === 0) {
          this.releaseResource(selected, this.currentTime + 1);
        }
      }

      if (p.remainingTime === 0) {
        p.state = 'COMPLETED';
        p.completionTime = this.currentTime + 1;
        this.completedCount++;
        this.logEvent(`${p.name} COMPLETED`);
      } else {
        p.state = 'READY';
      }

      this.currentTime++;
    }

    return {
      ganttChart: this.ganttChart,
      eventLog: this.eventLog,
      processDetails: this.processes.map(p => ({
        process: p.name,
        basePriority: p.basePriority,
        arrival: p.arrivalTime,
        burst: p.burstTime,
        criticalSection: p.criticalSectionDuration,
        blockedTime: p.totalBlockedTime,
        completionTime: p.completionTime
      }))
    };
  }
}

/**
 * Executes both Without PI and With PI simulations and computes metrics
 */
function executeSimulation(processesInput) {
  // Sort or preserve L, M, H order
  const order = ['L', 'M', 'H'];
  const sorted = [...processesInput].sort((a, b) => {
    const ai = order.indexOf(a.id || a.name);
    const bi = order.indexOf(b.id || b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    return (a.priority || 0) - (b.priority || 0);
  });

  const simWithout = new RTOSSimulator(sorted, false);
  const withoutPI = simWithout.run();

  const simWith = new RTOSSimulator(sorted, true);
  const withPI = simWith.run();

  // Metrics calculation
  const hWithout = withoutPI.processDetails.find(p => p.process === 'H');
  const hWith = withPI.processDetails.find(p => p.process === 'H');

  const blockingWithout = hWithout ? hWithout.blockedTime : 0;
  const blockingWith = hWith ? hWith.blockedTime : 0;

  const totalWithout = Math.max(...withoutPI.processDetails.map(p => p.completionTime), 0);
  const totalWith = Math.max(...withPI.processDetails.map(p => p.completionTime), 0);

  const saved = blockingWithout - blockingWith;
  let percentImprovement = 'N/A';

  if (blockingWithout > 0) {
    percentImprovement = ((saved / blockingWithout) * 100).toFixed(2);
  }

  const metrics = {
    blockingWithout,
    blockingWith,
    totalWithout,
    totalWith,
    saved,
    percentImprovement
  };

  // Build formatted rawOutput matching C++ simulator exact console style
  const rawOutput = formatTerminalOutput(sorted, withoutPI, withPI, metrics);

  return {
    withoutPI,
    withPI,
    metrics,
    rawOutput
  };
}

function formatTerminalOutput(processes, withoutPI, withPI, metrics) {
  let out = '';
  out += '\n============================================\n';
  out += ' PRIORITY INVERSION AND PRIORITY INHERITANCE\n';
  out += '       REAL-TIME OS SCHEDULING SIMULATOR\n';
  out += '============================================\n\n';

  out += '============================================\n';
  out += '       USER INPUT CONFIGURATION\n';
  out += '============================================\n';
  for (const p of processes) {
    out += `\nProcess: ${p.id || p.name}\n`;
    out += `Priority: ${p.priority || p.basePriority}\n`;
    out += `Arrival time: ${p.arrivalTime}\n`;
    out += `CPU burst: ${p.burstTime}\n`;
    out += `Critical section: ${p.criticalSection ?? p.criticalSectionDuration ?? 0}\n`;
  }

  // Without PI
  out += '\n========================================\n';
  out += ' SIMULATION WITHOUT PRIORITY INHERITANCE\n';
  out += '========================================\n';
  out += '\n----------- GANTT CHART -----------\n\n';
  out += withoutPI.ganttChart.map(s => `| ${s.name} [${s.start}-${s.end}] `).join('') + '|\n';
  out += '\n----------- EVENT LOG -----------\n\n';
  out += withoutPI.eventLog.join('\n') + '\n';
  out += '\n----------- PROCESS DETAILS -----------\n\n';
  out += 'Process   Base Pri    Arrival     Burst       CS Time     Blocked     Completion  \n';
  out += '----------------------------------------------------------------------------------\n';
  for (const p of withoutPI.processDetails) {
    out += `${p.process.padEnd(10)}${String(p.basePriority).padEnd(12)}${String(p.arrival).padEnd(12)}${String(p.burst).padEnd(12)}${String(p.criticalSection).padEnd(12)}${String(p.blockedTime).padEnd(12)}${String(p.completionTime).padEnd(12)}\n`;
  }

  // With PI
  out += '\n========================================\n';
  out += ' SIMULATION WITH PRIORITY INHERITANCE\n';
  out += '========================================\n';
  out += '\n----------- GANTT CHART -----------\n\n';
  out += withPI.ganttChart.map(s => `| ${s.name} [${s.start}-${s.end}] `).join('') + '|\n';
  out += '\n----------- EVENT LOG -----------\n\n';
  out += withPI.eventLog.join('\n') + '\n';
  out += '\n----------- PROCESS DETAILS -----------\n\n';
  out += 'Process   Base Pri    Arrival     Burst       CS Time     Blocked     Completion  \n';
  out += '----------------------------------------------------------------------------------\n';
  for (const p of withPI.processDetails) {
    out += `${p.process.padEnd(10)}${String(p.basePriority).padEnd(12)}${String(p.arrival).padEnd(12)}${String(p.burst).padEnd(12)}${String(p.criticalSection).padEnd(12)}${String(p.blockedTime).padEnd(12)}${String(p.completionTime).padEnd(12)}\n`;
  }

  // Performance Comparison
  out += '\n============================================\n';
  out += '         PERFORMANCE COMPARISON\n';
  out += '============================================\n\n';
  out += `${'Metric'.padEnd(32)}${'Without PI'.padEnd(18)}${'With PI'.padEnd(18)}\n`;
  out += '--------------------------------------------------------------------\n';
  out += `${'H Blocking Time'.padEnd(32)}${String(metrics.blockingWithout).padEnd(18)}${String(metrics.blockingWith).padEnd(18)}\n`;
  out += `${'Total Simulation Time'.padEnd(32)}${String(metrics.totalWithout).padEnd(18)}${String(metrics.totalWith).padEnd(18)}\n`;
  out += '--------------------------------------------------------------------\n';

  if (metrics.blockingWithout > 0) {
    out += `\nBlocking Time Reduction: ${metrics.percentImprovement}%\n`;
  } else {
    out += '\nH did not experience blocking without PI.\nPercentage reduction is not applicable.\n';
  }

  out += '\n============================================\n';
  out += '           SIMULATION COMPLETED\n';
  out += '============================================\n';

  return out;
}

module.exports = {
  RTOSSimulator,
  executeSimulation
};
