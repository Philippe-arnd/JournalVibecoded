import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

function checkFileExists(filePath: string) {
    if (!fs.existsSync(path.join(rootDir, filePath))) {
        console.error(`❌ Missing file: ${filePath}`);
        process.exit(1);
    }
    console.log(`✅ File exists: ${filePath}`);
}

function validateDockerCompose() {
    const content = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf8');
    
    // Rule: No fixed host port mappings in docker-compose.yml (for Coolify parity)
    const portMappingRegex = /ports:\s*[-\s]*["']?\d+:\d+["']?/g;
    if (portMappingRegex.test(content)) {
        console.error('❌ Error: Fixed port mappings found in docker-compose.yml. These must be moved to docker-compose.override.yml for Coolify compatibility.');
        process.exit(1);
    }
    console.log('✅ No fixed ports in docker-compose.yml');
}

function validateGitIgnore() {
    const content = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
    if (!content.includes('docker-compose.override.yml')) {
        console.error('❌ Error: docker-compose.override.yml is not in .gitignore. This would break production if committed.');
        process.exit(1);
    }
    console.log('✅ docker-compose.override.yml is git-ignored');
}

function validateEnvExample() {
    const example = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf8');
    const env = fs.existsSync(path.join(rootDir, '.env')) 
        ? fs.readFileSync(path.join(rootDir, '.env'), 'utf8') 
        : '';

    const getKeys = (content: string) => content.split(/\r?\n/)
        .filter(line => line && !line.trim().startsWith('#'))
        .map(line => line.split('=')[0].trim())
        .filter(key => key.length > 0);

    const exampleKeys = getKeys(example);
    console.log(`ℹ️ Checking ${exampleKeys.length} required variables from .env.example`);
}

function validateServiceWorker() {
    const swPath = path.join(rootDir, 'client/public/sw.js');
    if (fs.existsSync(swPath)) {
        const content = fs.readFileSync(swPath, 'utf8');
        if (!content.includes('/api')) {
            console.error('❌ Error: client/public/sw.js does not seem to bypass /api routes. This will break authentication.');
            process.exit(1);
        }
        console.log('✅ Service Worker bypasses /api routes');
    }
}

console.log('🚀 Starting Deployment & Infrastructure Validation...');
checkFileExists('docker-compose.yml');

// Skip override check in CI environment (it's git-ignored as expected)
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
if (!isCI) {
    checkFileExists('docker-compose.override.yml');
} else {
    console.log('ℹ️ Skipping docker-compose.override.yml check in CI (git-ignored by design)');
}

validateDockerCompose();
validateGitIgnore();
validateEnvExample();
validateServiceWorker();
console.log('✨ All infrastructure checks passed!');
