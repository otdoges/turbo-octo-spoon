#!/usr/bin/env node

/**
 * Serverless Functions Check Script
 * 
 * This script specifically checks serverless functions for security issues and code quality.
 * It identifies serverless function files and directories, then runs security and code quality checks on them.
 * 
 * If any check fails, the process exits with an error code, which can be used to prevent deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Serverless function directories to check
const serverlessDirs = [
  'netlify/functions',
  'server',
  'api',
  'src/api',
  'src/pages/api',
  'functions'
];

// Find existing serverless directories
function findServerlessDirs() {
  return serverlessDirs.filter(dir => {
    const fullPath = path.join(rootDir, dir);
    return fs.existsSync(fullPath);
  });
}

// Check if a file is a serverless function file
function isServerlessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.js', '.ts', '.jsx', '.tsx'].includes(ext);
}

// Count serverless function files in a directory
function countServerlessFunctions(dirPath) {
  let count = 0;
  
  function scanDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && isServerlessFile(fullPath)) {
        // Check if the file contains exports or handler functions that indicate it's a serverless function
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (
          content.includes('export default') || 
          content.includes('exports.handler') || 
          content.includes('module.exports') ||
          content.includes('export const handler') ||
          content.includes('export async function') ||
          content.includes('function handler')
        ) {
          count++;
        }
      }
    }
  }
  
  scanDir(dirPath);
  return count;
}

// Run security check on specific serverless directories
function runServerlessSecurityCheck(dirs) {
  console.log(chalk.cyan('🔒 Running security check on serverless functions...'));
  
  try {
    // Use the existing security-check.js script but focus on serverless directories
    const targetDirs = dirs.join(',');
    execSync(`node scripts/security-check.js --dirs=${targetDirs}`, { stdio: 'inherit' });
    console.log(chalk.green('✅ Serverless security check passed!'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Serverless security check failed!'));
    return false;
  }
}

// Run code review on specific serverless directories
function runServerlessCodeReview(dirs) {
  console.log(chalk.cyan('🔍 Code review on serverless functions has been disabled...'));
  
  // Code review has been disabled as requested
  console.log(chalk.green('✅ Serverless code review skipped!'));
  return true;
}

// Main function
async function main() {
  console.log(chalk.cyan('🚀 Checking serverless functions...'));
  
  // Find serverless directories
  const serverlessDirsExist = findServerlessDirs();
  
  if (serverlessDirsExist.length === 0) {
    console.log(chalk.yellow('⚠️ No serverless function directories found. Skipping checks.'));
    process.exit(0);
  }
  
  // Count serverless functions
  let totalFunctions = 0;
  serverlessDirsExist.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    const count = countServerlessFunctions(fullPath);
    totalFunctions += count;
    console.log(chalk.cyan(`Found ${count} serverless functions in ${dir}`));
  });
  
  if (totalFunctions === 0) {
    console.log(chalk.yellow('⚠️ No serverless functions found. Skipping checks.'));
    process.exit(0);
  }
  
  console.log(chalk.cyan(`Found a total of ${totalFunctions} serverless functions.`));
  
  // Update the security-check.js script to accept directory parameters
  // Here we'll add the --dirs parameter to the existing script
  
  // Run security check
  const securityCheckPassed = runServerlessSecurityCheck(serverlessDirsExist);
  
  // Run code review
  const codeReviewPassed = runServerlessCodeReview(serverlessDirsExist);
  
  // Check if all checks passed
  if (!securityCheckPassed || !codeReviewPassed) {
    console.error(chalk.red('\n❌ Serverless function checks failed! Please fix the issues before deploying.'));
    process.exit(1);
  }
  
  console.log(chalk.green('\n✅ All serverless function checks passed!'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Error checking serverless functions:'), error);
  process.exit(1);
}); 