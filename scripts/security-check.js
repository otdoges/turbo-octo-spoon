#!/usr/bin/env node

/**
 * Pre-deployment security check script
 * 
 * This script scans the codebase for potential API keys, tokens, or other sensitive information
 * that might have been accidentally committed. It's meant to be run before deployment
 * to prevent security issues.
 * 
 * Usage:
 *   node scripts/security-check.js                     # Check entire codebase
 *   node scripts/security-check.js --dirs=dir1,dir2    # Check specific directories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const result = { dirs: [] };
  
  for (const arg of args) {
    if (arg.startsWith('--dirs=')) {
      const dirs = arg.replace('--dirs=', '').split(',');
      result.dirs = dirs.map(dir => path.join(rootDir, dir));
    }
  }
  
  return result;
}

// Get directories to scan
const args = parseArgs();
const dirsToScan = args.dirs.length > 0 ? args.dirs : [rootDir];

// Patterns to search for
const patterns = [
  /API[-_]?KEY["'`]?\s*[:=]\s*["'`][A-Za-z0-9_\-]{16,}["'`]/i,
  /TOKEN["'`]?\s*[:=]\s*["'`][A-Za-z0-9_\-]{16,}["'`]/i,
  /SECRET["'`]?\s*[:=]\s*["'`][A-Za-z0-9_\-]{16,}["'`]/i,
  /PASSWORD["'`]?\s*[:=]\s*["'`][^"'`]{8,}["'`]/i,
  /GITHUB_TOKEN["'`]?\s*[:=]\s*["'`](?!your_github_token_here)[A-Za-z0-9_\-]{16,}["'`]/i,
  /GEMINI_API_KEY["'`]?\s*[:=]\s*["'`](?!your_gemini_api_key_here)[A-Za-z0-9_\-]{16,}["'`]/i,
  /OPENROUTER_API_KEY["'`]?\s*[:=]\s*["'`](?!your_openrouter_api_key_here)[A-Za-z0-9_\-]{16,}["'`]/i,
];

// Directories and files to ignore
const ignorePatterns = [
  /node_modules/,
  /\.git/,
  /\.env$/,
  /\.env\..*/,
  /dist/,
  /build/,
  /\.next/,
  /package-lock\.json/,
  /yarn\.lock/,
  /bun\.lock/,
];

// Function to check if path should be ignored
function shouldIgnore(filePath) {
  return ignorePatterns.some(pattern => pattern.test(filePath));
}

// Function to scan a file
async function scanFile(filePath) {
  // Only scan certain file types
  if (!/\.(js|jsx|ts|tsx|json|yml|yaml|md|html|css|scss|less)$/.test(filePath)) {
    return null;
  }

  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          file: filePath,
          match: match[0],
          line: content.substring(0, match.index).split('\n').length
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Function to recursively scan directories
async function scanDir(dir) {
  let issues = [];
  
  try {
    const files = await fs.promises.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      if (shouldIgnore(filePath)) {
        continue;
      }
      
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isDirectory()) {
        const subIssues = await scanDir(filePath);
        issues = [...issues, ...subIssues];
      } else {
        const issue = await scanFile(filePath);
        if (issue) {
          issues.push(issue);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return issues;
}

async function main() {
  console.log('🔒 Running security check...');
  
  if (dirsToScan.length === 1 && dirsToScan[0] === rootDir) {
    console.log('Scanning entire codebase...');
  } else {
    console.log(`Scanning specific directories: ${dirsToScan.map(dir => path.relative(rootDir, dir)).join(', ')}`);
  }
  
  // Collect issues from all directories
  let allIssues = [];
  for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
      const issues = await scanDir(dir);
      allIssues = [...allIssues, ...issues];
    } else {
      console.warn(`Warning: Directory ${path.relative(rootDir, dir)} does not exist, skipping.`);
    }
  }
  
  if (allIssues.length > 0) {
    console.error('\n⚠️ Security issues found:');
    allIssues.forEach(issue => {
      console.error(`- ${issue.file}:${issue.line} - Potential secret: ${issue.match}`);
    });
    console.error('\n❌ Security check failed! Please fix the issues above before deploying.');
    process.exit(1);
  } else {
    console.log('✅ Security check passed! No potential secrets found in the scanned code.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error running security check:', error);
  process.exit(1);
}); 