const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const PORT = process.env.PORT || 3000;

console.log(`[pp-frontend] Starting Next.js application supervisor on port ${PORT}...`);

const nextProcess = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  cwd: ROOT_DIR,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'inherit'
});

nextProcess.on('exit', (code, signal) => {
  console.log(`[pp-frontend] Next.js process exited with code ${code} and signal ${signal}`);
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  console.log('[pp-frontend] Received SIGTERM. Forwarding to Next.js process.');
  nextProcess.kill('SIGTERM');
});
