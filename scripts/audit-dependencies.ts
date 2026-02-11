#!/usr/bin/env tsx
/**
 * Dependency Audit Script
 *
 * Generates a comprehensive report of all project dependencies including:
 * - OpenSSF Scorecard ratings (via deps.dev API)
 * - License information
 * - Vulnerability status
 * - Package metadata
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface PackageInfo {
  name: string;
  version: string;
  location: 'client' | 'server' | 'root';
  type: 'dependencies' | 'devDependencies';
  license?: string;
  scorecard?: number;
  repository?: string;
  vulnerabilities?: number;
}

interface ScoreCardResponse {
  scorecard?: {
    overallScore?: number;
    checks?: Array<{ name: string; score: number }>;
  };
}

const rootDir = process.cwd();

// Fetch OpenSSF Scorecard from deps.dev API
async function fetchScorecard(name: string, version: string): Promise<number | undefined> {
  try {
    const url = `https://api.deps.dev/v3alpha/systems/npm/packages/${encodeURIComponent(name)}/versions/${encodeURIComponent(version)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return undefined;
    }

    const data: ScoreCardResponse = await response.json();
    return data.scorecard?.overallScore;
  } catch (error) {
    return undefined;
  }
}

// Get all dependencies from package.json
function getDependencies(location: 'client' | 'server' | 'root'): PackageInfo[] {
  const packageJsonPath = location === 'root'
    ? path.join(rootDir, 'package.json')
    : path.join(rootDir, location, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packages: PackageInfo[] = [];

  // Regular dependencies
  if (packageJson.dependencies) {
    for (const [name, version] of Object.entries(packageJson.dependencies)) {
      packages.push({
        name,
        version: (version as string).replace(/^[\^~]/, ''),
        location,
        type: 'dependencies',
      });
    }
  }

  // Dev dependencies
  if (packageJson.devDependencies) {
    for (const [name, version] of Object.entries(packageJson.devDependencies)) {
      packages.push({
        name,
        version: (version as string).replace(/^[\^~]/, ''),
        location,
        type: 'devDependencies',
      });
    }
  }

  return packages;
}

// Get license info from npm
async function getLicenseInfo(name: string): Promise<string | undefined> {
  try {
    const info = execSync(`npm view ${name} license 2>/dev/null`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return info.trim();
  } catch {
    return undefined;
  }
}

// Check for known vulnerabilities
function checkVulnerabilities(location: 'client' | 'server' | 'root'): Map<string, number> {
  const vulnMap = new Map<string, number>();

  try {
    const dir = location === 'root' ? rootDir : path.join(rootDir, location);
    const result = execSync('npm audit --json', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const audit = JSON.parse(result);

    if (audit.vulnerabilities) {
      for (const [name, info] of Object.entries(audit.vulnerabilities as Record<string, any>)) {
        const severity = info.severity;
        const count = info.via?.length || 1;
        vulnMap.set(name, count);
      }
    }
  } catch {
    // npm audit returns non-zero exit code if vulnerabilities found
    // We catch it but still process the output
  }

  return vulnMap;
}

// Generate markdown report
function generateReport(packages: PackageInfo[]): string {
  const now = new Date().toISOString();

  let report = `# 📦 Dependency Audit Report

**Generated:** ${now}
**Total Packages:** ${packages.length}

---

## 📊 Summary by Location

`;

  // Group by location
  const byLocation = packages.reduce((acc, pkg) => {
    if (!acc[pkg.location]) acc[pkg.location] = [];
    acc[pkg.location].push(pkg);
    return acc;
  }, {} as Record<string, PackageInfo[]>);

  for (const [location, pkgs] of Object.entries(byLocation)) {
    const deps = pkgs.filter(p => p.type === 'dependencies').length;
    const devDeps = pkgs.filter(p => p.type === 'devDependencies').length;
    report += `- **${location}**: ${deps} dependencies, ${devDeps} devDependencies\n`;
  }

  report += `\n---\n\n## 🔒 Security & Licenses\n\n`;

  // Sort packages by location, then type, then name
  const sorted = [...packages].sort((a, b) => {
    if (a.location !== b.location) return a.location.localeCompare(b.location);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });

  let currentLocation = '';
  let currentType = '';

  for (const pkg of sorted) {
    // Location header
    if (pkg.location !== currentLocation) {
      currentLocation = pkg.location;
      report += `\n### 📍 ${currentLocation.toUpperCase()}\n\n`;
    }

    // Type header
    if (pkg.type !== currentType) {
      currentType = pkg.type;
      report += `\n#### ${currentType === 'dependencies' ? '🔷 Runtime Dependencies' : '🔶 Development Dependencies'}\n\n`;
    }

    // Package info
    report += `**${pkg.name}** @ \`${pkg.version}\`\n`;

    if (pkg.license) {
      const licenseEmoji = pkg.license.includes('MIT') || pkg.license.includes('Apache') || pkg.license.includes('BSD') || pkg.license.includes('ISC')
        ? '✅'
        : pkg.license.includes('GPL') || pkg.license.includes('AGPL')
        ? '⚠️'
        : 'ℹ️';
      report += `- License: ${licenseEmoji} ${pkg.license}\n`;
    }

    if (pkg.scorecard !== undefined) {
      const scoreEmoji = pkg.scorecard >= 7 ? '✅' : pkg.scorecard >= 5 ? '⚠️' : '❌';
      report += `- OpenSSF Scorecard: ${scoreEmoji} **${pkg.scorecard}/10**\n`;
    }

    if (pkg.vulnerabilities && pkg.vulnerabilities > 0) {
      report += `- ⚠️ **${pkg.vulnerabilities} known vulnerabilities**\n`;
    }

    report += `\n`;
  }

  // License summary
  report += `\n---\n\n## 📜 License Summary\n\n`;

  const licenses = packages
    .filter(p => p.license)
    .reduce((acc, p) => {
      const license = p.license!;
      if (!acc[license]) acc[license] = [];
      acc[license].push(p.name);
      return acc;
    }, {} as Record<string, string[]>);

  for (const [license, pkgs] of Object.entries(licenses).sort()) {
    const emoji = license.includes('MIT') || license.includes('Apache') || license.includes('BSD') || license.includes('ISC')
      ? '✅'
      : license.includes('GPL') || license.includes('AGPL')
      ? '⚠️'
      : 'ℹ️';
    report += `${emoji} **${license}** (${pkgs.length} packages)\n`;
  }

  // Scorecard summary
  report += `\n---\n\n## 🏆 OpenSSF Scorecard Distribution\n\n`;

  const scored = packages.filter(p => p.scorecard !== undefined);
  const avgScore = scored.length > 0
    ? (scored.reduce((sum, p) => sum + (p.scorecard || 0), 0) / scored.length).toFixed(1)
    : 'N/A';

  report += `- **Packages with scores:** ${scored.length} / ${packages.length}\n`;
  report += `- **Average score:** ${avgScore}/10\n\n`;

  const scoreRanges = {
    'Excellent (8-10)': scored.filter(p => (p.scorecard || 0) >= 8).length,
    'Good (6-7.9)': scored.filter(p => (p.scorecard || 0) >= 6 && (p.scorecard || 0) < 8).length,
    'Fair (4-5.9)': scored.filter(p => (p.scorecard || 0) >= 4 && (p.scorecard || 0) < 6).length,
    'Poor (0-3.9)': scored.filter(p => (p.scorecard || 0) < 4).length,
  };

  for (const [range, count] of Object.entries(scoreRanges)) {
    if (count > 0) {
      report += `- ${range}: ${count} packages\n`;
    }
  }

  // Vulnerabilities summary
  const withVulns = packages.filter(p => p.vulnerabilities && p.vulnerabilities > 0);
  if (withVulns.length > 0) {
    report += `\n---\n\n## ⚠️ Known Vulnerabilities\n\n`;
    report += `**Total packages with vulnerabilities:** ${withVulns.length}\n\n`;

    for (const pkg of withVulns) {
      report += `- **${pkg.name}**: ${pkg.vulnerabilities} issue(s)\n`;
    }

    report += `\n> Run \`npm audit\` in each directory for detailed vulnerability information.\n`;
  }

  report += `\n---\n\n## 🎯 Recommendations\n\n`;

  const gplPackages = packages.filter(p => p.license?.includes('GPL') || p.license?.includes('AGPL'));
  if (gplPackages.length > 0) {
    report += `⚠️ **Copyleft Licenses Detected**\n\n`;
    report += `The following packages use GPL/AGPL licenses which may have distribution implications:\n\n`;
    for (const pkg of gplPackages) {
      report += `- ${pkg.name} (${pkg.license})\n`;
    }
    report += `\n`;
  }

  const lowScorePackages = packages.filter(p => p.scorecard !== undefined && p.scorecard < 5);
  if (lowScorePackages.length > 0) {
    report += `⚠️ **Low Security Scores**\n\n`;
    report += `Consider reviewing these packages with scores below 5/10:\n\n`;
    for (const pkg of lowScorePackages) {
      report += `- ${pkg.name} (${pkg.scorecard}/10)\n`;
    }
    report += `\n`;
  }

  if (withVulns.length > 0) {
    report += `🔒 **Address Vulnerabilities**\n\n`;
    report += `Run \`npm audit fix\` to automatically update vulnerable packages where possible.\n\n`;
  }

  if (gplPackages.length === 0 && lowScorePackages.length === 0 && withVulns.length === 0) {
    report += `✅ **All Clear!** No major issues detected.\n\n`;
  }

  report += `---\n\n*Report generated by \`scripts/audit-dependencies.ts\`*\n`;

  return report;
}

// Main execution
async function main() {
  console.log('🔍 Scanning dependencies...\n');

  // Collect all dependencies
  const allPackages: PackageInfo[] = [
    ...getDependencies('root'),
    ...getDependencies('client'),
    ...getDependencies('server'),
  ];

  console.log(`Found ${allPackages.length} packages\n`);

  // Get vulnerability data
  console.log('🔒 Checking for vulnerabilities...');
  const clientVulns = checkVulnerabilities('client');
  const serverVulns = checkVulnerabilities('server');
  const rootVulns = checkVulnerabilities('root');

  // Enrich with license and scorecard data
  console.log('📜 Fetching license information...');
  console.log('📊 Fetching OpenSSF Scorecards (this may take a minute)...\n');

  let processed = 0;
  for (const pkg of allPackages) {
    // Add vulnerability count
    const vulnMap = pkg.location === 'client' ? clientVulns : pkg.location === 'server' ? serverVulns : rootVulns;
    pkg.vulnerabilities = vulnMap.get(pkg.name) || 0;

    // Fetch license
    pkg.license = await getLicenseInfo(pkg.name);

    // Fetch scorecard (with rate limiting)
    pkg.scorecard = await fetchScorecard(pkg.name, pkg.version);

    processed++;
    if (processed % 10 === 0) {
      console.log(`Progress: ${processed}/${allPackages.length} packages processed`);
    }

    // Rate limit: 10 requests per second max
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Processed all ${allPackages.length} packages\n`);

  // Generate report
  console.log('📝 Generating report...\n');
  const report = generateReport(allPackages);

  // Save to file
  const outputPath = path.join(rootDir, 'DEPENDENCY-AUDIT.md');
  fs.writeFileSync(outputPath, report);

  console.log(`✅ Report saved to: ${outputPath}\n`);
  console.log('📊 Summary:');
  console.log(`   - Total packages: ${allPackages.length}`);
  console.log(`   - With licenses: ${allPackages.filter(p => p.license).length}`);
  console.log(`   - With scorecards: ${allPackages.filter(p => p.scorecard !== undefined).length}`);
  console.log(`   - With vulnerabilities: ${allPackages.filter(p => p.vulnerabilities && p.vulnerabilities > 0).length}`);
}

main().catch(console.error);
