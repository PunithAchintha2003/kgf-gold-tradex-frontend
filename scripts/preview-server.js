#!/usr/bin/env node

/**
 * Custom preview server with proxy support
 * This allows testing production builds locally without CORS issues
 */

// Suppress Node.js deprecation warnings (e.g., util._extend from dependencies)
// This handler catches warnings that occur after modules are loaded
if (process.listeners('warning').length === 0) {
  process.on('warning', (warning) => {
    // Only suppress DEP0060 (util._extend) warnings from dependencies
    if (warning.name === 'DeprecationWarning' && warning.message.includes('util._extend')) {
      return; // Suppress this specific warning
    }
    // Log other warnings normally
    console.warn(warning.name, warning.message);
  });
}

import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import sirv from 'sirv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const buildDir = resolve(root, 'build');
const port = 4173;

// Check if build directory exists
if (!existsSync(buildDir)) {
  console.error('❌ Build directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create proxy middleware for API requests
const apiProxy = createProxyMiddleware({
  target: 'https://kgf-gold-price-predictor.onrender.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'silent', // Suppress proxy logs
  onProxyReq: (proxyReq, req, res) => {
    // Add CORS headers to proxy requests
    proxyReq.setHeader('Origin', 'https://kgf-gold-price-predictor.onrender.com');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to responses
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  },
});

// Create HTTP server
const server = createServer((req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS' && req.url?.startsWith('/api')) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  // Proxy API requests
  if (req.url?.startsWith('/api')) {
    return apiProxy(req, res, () => {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });
  }

  // Serve static files
  const staticHandler = sirv(buildDir, {
    etag: true,
    maxAge: 31536000, // 1 year
    immutable: true,
  });

  staticHandler(req, res, () => {
    // If file not found, serve index.html for SPA routing
    if (req.url && !req.url.includes('.')) {
      const indexFile = resolve(buildDir, 'index.html');
      if (existsSync(indexFile)) {
        const html = readFileSync(indexFile, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });
});

server.listen(port, () => {
  console.log(`\n🚀 Preview server running at:`);
  console.log(`   Local:   http://localhost:${port}`);
  console.log(`   Network: http://0.0.0.0:${port}\n`);
  console.log(`✨ API proxy enabled - CORS issues resolved!\n`);
});

// Handle errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use.`);
    console.error(`   Please stop the other server or use a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down preview server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

