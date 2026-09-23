const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'active', engine: 'Zero-Load WebSocket Relay', port: PORT }));
});

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const clientId = url.searchParams.get('client_id') || ('user_' + Math.random().toString(36).substr(2, 9));
  
  clients.set(clientId, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Broadcast to destination or operators
      for (const [id, client] of clients.entries()) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ ...data, from: clientId, timestamp: new Date().toISOString() }));
        }
      }
    } catch (e) {
      console.error('Invalid JSON payload', e);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
  });
});

server.listen(PORT, () => {
  console.log(`[OmniChat Server] Zero-Load WebSocket Engine running on port ${PORT}`);
});
