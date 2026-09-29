const { fork } = require('child_process');
const path = require('path');

const DAEMONS = [
  { name: 'pp-backend', script: path.join(__dirname, 'daemons/pp-backend.cjs') },
  { name: 'pp-wyrm', script: path.join(__dirname, 'daemons/pp-wyrm.cjs') },
  { name: 'pp-narrative', script: path.join(__dirname, 'daemons/pp-narrative.cjs') },
  { name: 'pp-arcm', script: path.join(__dirname, 'daemons/pp-arcm.cjs') },
  { name: 'pp-storymatrix', script: path.join(__dirname, 'daemons/pp-storymatrix.cjs') },
  { name: 'pp-validator', script: path.join(__dirname, 'daemons/pp-validator.cjs') },
];

console.log('====================================================');
console.log('PANEL PROFITS 7-PROCESS CLUSTER SUPERVISOR STARTING');
console.log('====================================================');

const running = new Map();

function startDaemon(def) {
  console.log(`[Supervisor] Spawning ${def.name}...`);
  const child = fork(def.script, [], {
    env: { ...process.env, DAEMON_NAME: def.name },
    stdio: 'inherit'
  });

  running.set(def.name, { child, def, startTime: Date.now() });

  child.on('exit', (code, signal) => {
    console.warn(`[Supervisor] ${def.name} exited with code ${code}, signal ${signal}. Restarting in 3 seconds...`);
    running.delete(def.name);
    setTimeout(() => startDaemon(def), 3000);
  });
}

for (const d of DAEMONS) {
  startDaemon(d);
}

// Supervisor Heartbeat every 30 seconds
setInterval(() => {
  const statuses = Array.from(running.entries()).map(([name, info]) => {
    const uptimeSec = Math.round((Date.now() - info.startTime) / 1000);
    return `${name} (pid: ${info.child.pid}, uptime: ${uptimeSec}s)`;
  });
  console.log(`[Supervisor Heartbeat] ${running.size}/${DAEMONS.length} Daemons Active:`);
  console.log(`  -> ${statuses.join('\n  -> ')}`);
}, 30000);

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('\n[Supervisor] Shutting down all cluster daemons gracefully...');
  for (const [name, info] of running.entries()) {
    console.log(`[Supervisor] Sending SIGTERM to ${name} (pid ${info.child.pid})...`);
    info.child.kill('SIGTERM');
  }
  setTimeout(() => {
    console.log('[Supervisor] All daemons stopped.');
    process.exit(0);
  }, 1500);
}
