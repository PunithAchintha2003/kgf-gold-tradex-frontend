import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [
            react(),
            mode === 'analyze' && visualizer({
                filename: 'dist/stats.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
            })
        ].filter(Boolean),
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
            dedupe: ['react', 'react-dom'], // Ensure single React instance
        },
        server: {
            port: 4000,
            strictPort: true,
            open: true,
            proxy: {
                // Route auth and user endpoints to Node.js backend (port 5001)
                // These must come BEFORE the general /api proxy to match first
                '/api/v1/auth': {
                    target: 'http://localhost:5001',
                    changeOrigin: true,
                    secure: false,
                    rewrite: function (path) { return path; },
                },
                '/api/v1/users': {
                    target: 'http://localhost:5001',
                    changeOrigin: true,
                    secure: false,
                    rewrite: function (path) { return path; },
                },
                // Route all other API endpoints (including spot-trade, xauusd, etc.) to Python backend (port 8001)
                '/api': {
                    target: 'http://localhost:8001',
                    changeOrigin: true,
                    secure: false,
                    rewrite: function (path) { return path; },
                },
            },
        },
        build: {
            target: 'esnext',
            outDir: 'build',
            minify: 'esbuild', // Use esbuild minification (better React compatibility)
            cssCodeSplit: true,
            cssMinify: true,
            commonjsOptions: {
                include: [/node_modules/],
                transformMixedEsModules: true,
            },
            rollupOptions: {
                output: {
                    // Disable code splitting to ensure React loads before all other code
                    manualChunks: undefined,
                    chunkFileNames: 'assets/[name]-[hash].js',
                    entryFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]'
                }
            },
            chunkSizeWarningLimit: 8000,
            sourcemap: (mode === 'production' ? false : 'inline'),
            reportCompressedSize: true,
            assetsInlineLimit: 4096
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                '@mui/material',
                '@mui/icons-material',
                '@emotion/react',
                '@emotion/styled',
                'plotly.js-dist-min',
                'react-plotly.js',
                '@reduxjs/toolkit',
                'react-redux',
                'redux-persist',
                'react-router-dom'
            ],
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },
        esbuild: {
            logOverride: { 'this-is-undefined-in-esm': 'silent' },
        },
    });
});
