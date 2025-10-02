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
  // Create dist directory
  mkdirSync(distPath, { recursive: true });

  // Download VSCode web assets from GitHub releases
  console.log(`📥 Downloading VSCode Web ${VSCODE_VERSION} assets...`);
  const downloadUrl = `https://github.com/microsoft/vscode/releases/download/${VSCODE_VERSION}/vscode-web-${VSCODE_VERSION}.tar.gz`;

  try {
    execSync(`curl -L "${downloadUrl}" | tar -xz -C "${distPath}" --strip-components=1`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('✅ Downloaded pre-built VSCode Web assets');
  } catch (downloadError) {
    console.log('⚠️ Pre-built assets not available, building from source...');

    // Fallback: Clone and build from source
    console.log(`📥 Cloning VSCode ${VSCODE_VERSION}...`);
    execSync(`git clone --depth 1 --branch ${VSCODE_VERSION} ${VSCODE_REPO} vscode-source`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    const vscodeDir = join(__dirname, 'vscode-source');

    // Install dependencies with minimal native compilation
    console.log('📦 Installing VSCode dependencies...');
    execSync('npm ci --omit=optional --ignore-scripts --no-audit --no-fund', {
      stdio: 'inherit',
      cwd: vscodeDir,
      env: {
        ...process.env,
        npm_config_build_from_source: 'false',
        npm_config_optional: 'false'
      }
    });

    // Try to build web version
    console.log('🔨 Building VSCode for web...');
    try {
      execSync('npm run compile-web', {
        stdio: 'inherit',
        cwd: vscodeDir
      });
    } catch {
      // Fallback to gulp build
      execSync('npm run gulp -- compile-web', {
        stdio: 'inherit',
        cwd: vscodeDir
      });
    }

    // Find and copy build output
    console.log('📋 Locating build output...');
    const possiblePaths = [
      join(vscodeDir, 'out-vscode-web'),
      join(vscodeDir, '.build', 'vscode-web'),
      join(vscodeDir, 'out', 'vscode-web'),
      join(vscodeDir, 'dist')
    ];

    let foundOutput = false;
    for (const outputPath of possiblePaths) {
      if (existsSync(outputPath)) {
        console.log(`📦 Copying VSCode Web build from ${outputPath}...`);
        cpSync(outputPath, distPath, { recursive: true });
        foundOutput = true;
        break;
      }
    }

    if (!foundOutput) {
      console.error('❌ Could not find build output directory');
      process.exit(1);
    }
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
