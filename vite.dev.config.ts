import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from 'path';

export default defineConfig({
    plugins: [react()],    server: {
      port: 8080,
      host: 'localhost',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      },
      cors: true,
      watch: {
        usePolling: true
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      }
    },
    css: {
      devSourcemap: true
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
        'sonner',
        '@radix-ui/react-icons',
        'clsx',
        'class-variance-authority'
      ]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-icons', 'lucide-react', 'sonner'],
            'utils-vendor': ['clsx', 'class-variance-authority']
          }
        }
      }
    }
  });
