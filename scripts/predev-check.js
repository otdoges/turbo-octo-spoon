#!/usr/bin/env node

/**
 * Pre-development check script
 * 
 * This script runs security and code quality checks before starting the development server.
 * If any check fails, the process exits with an error code to prevent the development server from starting.
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

// Function to run a command and handle errors
function runCheck(command, name) {
  console.log(chalk.cyan(`🔍 Running ${name}...`));
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(chalk.green(`✅ ${name} passed!`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ ${name} failed!`));
    return false;
  }
}

// Main function
async function main() {
  console.log(chalk.cyan('🚀 Running pre-development checks...'));
  
  // Run security check
  const securityCheckPassed = runCheck('node scripts/security-check.js', 'Security check');
  
  // Run code review (only show errors, not warnings)
  const codeReviewPassed = runCheck('node scripts/code-review.js', 'Code review');
  
  // Check if all checks passed
  if (!securityCheckPassed || !codeReviewPassed) {
    console.error(chalk.red('\n❌ Pre-development checks failed! Please fix the issues before starting the development server.'));
    process.exit(1);
  }
  
  console.log(chalk.green('\n✅ All pre-development checks passed! Starting the development server...'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Error running pre-development checks:'), error);
  process.exit(1);
}); 