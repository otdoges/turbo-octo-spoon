#!/usr/bin/env node

/**
 * Generate CSP hashes for inline scripts and styles
 * 
 * This script scans the built HTML files to generate SHA-256 hashes
 * for any inline scripts and styles, which can be used in the CSP
 * to securely allow these resources without 'unsafe-inline'.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Patterns to find inline scripts and styles
const INLINE_SCRIPT_PATTERN = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
const INLINE_STYLE_PATTERN = /<style[^>]*>([\s\S]*?)<\/style>/gi;

// Function to generate SHA-256 hash
function generateSHA256Hash(content) {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return `'sha256-${hash.digest('base64')}'`;
}

// Function to scan HTML files and extract inline scripts and styles
function scanHTMLFiles(directory) {
  const scriptHashes = new Set();
  const styleHashes = new Set();
  
  // Find all HTML files recursively
  function findHTMLFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        findHTMLFiles(fullPath);
      } else if (file.name.endsWith('.html')) {
        console.log(chalk.blue(`Scanning ${fullPath}`));
        
        // Read file content
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Find and hash inline scripts
        let scriptMatch;
        while ((scriptMatch = INLINE_SCRIPT_PATTERN.exec(content)) !== null) {
          const script = scriptMatch[1].trim();
          if (script) {
            const hash = generateSHA256Hash(script);
            scriptHashes.add(hash);
            console.log(chalk.green(`Found inline script: ${hash}`));
          }
        }
        
        // Find and hash inline styles
        let styleMatch;
        while ((styleMatch = INLINE_STYLE_PATTERN.exec(content)) !== null) {
          const style = styleMatch[1].trim();
          if (style) {
            const hash = generateSHA256Hash(style);
            styleHashes.add(hash);
            console.log(chalk.green(`Found inline style: ${hash}`));
          }
        }
      }
    });
  }
  
  try {
    findHTMLFiles(directory);
    
    return {
      scriptHashes: Array.from(scriptHashes),
      styleHashes: Array.from(styleHashes)
    };
  } catch (error) {
    console.error(chalk.red('Error scanning HTML files:'), error);
    return { scriptHashes: [], styleHashes: [] };
  }
}

// Function to update Netlify.toml with generated hashes
function updateNetlifyConfig(scriptHashes, styleHashes) {
  const configPath = path.resolve(__dirname, '../netlify.toml');
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Create hash strings
    const scriptHashString = scriptHashes.join(' ');
    const styleHashString = styleHashes.join(' ');
    
    // Replace placeholders with actual hashes
    content = content.replace('\'sha256-REPLACE_WITH_SCRIPT_HASH\'', scriptHashString || '\'none\'');
    content = content.replace('\'sha256-REPLACE_WITH_STYLE_HASH\'', styleHashString || '\'none\'');
    
    // Write updated config
    fs.writeFileSync(configPath, content);
    
    console.log(chalk.green('Successfully updated netlify.toml with CSP hashes'));
  } catch (error) {
    console.error(chalk.red('Error updating netlify.toml:'), error);
  }
}

// Main function
function main() {
  console.log(chalk.blue('Generating CSP hashes for inline scripts and styles...'));
  
  if (!fs.existsSync(distDir)) {
    console.error(chalk.red(`Error: Directory not found: ${distDir}`));
    console.log(chalk.yellow('Please run "bun run build" first to generate the dist directory'));
    process.exit(1);
  }
  
  const { scriptHashes, styleHashes } = scanHTMLFiles(distDir);
  
  console.log(chalk.blue('\nGenerated script hashes:'));
  scriptHashes.forEach(hash => console.log(hash));
  
  console.log(chalk.blue('\nGenerated style hashes:'));
  styleHashes.forEach(hash => console.log(hash));
  
  updateNetlifyConfig(scriptHashes, styleHashes);
  
  console.log(chalk.green('\nCSP hash generation complete! ✨'));
}

// Run the main function
main(); 