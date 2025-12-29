import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // Get API token from environment variable (fallback to empty string for security)
    const apiToken = env.CLASH_ROYALE_API_TOKEN || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/clashroyale': {
            target: 'https://proxy.royaleapi.dev',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/clashroyale/, '/v1'),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                // Add the authorization header from environment variable
                if (apiToken) {
                  proxyReq.setHeader('Authorization', `Bearer ${apiToken}`);
                }
              });
            },
          },
        },
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
