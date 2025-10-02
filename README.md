# VSCode Web

A web-based build of Visual Studio Code that can be deployed to Vercel or any static hosting platform.

## Features

- 🚀 Automated builds with the latest VSCode versions
- 📦 GitHub Actions for CI/CD
- 🌐 Vercel deployment ready
- 🔄 Automatic version detection from VSCode releases

## Setup

### Prerequisites

- Node.js 20+
- npm or pnpm

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build VSCode Web:

   ```bash
   npm run build
   ```

3. Serve the files (you can use any static file server):
   ```bash
   npx serve .
   ```

### GitHub Actions Setup

The repository includes a GitHub Action that automatically:

- Fetches the latest VSCode version from GitHub releases
- Builds the web version
- Deploys to Vercel (on main branch)
- Publishes to npm (optional)

#### Required Secrets

For Vercel deployment, add these secrets to your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

For npm publishing (optional):

- `NPM_TOKEN`: Your npm authentication token

#### Manual Trigger

You can manually trigger the build with a specific VSCode version:

1. Go to Actions tab in your GitHub repository
2. Select "Build and Publish VSCode Web"
3. Click "Run workflow"
4. Enter a specific version (e.g., "1.96.0") or leave empty for latest

### Vercel Deployment

The project is configured for automatic Vercel deployment:

1. Connect your GitHub repository to Vercel
2. The `vercel.json` configuration will handle the build and routing
3. Assets are served from the `dist/` directory with proper caching headers

### Environment Variables

- `VSCODE_VERSION`: Override the VSCode version to build (used by build script)

## Project Structure

- `build.ts`: Main build script that clones and builds VSCode
- `index.html`: Entry point that loads VSCode web assets
- `vercel.json`: Vercel deployment configuration
- `.github/workflows/`: GitHub Actions workflows

## License

This project follows the same MIT license as VSCode.
