const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.CONTACT_EMAIL
);
let mailTransport = null;

if (smtpConfigured) {
    mailTransport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}
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
                const cleanName = typeof name === 'string' ? name.trim() : '';
                const cleanEmail = typeof email === 'string' ? email.trim() : '';
                const cleanMessage = typeof message === 'string' ? message.trim() : '';

                if (!cleanName || !cleanEmail || !cleanMessage) {
                    sendJson(response, 400, { error: 'Please complete all fields.' });
                    return;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                    sendJson(response, 400, { error: 'Please enter a valid email address.' });
                    return;
                }

                if (!mailTransport) {
                    sendJson(response, 503, {
                        error: 'Email delivery is not configured yet. Add SMTP settings to .env.'
                    });
                    return;
                }

                mailTransport.sendMail({
                    from: `"Portfolio Contact" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                    to: process.env.CONTACT_EMAIL,
                    replyTo: cleanEmail,
                    subject: `Portfolio message from ${cleanName}`,
                    text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
                    html: `<p><strong>Name:</strong> ${cleanName}</p>
                        <p><strong>Email:</strong> ${cleanEmail}</p>
                        <p><strong>Message:</strong></p>
                        <p>${cleanMessage.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`
                }).then(() => {
                    sendJson(response, 200, { message: 'Message sent.' });
                }).catch(error => {
                    console.error('Contact email delivery failed:', error);
                    sendJson(response, 502, { error: 'The message could not be sent. Please try again later.' });
                });
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