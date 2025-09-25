#!/usr/bin/env node

import { program } from 'commander';
import { TestRunner } from './core/TestRunner.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const packageJson = JSON.parse(await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8'));

program
  .name('validate-me')
  .description('AI-powered product validation framework')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize ValidateMe in current directory')
  .action(async () => {
    console.log('🚀 Initializing ValidateMe...');
    
    // Create .env file if it doesn't exist
    try {
      await fs.access('.env');
      console.log('✅ .env file already exists');
    } catch {
      await fs.copyFile('node_modules/@knaig/validate-me/config/.env.example', '.env');
      console.log('✅ Created .env file - please configure it');
    }
    
    // Create config directory if it doesn't exist
    try {
      await fs.mkdir('config', { recursive: true });
      console.log('✅ Created config directory');
    } catch {
      console.log('✅ Config directory already exists');
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Edit .env file with your product URL and OpenAI API key');
    console.log('2. Customize config/personas.yaml for your users');
    console.log('3. Run: validate-me test --persona=first-time-user');
  });

program
  .command('test')
  .description('Run product validation test')
  .option('-p, --persona <persona>', 'Persona to test', 'first-time-user')
  .option('-u, --url <url>', 'Product URL to test')
  .option('-e, --email <email>', 'Test email for authentication')
  .option('-w, --password <password>', 'Test password for authentication')
  .option('--headful', 'Run in headed mode (show browser)')
  .action(async (options) => {
    try {
      // Override environment variables with CLI options
      if (options.url) process.env.PRODUCT_URL = options.url;
      if (options.email) process.env.TEST_EMAIL = options.email;
      if (options.password) process.env.TEST_PASSWORD = options.password;
      if (options.headful) process.env.HEADFUL = '1';
      
      // Load personas
      const personasYaml = await fs.readFile(path.join(process.cwd(), 'config/personas.yaml'), 'utf8');
      const personas = personasYaml.split('personas:')[1].split('- id:').slice(1).map(p => {
        const lines = p.trim().split('\n');
        return {
          id: lines[0].trim(),
          goal: lines.find(l => l.includes('goal:'))?.split('goal:')[1]?.trim()?.replace(/"/g, '') || '',
          task: lines.find(l => l.includes('task:'))?.split('task:')[1]?.trim()?.replace(/"/g, '') || ''
        };
      });
      
      const persona = personas.find(p => p.id === options.persona);
      if (!persona) {
        console.error(`❌ Persona not found: ${options.persona}`);
        console.log(`Available personas: ${personas.map(p => p.id).join(', ')}`);
        process.exit(1);
      }
      
      const runner = new TestRunner(persona);
      
      console.log(`🎭 Testing persona: ${persona.id}`);
      console.log(`🎯 Goal: ${persona.goal}`);
      console.log(`📝 Task: ${persona.task}`);
      
      await runner.setup();
      await runner.executePersona();
      const evaluation = await runner.generateReport();
      
      console.log('\n🎉 Validation completed successfully!');
      const overallScore = Object.values(evaluation.rubric).reduce((sum, r) => sum + r.score, 0) / Object.keys(evaluation.rubric).length;
      console.log(`📊 Overall score: ${overallScore.toFixed(2)}/5`);
      console.log(`🎯 Verdict: ${evaluation.verdict.toUpperCase()}`);
      
      if (overallScore < 3) {
        console.log('\n⚠️  Low score detected - consider reviewing blockers and quick wins');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('💥 Validation failed:', error.message);
      process.exit(1);
    } finally {
      if (runner) await runner.cleanup();
    }
  });

program
  .command('test-all')
  .description('Run validation tests for all personas')
  .option('-u, --url <url>', 'Product URL to test')
  .action(async (options) => {
    console.log('🎭 Running validation for all personas...');
    
    if (options.url) process.env.PRODUCT_URL = options.url;
    
    // Load personas
    const personasYaml = await fs.readFile(path.join(process.cwd(), 'config/personas.yaml'), 'utf8');
    const personas = personasYaml.split('personas:')[1].split('- id:').slice(1).map(p => {
      const lines = p.trim().split('\n');
      return {
        id: lines[0].trim(),
        goal: lines.find(l => l.includes('goal:'))?.split('goal:')[1]?.trim()?.replace(/"/g, '') || '',
        task: lines.find(l => l.includes('task:'))?.split('task:')[1]?.trim()?.replace(/"/g, '') || ''
      };
    });
    
    const results = [];
    
    for (const persona of personas) {
      console.log(`\n🎭 Testing persona: ${persona.id}`);
      
      try {
        const runner = new TestRunner(persona);
        await runner.setup();
        await runner.executePersona();
        const evaluation = await runner.generateReport();
        await runner.cleanup();
        
        const overallScore = Object.values(evaluation.rubric).reduce((sum, r) => sum + r.score, 0) / Object.keys(evaluation.rubric).length;
        results.push({ persona: persona.id, score: overallScore, verdict: evaluation.verdict });
        
        console.log(`✅ ${persona.id}: ${overallScore.toFixed(2)}/5 (${evaluation.verdict})`);
        
      } catch (error) {
        console.error(`❌ ${persona.id}: Failed - ${error.message}`);
        results.push({ persona: persona.id, score: 0, verdict: 'FAILED' });
      }
    }
    
    // Generate summary
    console.log('\n📊 Summary:');
    console.log('| Persona | Score | Verdict |');
    console.log('|---------|-------|---------|');
    results.forEach(r => {
      console.log(`| ${r.persona} | ${r.score.toFixed(2)}/5 | ${r.verdict} |`);
    });
    
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    console.log(`\n🎯 Average Score: ${avgScore.toFixed(2)}/5`);
    
    if (avgScore < 3) {
      console.log('\n⚠️  Low average score - consider reviewing blockers and quick wins');
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify ValidateMe setup')
  .action(async () => {
    console.log('🔍 Verifying ValidateMe setup...\n');
    
    let allGood = true;
    
    // Check environment variables
    const requiredEnvVars = ['PRODUCT_URL', 'OPENAI_API_KEY'];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Not set`);
        allGood = false;
      }
    }
    
    // Check configuration files
    try {
      await fs.access('config/personas.yaml');
      console.log('✅ config/personas.yaml: Found');
    } catch {
      console.log('❌ config/personas.yaml: Not found');
      allGood = false;
    }
    
    if (allGood) {
      console.log('\n🎉 Setup verification completed successfully!');
      console.log('🚀 You can now run: validate-me test');
    } else {
      console.log('\n❌ Setup verification failed!');
      console.log('🔧 Please run: validate-me init');
      process.exit(1);
    }
  });

program.parse();
