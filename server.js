const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

function serveFile(requestPath, response) {
    const safePath = path.normalize(requestPath === '/' ? '/index.html' : requestPath);
    const filePath = path.join(root, safePath);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        sendJson(response, 404, { error: 'File not found' });
        return;
    }
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/api/health') {
        sendJson(response, 200, { status: 'ok', service: 'ahsan-portfolio' });
        return;
    }

    if (request.method === 'POST' && request.url === '/api/contact') {
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', () => {
            try {
                const { name, email, message } = JSON.parse(body);
                if (!name || !email || !message) {
                    sendJson(response, 400, { error: 'Please complete all fields.' });
                    return;
                }
                console.log(`Contact request from ${name} <${email}>: ${message}`);
                sendJson(response, 200, { message: 'Message received.' });
            } catch {
                sendJson(response, 400, { error: 'Invalid request.' });
            }
        });
        return;
    }

    if (request.method === 'GET') {
        serveFile(new URL(request.url, `http://${request.headers.host}`).pathname, response);
        return;
    }

    sendJson(response, 405, { error: 'Method not allowed' });
});

server.listen(port, () => {
    console.log(`Portfolio server running at http://localhost:${port}`);
});