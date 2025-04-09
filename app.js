const express = require('express');
const path = require('path');
const EventEmitter = require('events');
const app = express();
const port = process.env.PORT || 3000;

const chatEmitter = new EventEmitter();

// Middleware to serve static files from the public folder
app.use(express.static(__dirname + '/public'));

// --- Listener Functions ---

// Serves the chat app HTML
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

// Responds with plain text
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

// Responds with JSON
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Echo endpoint
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Chat handler - receives message from client
function respondChat(req, res) {
  const { message } = req.query;
  console.log("Received message:", message);

  chatEmitter.emit('message', message);
  res.end();
}

// Server-Sent Events stream
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// --- Routes ---

app.get('/', chatApp); // serve chat app
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// --- Server start ---
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});