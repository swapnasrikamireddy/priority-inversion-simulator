/**
 * Parses the raw C++ simulator output into structured JSON.
 * 
 * The output has two main sections:
 * "SIMULATION WITHOUT PRIORITY INHERITANCE"
 * "SIMULATION WITH PRIORITY INHERITANCE"
 * Each contains: GANTT CHART, EVENT LOG, PROCESS DETAILS
 * Then a PERFORMANCE COMPARISON section.
 */
function parseSimulatorOutput(raw) {
  const result = {
    withoutPI: {},
    withPI: {},
    metrics: {}
  };

  // Split into sections
  const withoutPIStart = raw.indexOf('SIMULATION WITHOUT PRIORITY INHERITANCE');
  const withPIStart = raw.indexOf('SIMULATION WITH PRIORITY INHERITANCE');
  const perfStart = raw.indexOf('PERFORMANCE COMPARISON');

  const withoutPIText = raw.substring(withoutPIStart, withPIStart);
  const withPIText = raw.substring(withPIStart, perfStart);
  const perfText = raw.substring(perfStart);

  result.withoutPI = parseSection(withoutPIText);
  result.withPI = parseSection(withPIText);
  result.metrics = parseMetrics(perfText, result.withoutPI, result.withPI);

  return result;
}

function parseSection(text) {
  return {
    ganttChart: parseGanttChart(text),
    eventLog: parseEventLog(text),
    processDetails: parseProcessDetails(text)
  };
}

function parseGanttChart(text) {
  // Match pattern like: | L [0-1] | M [1-6] | ...
  const ganttLine = text.match(/\|[^\n]+\|/);
  if (!ganttLine) return [];

  const segments = [];
  const segRegex = /\|\s*(\w+)\s*\[(\d+)-(\d+)\]/g;
  let match;

  while ((match = segRegex.exec(ganttLine[0])) !== null) {
    segments.push({
      name: match[1],
      start: parseInt(match[2]),
      end: parseInt(match[3])
    });
  }

  return segments;
}

function parseEventLog(text) {
  const events = [];
  const eventSection = text.substring(
    text.indexOf('EVENT LOG'),
    text.indexOf('PROCESS DETAILS')
  );

  const lines = eventSection.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Time ')) {
      events.push(trimmed);
    }
  }

  return events;
}

function parseProcessDetails(text) {
  const details = [];
  const detailSection = text.substring(text.indexOf('PROCESS DETAILS'));

  const lines = detailSection.split('\n');
  let headerFound = false;

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip header lines
    if (trimmed.startsWith('Process') && trimmed.includes('Base Pri')) {
      headerFound = true;
      continue;
    }
    if (!headerFound) continue;
    if (trimmed.startsWith('-')) continue;
    if (!trimmed || trimmed.startsWith('=')) break;

    // Parse fixed-width columns: Process(10) BasePri(12) Arrival(12) Burst(12) CS(12) Blocked(12) Completion(12)
    const cols = trimmed.split(/\s+/);
    if (cols.length >= 7 && ['L','M','H'].includes(cols[0])) {
      details.push({
        process: cols[0],
        basePriority: parseInt(cols[1]),
        arrival: parseInt(cols[2]),
        burst: parseInt(cols[3]),
        criticalSection: parseInt(cols[4]),
        blockedTime: parseInt(cols[5]),
        completionTime: parseInt(cols[6])
      });
    }
  }

  return details;
}

function parseMetrics(perfText, withoutPI, withPI) {
  // Extract H blocking times from process details
  const hWithout = withoutPI.processDetails.find(p => p.process === 'H');
  const hWith = withPI.processDetails.find(p => p.process === 'H');

  const blockingWithout = hWithout ? hWithout.blockedTime : 0;
  const blockingWith = hWith ? hWith.blockedTime : 0;

  // Total sim time = max completion time
  const totalWithout = Math.max(...(withoutPI.processDetails.map(p => p.completionTime) || [0]));
  const totalWith = Math.max(...(withPI.processDetails.map(p => p.completionTime) || [0]));

  const saved = blockingWithout - blockingWith;
  const percentImprovement = blockingWithout > 0
    ? ((saved / blockingWithout) * 100).toFixed(2)
    : 'N/A';

  // Also try to parse from raw text
  const reductionMatch = perfText.match(/Blocking Time Reduction:\s*([\d.]+)%/);

  return {
    blockingWithout,
    blockingWith,
    totalWithout,
    totalWith,
    saved,
    percentImprovement: reductionMatch ? reductionMatch[1] : percentImprovement
  };
}

module.exports = { parseSimulatorOutput };
