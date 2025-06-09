#!/usr/bin/env node

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Environment configuration
const dev = false;
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ 
  dev, 
  hostname, 
  port,
  dir: __dirname,
  conf: {
    output: 'standalone',
    distDir: '.next',
    experimental: {
      outputFileTracingRoot: __dirname,
    },
  }
});

const handle = app.getRequestHandler();

// Ensure data directories exist
const dataDir = path.join(__dirname, 'data');
const logsDir = path.join(__dirname, 'logs');
const backupsDir = path.join(__dirname, 'backups');

[dataDir, logsDir, backupsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize version info if not exists
const versionFile = path.join(__dirname, 'data', 'version.json');
if (!fs.existsSync(versionFile)) {
  const defaultVersion = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    gitHash: 'unknown',
    gitBranch: 'main'
  };
  fs.writeFileSync(versionFile, JSON.stringify(defaultVersion, null, 2));
}

// Start server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`> Data directory: ${dataDir}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
