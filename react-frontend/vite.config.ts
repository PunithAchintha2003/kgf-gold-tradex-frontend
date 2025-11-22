import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  build: {
    target: 'esnext',
    minify: 'terser' as const,
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for error debugging in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Only remove non-error logs
        passes: 2, // Multiple passes for better compression
        dead_code: true,
        // Removed 'unused: true' as it can break some code
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/ // Mangle private properties
        }
      },
      format: {
        comments: false // Remove all comments
      }
    },
    cssCodeSplit: true, // Split CSS into separate files
    cssMinify: true, // Minify CSS
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Create separate chunks for better caching
          if (id.includes('node_modules')) {
            // Keep React and React-DOM together to ensure React.Children is available
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            // Plotly.js must be in its own chunk and loaded before other vendor code
            if (id.includes('plotly.js') || id.includes('react-plotly') || id.includes('plotly')) {
              return 'plotly';
            }
            if (id.includes('@mui')) {
              return 'mui';
            }
            if (id.includes('@reduxjs') || id.includes('redux-persist')) {
              return 'redux';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 8000, // Plotly.js is inherently large (~6-7MB), this is expected
    sourcemap: false, // Disable source maps in production for smaller bundle
    reportCompressedSize: true
  },
  resolve: {
    alias: {
      '@': './src'
    }
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
    exclude: [
      // Don't pre-bundle Plotly - let it load as a separate chunk
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' as const }
  }
}))
