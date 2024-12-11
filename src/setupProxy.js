// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/ROOT/api',  // 프론트엔드에서 사용할 경로
        createProxyMiddleware({
            target: 'http://127.0.0.1:8080',  // 백엔드 기본 URL
            changeOrigin: true,
        })
    );
};