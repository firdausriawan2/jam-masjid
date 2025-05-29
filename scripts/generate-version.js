/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function generateVersionInfo() {
  try {
    // Get git commit hash
    let gitHash = "unknown";
    let gitBranch = "unknown";

    try {
      gitHash = execSync("git rev-parse --short HEAD", {
        encoding: "utf-8",
      }).trim();
      gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf-8",
      }).trim();
    } catch {
      console.warn("Git not available, using fallback version info");
    }

    // Read package.json for version
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));

    const versionInfo = {
      version: packageJson.version,
      gitHash,
      gitBranch,
      buildTime: new Date().toISOString(),
      buildTimestamp: Date.now(),
    };

    // Write to public folder
    const versionPath = path.join("public", "version.json");
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

    // Write to app for import
    const versionTsPath = path.join("app", "version.ts");
    const versionTsContent = `// Auto-generated file - do not edit manually
export const VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)} as const;
`;
    fs.writeFileSync(versionTsPath, versionTsContent);

    console.log("✅ Version info generated:", versionInfo);
  } catch (error) {
    console.error("❌ Error generating version info:", error);
    process.exit(1);
  }
}

generateVersionInfo();
