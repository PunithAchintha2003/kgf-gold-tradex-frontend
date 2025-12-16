import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
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
            dedupe: ['react', 'react-dom'],
        },
        server: {
            port: 4000,
            strictPort: true,
            open: true,
        },
        build: {
            target: 'esnext',
            outDir: 'build',
            minify: 'esbuild',
            cssCodeSplit: true,
            cssMinify: true,
            rollupOptions: {
                output: {
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
            logOverride: { 'this-is-undefined-in-esm': 'silent' }
        },
    });
});
