const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
    fs.readFile('./public/index.html', (err, data) => {
        console.log(req.headers);
        console.log('--------------------------------');
        res.setHeader('Content-Type', 'text/html');
        res.write(data);
        res.end();
    })
}).listen(8080);