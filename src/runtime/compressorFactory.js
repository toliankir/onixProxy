const zlib = require('zlib');

const compressorFactory = (() => {
    function codeZip(buffer) {
        return new Promise((resolve, reject) => {
            zlib.gzip(buffer, async (error, compress) => {
                if (error) {
                    reject(error);
                }
                resolve(compress);
            });
        });
    }

    function decodeZip(buffer) {
        return new Promise((resolve, reject) => {
            zlib.gunzip(buffer, async (error, uncompress) => {
                if (error) {
                    reject(error);
                }
                resolve(uncompress);
            });
        });
    }

    function codeBrotli(buffer) {
        return new Promise((resolve, reject) => {
            zlib.brotliCompress(buffer, async (error, compress) => {
                if (error) {
                    reject(error);
                }
                resolve(compress);
            });
        });
    }

    function decodeBrotli(buffer) {
        return new Promise((resolve, reject) => {
            zlib.brotliDecompress(buffer, async (error, uncompress) => {
                if (error) {
                    reject(error);
                }
                resolve(uncompress);
            });
        });
    }

    function codeDeflate(buffer) {
        return new Promise((resolve, reject) => {
            zlib.deflate(buffer, async (error, compress) => {
                if (error) {
                    reject(error);
                }
                resolve(compress);
            });
        });
    }

    function decodeInflate(buffer) {
        return new Promise((resolve, reject) => {
            zlib.inflate(buffer, async (error, uncompress) => {
                if (error) {
                    reject(error);
                }
                resolve(uncompress);
            });
        });
    }

    function noDecode(buffer) {
        return new Promise((resolve) => resolve(buffer));
    }

    function getCompressor(type) {
        switch (type) {
            case undefined:
                return {
                    code: noDecode,
                    decode: noDecode,
                };
            case 'gzip':
                return {
                    code: codeZip,
                    decode: decodeZip,
                };
            case 'br':
                return {
                    code: codeBrotli,
                    decode: decodeBrotli,
                };
            case 'deflate':
                return {
                    code: codeDeflate,
                    decode: decodeInflate,
                };
            default: {
                return null;
            }
        }
    }

    return getCompressor;
})();

module.exports = compressorFactory;
