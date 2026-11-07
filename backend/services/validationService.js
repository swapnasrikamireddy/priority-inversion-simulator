function validateInput(processes) {
  if (!processes || !Array.isArray(processes) || processes.length !== 3) {
    return 'Must provide exactly 3 processes: L, M, H.';
  }

  const L = processes.find(p => p.id === 'L');
  const M = processes.find(p => p.id === 'M');
  const H = processes.find(p => p.id === 'H');

  if (!L || !M || !H) return 'Must provide processes with ids L, M, H.';

  for (const p of [L, M, H]) {
    if (p.priority < 1 || p.priority > 1000)
      return `Process ${p.id}: priority must be between 1 and 1000.`;
    if (p.arrivalTime < 0 || p.arrivalTime > 10000)
      return `Process ${p.id}: arrival time must be 0–10000.`;
    if (p.burstTime < 1 || p.burstTime > 10000)
      return `Process ${p.id}: burst time must be 1–10000.`;
    if (p.criticalSection < 0 || p.criticalSection > p.burstTime)
      return `Process ${p.id}: critical section must be 0 to burst time.`;
  }

  if (!(L.priority < M.priority && M.priority < H.priority)) {
    return 'Priorities must satisfy L < M < H.';
  }

  return null;
}

module.exports = { validateInput };
