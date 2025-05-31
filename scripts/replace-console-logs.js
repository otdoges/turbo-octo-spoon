#!/usr/bin/env node

/**
 * Console Logger Replacement Script
 * 
 * This script scans all JavaScript and TypeScript files in the codebase
 * and replaces console.log/warn/error/info statements with our custom logger utility.
 * 
 * Usage:
 *   node scripts/replace-console-logs.js                # Scan and report only
 *   node scripts/replace-console-logs.js --replace      # Scan and replace
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldReplace = args.includes('--replace');

// Extensions to scan
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Console method mappings to logger
const consolePatterns = [
  {
    pattern: /console\.log\(([^;]*?)(?:\);?|$)/g,
    replacement: (match, args) => `logger.debug(${args});`
  },
  {
    pattern: /console\.info\(([^;]*?)(?:\);?|$)/g,
    replacement: (match, args) => `logger.info(${args});`
  },
  {
    pattern: /console\.warn\(([^;]*?)(?:\);?|$)/g,
    replacement: (match, args) => `logger.warn(${args});`
  },
  {
    pattern: /console\.error\(([^;]*?)(?:\);?|$)/g,
    replacement: (match, args) => `logger.error(${args});`
  }
];

// Directories to ignore
const ignoreDirs = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'scripts'
];

// Files to ignore
const ignoreFiles = [
  'logger.ts', // Don't replace in our logger utility
  'replace-console-logs.js' // Don't replace in this script
];

// Track statistics
let totalFiles = 0;
let filesWithConsole = 0;
let totalConsoleStatements = 0;
let replacedStatements = 0;

/**
 * Scan a file for console statements
 */
function scanFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let hasConsole = false;
    let newContent = fileContent;
    let fileConsoleCount = 0;
    
    // Check for imports of our logger
    const hasLoggerImport = /import\s+.*?logger.*?from\s+['"].*?utils\/logger['"]/.test(fileContent);
    
    // Find all console statements
    for (const { pattern } of consolePatterns) {
      const matches = fileContent.match(pattern);
      if (matches) {
        hasConsole = true;
        fileConsoleCount += matches.length;
      }
    }
    
    // If we should replace and found console statements
    if (shouldReplace && hasConsole) {
      // Add logger import if not present
      if (!hasLoggerImport) {
        try {
          // Determine the correct relative path to the logger
          const relativeToSrc = path.relative(path.dirname(filePath), path.join(rootDir, 'src', 'utils'));
          // Ensure path is properly formatted for the OS
          const normalizedPath = relativeToSrc.split(path.sep).join('/');
          
          const importPath = normalizedPath.startsWith('.') 
            ? `${normalizedPath}/logger` 
            : `./${normalizedPath}/logger`;
          
          // Add import statement after other imports or at the top
          if (fileContent.includes('import ')) {
            const lastImportIndex = fileContent.lastIndexOf('import ');
            const endOfImportsIndex = fileContent.indexOf('\n', fileContent.indexOf(';', lastImportIndex));
            if (endOfImportsIndex > -1) {
              newContent = 
                fileContent.substring(0, endOfImportsIndex + 1) + 
                `import logger from '${importPath}';\n` + 
                fileContent.substring(endOfImportsIndex + 1);
            } else {
              // Fallback if we can't find the end of imports
              newContent = `import logger from '${importPath}';\n\n${fileContent}`;
            }
          } else {
            newContent = `import logger from '${importPath}';\n\n${fileContent}`;
          }
        } catch (importError) {
          console.error(`Error calculating import path for ${filePath}:`, importError);
          // Continue without adding the import
        }
      }
      
      // Replace console statements
      for (const { pattern, replacement } of consolePatterns) {
        newContent = newContent.replace(pattern, (match, args) => {
          replacedStatements++;
          return replacement(match, args);
        });
      }
      
      // Write the changes back to the file
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
      } catch (writeError) {
        console.error(`Error writing to file ${filePath}:`, writeError);
      }
    }
    
    // Update statistics
    if (hasConsole) {
      filesWithConsole++;
      totalConsoleStatements += fileConsoleCount;
      
      console.log(`[${shouldReplace ? 'REPLACED' : 'FOUND'}] ${filePath}: ${fileConsoleCount} console statements`);
    }
    
    return hasConsole;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Recursively scan a directory for files
 */
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip ignored directories
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        scanDirectory(fullPath);
      }
      continue;
    }
    
    // Skip ignored files
    if (ignoreFiles.includes(entry.name)) {
      continue;
    }
    
    // Process only files with matching extensions
    const ext = path.extname(entry.name).toLowerCase();
    if (extensions.includes(ext)) {
      totalFiles++;
      scanFile(fullPath);
    }
  }
}

// Main execution
console.log(`Scanning for console statements in ${shouldReplace ? 'replace' : 'report'} mode...\n`);
scanDirectory(rootDir);

// Print summary
console.log('\n---- Summary ----');
console.log(`Total files scanned: ${totalFiles}`);
console.log(`Files with console statements: ${filesWithConsole}`);
console.log(`Total console statements found: ${totalConsoleStatements}`);

if (shouldReplace) {
  console.log(`Total statements replaced: ${replacedStatements}`);
}

console.log('\nTo replace all console statements, run:');
console.log('  node scripts/replace-console-logs.js --replace'); 