# VSCode Web

A web-based build of Visual Studio Code that can be deployed to any static hosting platform.

## Features

- 🚀 Automated builds with the latest VSCode versions
- 📦 GitHub Actions for CI/CD
- 🔄 Automatic version detection from VSCode releases
- 📱 Ready for static deployment

## Setup

### Prerequisites

- Node.js 20+
- pnpm

### Local Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Build VSCode Web:

   ```bash
   pnpm run build
   ```

3. Serve the files (you can use any static file server):
   ```bash
   pnpm dlx serve .
   ```

### GitHub Actions Setup

The repository includes a GitHub Action that automatically:

- Fetches the latest VSCode version from GitHub releases
- Builds the web version
- Publishes to npm (optional)

#### Required Secrets

For npm publishing (optional), add this secret to your GitHub repository:

- `NPM_TOKEN`: Your npm authentication token

#### Manual Trigger

You can manually trigger the build with a specific VSCode version:

1. Go to Actions tab in your GitHub repository
2. Select "Build and Publish VSCode Web"
3. Click "Run workflow"
4. Enter a specific version (e.g., "1.96.0") or leave empty for latest

### Environment Variables

- `VSCODE_VERSION`: Override the VSCode version to build (used by build script)

## Project Structure

- `build.ts`: Main build script that clones and builds VSCode
- `index.html`: Entry point that loads VSCode web assets
- `.github/workflows/`: GitHub Actions workflows
- `dist/`: Built VSCode web assets (generated)

## License

This project follows the same MIT license as VSCode.
