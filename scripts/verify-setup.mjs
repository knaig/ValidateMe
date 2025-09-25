#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function verifySetup() {
  console.log('🔍 Verifying ValidateMe setup...\n');
  
  let allGood = true;

  // Check Node.js version
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      console.log(`✅ Node.js version: ${nodeVersion}`);
    } else {
      console.log(`❌ Node.js version: ${nodeVersion} (requires 18+)`);
      allGood = false;
    }
  } catch (error) {
    console.log('❌ Could not determine Node.js version');
    allGood = false;
  }

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  
  const requiredEnvVars = [
    { key: 'PRODUCT_URL', description: 'Your product URL to test' },
    { key: 'OPENAI_API_KEY', description: 'OpenAI API key for AI evaluation' }
  ];

  const optionalEnvVars = [
    { key: 'TEST_EMAIL', description: 'Test email for authentication' },
    { key: 'TEST_PASSWORD', description: 'Test password for authentication' },
    { key: 'HEADFUL', description: 'Run in headed mode (1) or headless (0)' }
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar.key]) {
      console.log(`✅ ${envVar.key}: ${envVar.description}`);
    } else {
      console.log(`❌ ${envVar.key}: ${envVar.description} (required)`);
      allGood = false;
    }
  }

  for (const envVar of optionalEnvVars) {
    if (process.env[envVar.key]) {
      console.log(`✅ ${envVar.key}: ${envVar.description}`);
    } else {
      console.log(`⚠️ ${envVar.key}: ${envVar.description} (optional)`);
    }
  }

  // Check Playwright installation
  console.log('\n🎭 Playwright Setup:');
  try {
    const result = execSync('npx playwright install --dry-run', { encoding: 'utf8' });
    if (result.includes('Already installed')) {
      console.log('✅ Playwright browsers: Installed');
    } else {
      console.log('⚠️ Playwright browsers: Not installed');
      console.log('   Run: npm run install');
    }
  } catch (error) {
    console.log('❌ Playwright browsers: Installation check failed');
    allGood = false;
  }

  // Check configuration files
  console.log('\n📁 Configuration Files:');
  
  const configFiles = [
    { path: 'config/personas.yaml', description: 'Persona definitions' },
    { path: 'config/evaluator.prompt', description: 'AI evaluation criteria' },
    { path: 'config/playwright.config.js', description: 'Browser configuration' }
  ];

  for (const file of configFiles) {
    try {
      await fs.access(file.path);
      console.log(`✅ ${file.path}: ${file.description}`);
    } catch (error) {
      console.log(`❌ ${file.path}: ${file.description} (missing)`);
      allGood = false;
    }
  }

  // Check OpenAI API key format
  if (process.env.OPENAI_API_KEY) {
    console.log('\n🔑 OpenAI API Key:');
    if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.log('✅ API key format: Valid');
    } else {
      console.log('⚠️ API key format: Should start with "sk-"');
    }
  }

  // Check product URL accessibility
  if (process.env.PRODUCT_URL) {
    console.log('\n🌐 Product URL:');
    try {
      const response = await fetch(process.env.PRODUCT_URL, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`✅ Product URL: Accessible (${response.status})`);
      } else {
        console.log(`⚠️ Product URL: Responding but not OK (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Product URL: Not accessible (${error.message})`);
      allGood = false;
    }
  }

  // Check reports directory
  console.log('\n📊 Reports Directory:');
  try {
    await fs.mkdir('reports', { recursive: true });
    await fs.writeFile('reports/.test-write', 'test');
    await fs.unlink('reports/.test-write');
    console.log('✅ Reports directory: Writable');
  } catch (error) {
    console.log(`❌ Reports directory: Not writable (${error.message})`);
    allGood = false;
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('🎉 Setup verification completed successfully!');
    console.log('🚀 You can now run: npm run run');
  } else {
    console.log('❌ Setup verification failed!');
    console.log('🔧 Please fix the issues above before running tests.');
    process.exit(1);
  }
}

verifySetup().catch(error => {
  console.error('💥 Setup verification error:', error);
  process.exit(1);
});
