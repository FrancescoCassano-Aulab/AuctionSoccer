import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
    let filePath;
    
    if (req.url === '/') {
        filePath = path.join(__dirname, 'public', 'fantacalcio-auction.html');
    } else if (req.url === '/json%20per%20claude%20code%20fantacalcio.json' || req.url === '/json per claude code fantacalcio.json') {
        filePath = path.join(__dirname, 'json per claude code fantacalcio.json');
    } else {
        filePath = path.join(__dirname, 'public', req.url);
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 FantaCassi server running at http://localhost:${PORT}`);
});