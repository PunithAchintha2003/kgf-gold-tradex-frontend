import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [
            react({
                jsxRuntime: 'automatic',
            }),
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
                // Ensure single React instance
                'react': path.resolve(__dirname, './node_modules/react'),
                'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
            },
            dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
        },
        server: {
            port: 4000,
            strictPort: true,
            open: true,
        },
        build: {
            target: 'esnext',
            outDir: 'build',
            commonjsOptions: {
                include: [/node_modules/],
                transformMixedEsModules: true,
            },
            // Ensure proper module resolution
            modulePreload: {
                polyfill: true,
            },
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                    passes: 2,
                    dead_code: true,
                    // Don't mangle React internals
                    keep_classnames: false,
                    keep_fnames: false,
                },
                mangle: {
                    safari10: true,
                    properties: {
                        regex: /^_/
                    },
                    // Preserve React property names
                    reserved: ['React', 'ReactDOM', 'Children', 'Component', 'PureComponent']
                },
                format: {
                    comments: false
                }
            },
            cssCodeSplit: true,
            cssMinify: true,
            rollupOptions: {
                output: {
                    manualChunks: function (id) {
                        // CRITICAL: Ensure React and React-DOM are ALWAYS together - check FIRST
                        // This prevents multiple React instances which causes the Children error
                        if (id.includes('node_modules/react/') || 
                            id.includes('node_modules/react-dom/') ||
                            id.includes('node_modules/react/jsx-runtime') ||
                            id.includes('node_modules/react/jsx-dev-runtime')) {
                            return 'react-vendor';
                        }
                        // Route-based code splitting for better performance
                        if (id.includes('src/components/dashboards')) {
                            return 'dashboards';
                        }
                        if (id.includes('src/components/price-predictor')) {
                            return 'price-predictor';
                        }
                        if (id.includes('node_modules')) {
                            if (id.includes('plotly.js') || id.includes('react-plotly')) {
                                return 'plotly';
                            }
                            if (id.includes('@mui') || id.includes('@emotion')) {
                                return 'mui';
                            }
                            if (id.includes('@reduxjs') || id.includes('redux-persist')) {
                                return 'redux';
                            }
                            if (id.includes('lucide-react') || id.includes('react-icons')) {
                                return 'icons';
                            }
                            if (id.includes('@radix-ui')) {
                                return 'radix-ui';
                            }
                            return 'vendor';
                        }
                    },
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
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
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
