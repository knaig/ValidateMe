#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);

// Add the runner script
const runnerPath = path.join(__dirname, '..', 'src', 'runner.mjs');
const fullArgs = ['--experimental-modules', runnerPath, ...args];

// Spawn the runner
const child = spawn('node', fullArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Error running ValidateMe:', error);
  process.exit(1);
});
