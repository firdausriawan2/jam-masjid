#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Generate version information for the application
 */

function getGitInfo() {
  try {
    const gitHash = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    const gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
    const gitTag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf8",
    })
      .trim()
      .catch(() => "v1.0.0");

    return {
      hash: gitHash.substring(0, 8), // Short hash
      fullHash: gitHash,
      branch: gitBranch,
      tag: gitTag,
    };
  } catch (error) {
    console.warn("Git information not available:", error.message);
    return {
      hash: "unknown",
      fullHash: "unknown",
      branch: "main",
      tag: "v1.0.0",
    };
  }
}

function getPackageInfo() {
  try {
    const packagePath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    return {
      name: packageJson.name || "jam-masjid",
      version: packageJson.version || "1.0.0",
      description:
        packageJson.description || "Digital Clock Application for Mosque",
      author: packageJson.author || "Jam Masjid Team",
    };
  } catch (error) {
    console.warn("Package.json not found or invalid:", error.message);
    return {
      name: "jam-masjid",
      version: "1.0.0",
      description: "Digital Clock Application for Mosque",
      author: "Jam Masjid Team",
    };
  }
}

function generateBuildInfo() {
  const now = new Date();
  const git = getGitInfo();
  const pkg = getPackageInfo();

  const buildInfo = {
    // Application info
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,

    // Build info
    buildTime: now.toISOString(),
    buildTimestamp: now.getTime(),
    buildDate: now.toISOString().split("T")[0],
    buildNumber: Math.floor(now.getTime() / 1000), // Unix timestamp as build number

    // Git info
    gitHash: git.hash,
    gitFullHash: git.fullHash,
    gitBranch: git.branch,
    gitTag: git.tag,

    // Environment info
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,

    // Feature flags
    features: {
      prayerTimes: true,
      announcements: true,
      cashManagement: true,
      adminPanel: true,
      multiLanguage: true,
      darkMode: true,
      notifications: true,
    },

    // API endpoints
    endpoints: {
      health: "/api/health",
      version: "/api/version",
      prayerTimes: "/api/prayer-times",
      admin: "/admin",
    },
  };

  return buildInfo;
}

function writeVersionFiles(buildInfo) {
  // Create version directories if they don't exist
  const publicDir = path.join(process.cwd(), "public");
  const srcDir = path.join(process.cwd(), "src");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write version.json to public directory
  const publicVersionPath = path.join(publicDir, "version.json");
  fs.writeFileSync(publicVersionPath, JSON.stringify(buildInfo, null, 2));

  // Write simplified version for client-side
  const clientVersion = {
    version: buildInfo.version,
    buildDate: buildInfo.buildDate,
    gitHash: buildInfo.gitHash,
    features: buildInfo.features,
  };

  // Write build-info.js for Next.js
  const buildInfoPath = path.join(process.cwd(), "build-info.js");
  const buildInfoContent = `// Auto-generated build information
// Generated at: ${buildInfo.buildTime}

module.exports = ${JSON.stringify(buildInfo, null, 2)};
`;

  fs.writeFileSync(buildInfoPath, buildInfoContent);

  // Write TypeScript types
  const typesContent = `// Auto-generated build information types
// Generated at: ${buildInfo.buildTime}

export interface BuildInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  buildTime: string;
  buildTimestamp: number;
  buildDate: string;
  buildNumber: number;
  gitHash: string;
  gitFullHash: string;
  gitBranch: string;
  gitTag: string;
  nodeVersion: string;
  platform: string;
  architecture: string;
  features: {
    prayerTimes: boolean;
    announcements: boolean;
    cashManagement: boolean;
    adminPanel: boolean;
    multiLanguage: boolean;
    darkMode: boolean;
    notifications: boolean;
  };
  endpoints: {
    health: string;
    version: string;
    prayerTimes: string;
    admin: string;
  };
}

export const buildInfo: BuildInfo = ${JSON.stringify(buildInfo, null, 2)};
`;

  if (fs.existsSync(srcDir)) {
    const typesPath = path.join(srcDir, "build-info.ts");
    fs.writeFileSync(typesPath, typesContent);
  }

  return {
    publicVersionPath,
    buildInfoPath,
    typesPath: fs.existsSync(srcDir)
      ? path.join(srcDir, "build-info.ts")
      : null,
  };
}

function main() {
  console.log("🔧 Generating version information...");

  try {
    const buildInfo = generateBuildInfo();
    const paths = writeVersionFiles(buildInfo);

    console.log("✅ Version files generated successfully!");
    console.log(`📄 Public version: ${paths.publicVersionPath}`);
    console.log(`📄 Build info: ${paths.buildInfoPath}`);
    if (paths.typesPath) {
      console.log(`📄 TypeScript types: ${paths.typesPath}`);
    }

    console.log("\n📋 Build Information:");
    console.log(`   Version: ${buildInfo.version}`);
    console.log(`   Build: ${buildInfo.buildNumber}`);
    console.log(`   Git: ${buildInfo.gitHash} (${buildInfo.gitBranch})`);
    console.log(`   Date: ${buildInfo.buildDate}`);
    console.log(`   Platform: ${buildInfo.platform}/${buildInfo.architecture}`);
    console.log(`   Node: ${buildInfo.nodeVersion}`);
  } catch (error) {
    console.error("❌ Failed to generate version information:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateBuildInfo,
  writeVersionFiles,
  getGitInfo,
  getPackageInfo,
};
