const http = require('http');

const PORT = process.env.PP_BACKEND_PORT || 4001;

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      daemon: 'pp-backend',
      status: 'HEALTHY',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      cluster: 'panel-profits-production',
      endpoints: ['/health', '/telemetry', '/metrics']
    }));
    return;
  }

  if (req.url === '/telemetry') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      regime: 'BULL_ACCELERATION',
      tectonic_tier: 2,
      stress_index: 0.14,
      drawdown: 0.024,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[pp-backend] Telemetry and RPC daemon active on http://127.0.0.1:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[pp-backend] Received SIGTERM. Shutting down gracefully.');
  server.close(() => process.exit(0));
});
