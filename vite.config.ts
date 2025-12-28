import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/clashroyale': {
            target: 'https://api.clashroyale.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/clashroyale/, '/v1'),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                // Add the authorization header
                const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImZhNWI2YjE2LTRhZjctNGUyZi1iNDRkLTdhZDk3MzA4YmRiYSIsImlhdCI6MTc2Njg5OTU3Miwic3ViIjoiZGV2ZWxvcGVyLzA3ZGI0YjljLWEzYjQtMTMzNS1kYWNiLTc2MWRlYjg5OTU3YiIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI5OS4yMjkuNjEuNzUiXSwidHlwZSI6ImNsaWVudCJ9XX0.dQHcW_uPrOFekhW9272ICRpX7UUTKYO2DYA29zbi2td_gUbFSbDL9aAsqp6HS3kupz9ZbIub0vLcRQZKa-L_WQ';
                proxyReq.setHeader('Authorization', `Bearer ${token}`);
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
