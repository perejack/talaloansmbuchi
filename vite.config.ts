import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import initiateHandler from './api/payhero/initiate';
import statusHandler from './api/payhero/status';

function payheroDevPlugin(): Plugin {
  return {
    name: 'payhero-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();
        const url = req.url.split('?')[0];
        if (url === '/api/payhero/initiate' || url === '/api/payhero/status') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              let parsedBody = {};
              if (bodyStr) {
                try {
                  parsedBody = JSON.parse(bodyStr);
                } catch {
                  parsedBody = {};
                }
              }
              const mockReq = {
                method: req.method,
                headers: req.headers,
                body: parsedBody,
                url: req.url,
              };
              const mockRes = {
                statusCode: 200,
                setHeader(key: string, value: string) {
                  res.setHeader(key, value);
                },
                status(code: number) {
                  this.statusCode = code;
                  res.statusCode = code;
                  return this;
                },
                json(data: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = this.statusCode || 200;
                  res.end(JSON.stringify(data));
                },
                end(data?: any) {
                  res.statusCode = this.statusCode || 200;
                  res.end(data);
                },
              };

              if (url === '/api/payhero/initiate') {
                await initiateHandler(mockReq, mockRes);
              } else if (url === '/api/payhero/status') {
                await statusHandler(mockReq, mockRes);
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), payheroDevPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

