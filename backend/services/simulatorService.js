const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const EXE_PATH = path.join(__dirname, '..', '..', 'priority_sim.exe');

function runCppSimulator(stdinData) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(EXE_PATH)) {
      return reject(new Error(
        `Simulator executable not found at: ${EXE_PATH}. ` +
        `Please compile main.cpp first using: ` +
        `"C:\\Program Files (x86)\\Dev-Cpp\\MinGW64\\bin\\g++.exe" -o priority_sim.exe main.cpp -std=c++11 -static`
      ));
    }

    const child = spawn(EXE_PATH, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      if (code === 0 || stdout.includes('SIMULATION COMPLETED')) {
        resolve(stdout);
      } else {
        reject(new Error(`Simulator exited with code ${code}. stderr: ${stderr}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start simulator: ${err.message}`));
    });

    // Write input and close stdin
    child.stdin.write(stdinData);
    child.stdin.end();
  });
}

module.exports = { runCppSimulator };
