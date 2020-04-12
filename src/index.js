const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');
const fs = require('fs');
const compressorFactory = require('./runtime/compressorFactory');
const config = require('./data/config');

const proxy = httpProxy.createProxyServer();

const PORT = config.port || 3000;

proxy.on('proxyRes', (proxyRes, req, res) => {
    const prevWritre = res.write;
    const prevEnd = res.end;
    let buffer = Buffer.from('');

    res.write = (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
    };

    res.end = async () => {
        const compressor = compressorFactory(res.getHeader('content-encoding'));
        const decodedData = await compressor.decode(buffer);
        const data = decodedData.toString('utf8').replace('</body>', `${config.appendBlock}</body>`);
        const compressData = await compressor.code(Buffer.from(data));
        res.setHeader('Content-Length', compressData.length);
        prevWritre.call(res, compressData);
        prevEnd.call(res);
    };
});

http.createServer((req, res) => {
    const { query: { host } } = url.parse(req.url, true);
    if (!host) {
        fs.readFile('./public/index.html', (err, data) => {
            res.writeHead(200);
            res.write(data);
            res.end();
        });
        return;
    }
    try {
        proxy.web(req, res, {
            target: host,
            changeOrigin: true,
        });
    } catch (proxyError) {
        console.log(proxyError);
    }
}).listen(PORT);
