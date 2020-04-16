const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');
const fs = require('fs');
const compresionFactory = require('./runtime/compresionFactory');
const config = require('./data/config');

const proxy = httpProxy.createProxyServer();
const PORT = config.port || 3000;

proxy.on('proxyRes', (proxyRes, req, res) => {
    const prevEnd = res.end;
    let buffer = Buffer.from('');
    res.write = (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
    };
    res.end = async () => {
        try {
            const compressor = compresionFactory(res.getHeader('content-encoding'));
            const decodedData = await compressor.decode(buffer);
            const data = decodedData.toString('utf8').replace('</body>', `${config.appendBlock}</body>`);
            const compressData = await compressor.code(Buffer.from(data));
            res.setHeader('Content-Length', compressData.length);
            res.setHeader('Cache-Control', 'no-cache');
            prevEnd.call(res, compressData);
        } catch (error) {
            console.log('Error', error.message);
        }
    };
});

http.createServer((req, res) => {
    const { query: { host } } = url.parse(req.url, true);

    if (!host && !global.host) {
        return;
    }

    if (host) {
        global.host = host;
    }

    try {
        res.setHeader('Cache-Control', 'no-cache');
        proxy.web(req, res, {
            target: global.host,
            changeOrigin: true,
            followRedirects: true,
            secure: true,
            protocolRewrite: true,
        });
    } catch (proxyError) {
        console.log(proxyError);
    }
}).listen(PORT);
