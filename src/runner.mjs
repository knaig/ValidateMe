#!/usr/bin/env node

import { TestRunner } from './core/TestRunner.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  const personaArg = process.argv.find(arg => arg.startsWith('--persona='));
  const personaId = personaArg ? personaArg.split('=')[1] : 'first-time-user';
  
  // Load personas
  const personasYaml = await fs.readFile(path.join(process.cwd(), 'config', 'personas.yaml'), 'utf8');
  const personas = personasYaml.split('personas:')[1].split('- id:').slice(1).map(p => {
    const lines = p.trim().split('\n');
    return {
      id: lines[0].trim(),
      goal: lines.find(l => l.includes('goal:'))?.split('goal:')[1]?.trim()?.replace(/"/g, '') || '',
      task: lines.find(l => l.includes('task:'))?.split('task:')[1]?.trim()?.replace(/"/g, '') || ''
    };
  });
  
  const persona = personas.find(p => p.id === personaId);
  if (!persona) {
    console.error(`❌ Persona not found: ${personaId}`);
    console.log(`Available personas: ${personas.map(p => p.id).join(', ')}`);
    process.exit(1);
  }

  // Validate required environment variables
  if (!process.env.PRODUCT_URL) {
    console.error(`❌ PRODUCT_URL not found in environment variables.
    
Please set:
PRODUCT_URL=https://your-product.com

Or create a .env file with:
PRODUCT_URL=https://your-product.com
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
OPENAI_API_KEY=sk-proj-your-api-key-here`);
    process.exit(1);
  }

  const runner = new TestRunner(persona);
  
  try {
    await runner.setup();
    await runner.executePersona();
    const evaluation = await runner.generateReport();
    
    console.log('\n🎉 Validation completed successfully!');
    const overallScore = Object.values(evaluation.rubric).reduce((sum, r) => sum + r.score, 0) / Object.keys(evaluation.rubric).length;
    console.log(`📊 Overall score: ${overallScore.toFixed(2)}/5`);
    console.log(`🎯 Verdict: ${evaluation.verdict.toUpperCase()}`);
    
    // Exit with error code if score is too low
    if (overallScore < 3) {
      console.log('\n⚠️  Low score detected - consider reviewing blockers and quick wins');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
