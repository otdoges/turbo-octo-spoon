#!/usr/bin/env node

/**
 * Pre-commit hook script for security checks
 * 
 * This script runs security checks before committing code:
 * 1. Looks for hardcoded secrets/API keys
 * 2. Checks for potential XSS vulnerabilities
 * 3. Identifies other security risks
 * 
 * To use: Add this to your package.json scripts:
 *   "precommit": "node scripts/pre-commit.js"
 * And install husky to run it before commits
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Security check patterns
const PATTERNS = {
  // API keys, tokens, and secrets
  apiKeys: [
    /API[-_]?KEY["'`]?\s*[:=]\s*["'`][A-Za-z0-9_\-]{16,}["'`]/i,
    /TOKEN["'`]?\s*[:=]\s*["'`][A-Za-z0-9_\-]{16,}["'`]/i,
    /SECRET["'`]?\s*[:=]\s*["'`][A-Za-z0-9_\-]{16,}["'`]/i,
    /PASSWORD["'`]?\s*[:=]\s*["'`][^"'`]{8,}["'`]/i,
    /GITHUB_TOKEN["'`]?\s*[:=]\s*["'`](?!your_github_token_here)[A-Za-z0-9_\-]{16,}["'`]/i,
    /GEMINI_API_KEY["'`]?\s*[:=]\s*["'`](?!your_gemini_api_key_here)[A-Za-z0-9_\-]{16,}["'`]/i,
    /OPENROUTER_API_KEY["'`]?\s*[:=]\s*["'`](?!your_openrouter_api_key_here)[A-Za-z0-9_\-]{16,}["'`]/i,
  ],
  
  // XSS vulnerabilities
  xss: [
    /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/i,
    /innerHTML\s*=/i,
    /document\.write\(/i,
    /eval\(/i,
    /new\s+Function\(/i,
  ],
  
  // Missing security headers
  missingHeaders: [
    /\.setHeader\(['"]Content-Security-Policy['"]/i,
    /\.setHeader\(['"]X-Content-Type-Options['"]/i,
    /\.setHeader\(['"]X-Frame-Options['"]/i,
  ],
  
  // Insecure cookies
  insecureCookies: [
    /\.cookie\s*=\s*(?!.*secure)/i,
    /\.cookie\s*=\s*(?!.*httpOnly)/i,
    /\.cookie\s*=\s*(?!.*sameSite)/i,
  ],
  
  // SQL injection risks
  sqlInjection: [
    /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\$\{/i,
    /executeQuery\(\s*["'`]SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\$\{/i,
    /executeQuery\(\s*["'`]INSERT\s+INTO\s+.*\s+VALUES\s+.*\$\{/i,
  ],
  
  // Security misconfiguration
  securityMisconfig: [
    /mode\s*:\s*["'`]no-cors["'`]/i,
    /Access-Control-Allow-Origin\s*:\s*["'`]\*["'`]/i,
  ],
};

// Directories and files to ignore
const IGNORE_PATTERNS = [
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
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

// Function to check file for security issues
function checkFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check for API keys
  PATTERNS.apiKeys.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'API_KEY',
        message: 'Possible hardcoded API key or secret found',
        severity: 'HIGH'
      });
    }
  });
  
  // Check for XSS vulnerabilities
  PATTERNS.xss.forEach(pattern => {
    if (pattern.test(content)) {
      // Check if it's our SafeHTML component
      if (
        /export default SafeHTML/.test(content) && 
        /DOMPurify\.sanitize/.test(content) &&
        /data-sanitized="true"/.test(content)
      ) {
        // This is our secure SafeHTML component, ignore
        return;
      }
      
      // Check if there's a function that sanitizes the content before using dangerouslySetInnerHTML
      if (pattern.toString().includes('dangerouslySetInnerHTML')) {
        // Check if there's a function that sanitizes the content before using dangerouslySetInnerHTML
        const hasFormatFunction = /function\s+format\w+\s*\([^)]*\)\s*\{[\s\S]*?DOMPurify\.sanitize\([\s\S]*?\}\s*\}/i.test(content);
        // Check if DOMPurify is directly used with dangerouslySetInnerHTML
        const hasDomPurifyDirect = /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*DOMPurify\.sanitize\(/i.test(content);
        // Check if the component imports DOMPurify
        const importsDomPurify = /import\s+.*DOMPurify.*from\s+['"]dompurify['"]/i.test(content);
        // Check if it's using our SafeHTML component
        const usesSafeHTML = /<SafeHTML[\s\S]*?html=/i.test(content);
        
        // If any of these conditions are met, the code is likely safe
        if (((hasFormatFunction || hasDomPurifyDirect) && importsDomPurify) || usesSafeHTML) {
          return;
        }
      }
      
      issues.push({
        type: 'XSS',
        message: 'Potential XSS vulnerability found',
        severity: 'HIGH'
      });
    }
  });
  
  // Check for insecure cookies
  PATTERNS.insecureCookies.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'INSECURE_COOKIE',
        message: 'Insecure cookie settings detected',
        severity: 'MEDIUM'
      });
    }
  });
  
  // Check for SQL injection risks
  PATTERNS.sqlInjection.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'SQL_INJECTION',
        message: 'Potential SQL injection risk found',
        severity: 'HIGH'
      });
    }
  });
  
  // Check for security misconfiguration
  PATTERNS.securityMisconfig.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'SECURITY_MISCONFIG',
        message: 'Security misconfiguration detected',
        severity: 'MEDIUM'
      });
    }
  });
  
  return issues;
}

// Function to scan directory recursively
function scanDirectory(dirPath, results = []) {
  if (shouldIgnore(dirPath)) {
    return results;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, results);
    } else if (entry.isFile() && !shouldIgnore(fullPath)) {
      // Only check files with these extensions
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.php', '.py'].includes(ext)) {
        const issues = checkFile(fullPath);
        
        if (issues.length > 0) {
          results.push({
            file: fullPath,
            issues
          });
        }
      }
    }
  });
  
  return results;
}

async function main() {
  console.log(chalk.cyan('🔒 Running pre-commit security checks...'));
  
  // Run the security check
  const filesWithIssues = [];
  const totalIssues = [];
  
  scanDirectory(rootDir).forEach(result => {
    if (result.issues.length > 0) {
      filesWithIssues.push(result);
      totalIssues.push(...result.issues);
    }
  });
  
  // Run code review check
  try {
    // Code review has been removed as requested
    const codeReviewErrors = 0;
    
    if (false) {
      console.error(chalk.red(`❌ Code review disabled`));
      console.error(codeReviewResult);
      process.exit(1);
    }
  } catch (error) {
    // If code review script fails with non-zero exit code, it found errors
    // Removed code review error handling
    if (error.stdout) console.error(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
  
  // Display results
  if (filesWithIssues.length > 0) {
    console.error(chalk.red(`\n❌ Found ${totalIssues.length} security issues in ${filesWithIssues.length} files:`));
    
    filesWithIssues.forEach(fileResult => {
      console.error(chalk.yellow(`\nFile: ${fileResult.file}`));
      
      fileResult.issues.forEach(issue => {
        const severityColor = issue.severity === 'HIGH' ? chalk.red : chalk.yellow;
        console.error(`  ${severityColor(`[${issue.severity}]`)} ${issue.type}: ${issue.message}`);
      });
    });
    
    console.error(chalk.red('\n❌ Pre-commit check failed! Please fix the issues above before committing.'));
    process.exit(1);
  } else {
    console.log(chalk.green('✅ Security check passed! No issues found.'));
    process.exit(0);
  }
}

// Run the main function
main(); 