#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { existsSync, rmSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const VSCODE_VERSION: string = process.env.VSCODE_VERSION || '1.96.0';
const VSCODE_REPO: string = 'https://github.com/microsoft/vscode.git';

console.log(`🚀 Building VSCode Web ${VSCODE_VERSION}...`);
console.log(`📁 Working directory: ${__dirname}`);

// Safety check
if (!existsSync(join(__dirname, 'package.json'))) {
  console.error('❌ Error: package.json not found. Are we in the right directory?');
  process.exit(1);
}

const distPath: string = join(__dirname, 'dist');
const vscodePath: string = join(__dirname, 'vscode-source');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (existsSync(distPath)) rmSync(distPath, { recursive: true, force: true });
if (existsSync(vscodePath)) rmSync(vscodePath, { recursive: true, force: true });

try {
  // Clone VSCode repository
  console.log(`📥 Cloning VSCode ${VSCODE_VERSION}...`);
  execSync(`git clone --depth 1 --branch ${VSCODE_VERSION} ${VSCODE_REPO} vscode-source`, {
    stdio: 'inherit',
    cwd: __dirname
  });

  const vscodeDir = join(__dirname, 'vscode-source');

  // Install dependencies
  console.log('📦 Installing VSCode dependencies...');
  execSync('npm ci', {
    stdio: 'inherit',
    cwd: vscodeDir
  });

  // Build VSCode for web (compile + bundle, no dev server)
  console.log('🔨 Building VSCode for web...');
  execSync('npm run gulp -- vscode-web', {
    stdio: 'inherit',
    cwd: vscodeDir
  });

  // Create dist directory
  mkdirSync(distPath, { recursive: true });

  // Find the actual build output directory
  console.log('📋 Locating build output...');
  const buildDir = join(vscodeDir, '.build');

  if (existsSync(buildDir)) {
    const buildContents = readdirSync(buildDir);
    console.log(`📂 Build directory contents: ${buildContents.join(', ')}`);

    // Look for vscode-web directory
    const webBuildDir = join(buildDir, 'vscode-web');
    if (existsSync(webBuildDir)) {
      console.log('📦 Copying VSCode Web build...');
      cpSync(webBuildDir, distPath, { recursive: true });
    } else {
      // Fallback: look for any directory with web assets
      for (const item of buildContents) {
        const itemPath = join(buildDir, item);
        if (item.includes('web') || item.includes('vscode')) {
          console.log(`📦 Copying from ${item}...`);
          cpSync(itemPath, distPath, { recursive: true });
          break;
        }
      }
    }
  } else {
    console.error('❌ Build directory not found');
    process.exit(1);
  }

  console.log('✅ VSCode Web build completed successfully!');
  console.log(`📁 Assets available in ${distPath}`);

} catch (error) {
  console.error('❌ Build failed:', error instanceof Error ? error.message : String(error));

  // Debug: show what directories exist
  console.log('🔍 Debug: Available directories:');
  try {
    if (existsSync(vscodePath)) {
      const contents = readdirSync(vscodePath);
      console.log(`VSCode source contents: ${contents.slice(0, 10).join(', ')}...`);

      const buildDir = join(vscodePath, '.build');
      if (existsSync(buildDir)) {
        const buildContents = readdirSync(buildDir);
        console.log(`Build contents: ${buildContents.join(', ')}`);
      }
    }
  } catch (debugError) {
    console.log('Could not list directories for debugging');
  }

  process.exit(1);
}
