const http = require('http');
const httpProxy = require('http-proxy');
const zlib = require('zlib');

const proxy = httpProxy.createProxyServer();

proxy.on('proxyRes', (proxyRes, req, res) => {
    let buffer = Buffer.from('');
    let output = '';
    proxyRes.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
    }).on('end', () => {
        console.log(buffer.toString());
        output = zlib.gunzipSync(buffer).toString('utf8');
    });
    // proxyReq.setHeader('X-Special-Header', 'foo');
    // proxyReq.write('123');
    console.log(output);
    res.write('<div style="position:absolute; left:50%; color:red;">123</div>');
});

http.createServer((req, res) => {
    proxy.web(req, res, {
        target: 'https://github.com',
        changeOrigin: true,
    });
}).listen(9001);

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.write(`<html>
        <body>
        <h1>Request to: ${req.url}</h1><p> ${JSON.stringify(req.headers, true, 2)}
        </p></body></html>`);
    res.end();
}).listen(9000);
