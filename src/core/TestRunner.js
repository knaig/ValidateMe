#!/usr/bin/env node

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { AIEvaluator } from './AIEvaluator.js';
import { VisualRegressionTester } from './VisualRegression.js';
import dotenv from 'dotenv';

/**
 * Generic Product Validation Test Runner
 * Orchestrates browser automation, AI evaluation, and visual regression testing
 */
export class TestRunner {
  constructor(persona, config = {}) {
    this.persona = persona;
    this.config = {
      productUrl: process.env.PRODUCT_URL || 'http://localhost:3000',
      testEmail: process.env.TEST_EMAIL || 'test@example.com',
      testPassword: process.env.TEST_PASSWORD || 'testpassword123',
      headless: process.env.HEADFUL !== '1',
      ...config
    };
    
    this.browser = null;
    this.page = null;
    this.screenshots = [];
    this.steps = [];
    this.reportsDir = null;
  }

  static generateRunId() {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  async setup() {
    const runId = TestRunner.generateRunId();
    this.reportsDir = path.join(process.cwd(), 'reports', `${runId}-${this.persona.id}`);
    await fs.mkdir(this.reportsDir, { recursive: true });
    
    console.log(`📁 Created report directory: ${this.reportsDir}`);
    
    // Launch browser
    console.log('🌐 Launching browser...');
    this.browser = await chromium.launch({ 
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async executePersona() {
    console.log(`🎭 Running persona: ${this.persona.id}`);
    console.log(`🎯 Goal: ${this.persona.goal}`);
    console.log(`📝 Task: ${this.persona.task}`);

    try {
      // Step 1: Navigate to product
      await this.executeStep('navigate', 'Navigate to product', async () => {
        await this.page.goto(this.config.productUrl, { waitUntil: 'networkidle' });
      });
      await this.takeScreenshot('01-navigate');

      // Step 2: Wait for page to load
      await this.executeStep('wait_for_page', 'Wait for page to load', async () => {
        await this.page.waitForLoadState('domcontentloaded');
      });
      await this.takeScreenshot('02-page-loaded');

      // Step 3: Analyze page structure
      await this.executeStep('analyze_page', 'Analyze page structure', async () => {
        const title = await this.page.title();
        const buttons = await this.page.locator('button').count();
        const inputs = await this.page.locator('input').count();
        const links = await this.page.locator('a').count();
        const forms = await this.page.locator('form').count();
        
        return { title, buttons, inputs, links, forms };
      });
      await this.takeScreenshot('03-page-analysis');

      // Step 4: Look for authentication elements
      await this.executeStep('find_auth', 'Look for authentication elements', async () => {
        const signInElements = await this.page.locator('text=/sign.?in|log.?in|auth/i').count();
        const emailInputs = await this.page.locator('input[type="email"]').count();
        const passwordInputs = await this.page.locator('input[type="password"]').count();
        
        return { signInElements, emailInputs, passwordInputs };
      });
      await this.takeScreenshot('04-auth-search');

      // Step 5: Try authentication if elements found
      const authResult = await this.executeStep('attempt_auth', 'Attempt authentication', async () => {
        const emailInput = await this.page.locator('input[type="email"]').first();
        const passwordInput = await this.page.locator('input[type="password"]').first();
        
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
          await emailInput.fill(this.config.testEmail);
          await passwordInput.fill(this.config.testPassword);
          
          // Look for submit button
          const submitButton = await this.page.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await this.page.waitForTimeout(2000);
            return { attempted: true, success: true };
          }
        }
        return { attempted: false, success: false };
      });
      await this.takeScreenshot('05-auth-attempt');

      // Step 6: Execute persona-specific task
      await this.executeStep('execute_task', 'Execute persona-specific task', async () => {
        // This is where persona-specific logic would go
        // For now, we'll do generic interaction
        const buttons = await this.page.locator('button').all();
        if (buttons.length > 0) {
          await buttons[0].click();
          await this.page.waitForTimeout(1000);
        }
        
        // Look for forms to interact with
        const inputs = await this.page.locator('input').all();
        for (const input of inputs.slice(0, 2)) {
          const type = await input.getAttribute('type');
          if (type === 'text' || type === 'search') {
            await input.fill(`Test input for ${this.persona.id}`);
          }
        }
        
        return { interactions: buttons.length + inputs.length };
      });
      await this.takeScreenshot('06-task-execution');

      // Step 7: Final page state
      await this.executeStep('final_state', 'Capture final page state', async () => {
        const title = await this.page.title();
        const url = this.page.url();
        const contentLength = (await this.page.content()).length;
        
        return { title, url, contentLength };
      });
      await this.takeScreenshot('07-final-state');

      console.log('✅ Persona execution completed successfully');

    } catch (error) {
      console.error('❌ Persona execution failed:', error);
      throw error;
    }
  }

  async executeStep(stepId, description, action) {
    console.log(`🤖 Executing: ${stepId} - ${description}`);
    
    const startTime = Date.now();
    try {
      const result = await action();
      const duration = Date.now() - startTime;
      
      this.steps.push({
        stepId,
        description,
        timestamp: new Date().toISOString(),
        success: true,
        duration,
        result
      });
      
      console.log(`✅ Step completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.steps.push({
        stepId,
        description,
        timestamp: new Date().toISOString(),
        success: false,
        duration,
        error: error.message
      });
      
      console.error(`❌ Step failed after ${duration}ms:`, error.message);
      throw error;
    }
  }

  async takeScreenshot(name) {
    const screenshotPath = path.join(this.reportsDir, `${String(this.screenshots.length + 1).padStart(2, '0')}-${name}.png`);
    
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.screenshots.push(screenshotPath);
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.warn(`⚠️ Screenshot failed for ${name}:`, error.message);
      return null;
    }
  }

  async generateReport() {
    console.log('📊 Generating product evaluation report...');
    
    const artifacts = {
      steps: this.steps,
      screenshots: this.screenshots,
      success: this.steps.every(step => step.success),
      persona: this.persona,
      config: this.config,
      timestamp: new Date().toISOString()
    };

    // Save artifacts
    await fs.writeFile(
      path.join(this.reportsDir, 'artifacts.json'),
      JSON.stringify(artifacts, null, 2)
    );

    // Generate AI evaluation
    try {
      const aiEvaluator = new AIEvaluator();
      const evaluation = await aiEvaluator.evaluateProductExperience(
        artifacts,
        this.persona,
        this.screenshots
      );

      // Save evaluation
      await fs.writeFile(
        path.join(this.reportsDir, 'evaluation.json'),
        JSON.stringify(evaluation, null, 2)
      );

      // Run visual regression if screenshots exist
      if (this.screenshots.length > 0) {
        const visualTester = new VisualRegressionTester(this.reportsDir);
        await visualTester.setup();
        const visualResults = await visualTester.compareScreenshots(this.screenshots, this.persona.id);
        await visualTester.generateVisualRegressionReport(visualResults, this.persona.id);
      }

      // Generate markdown report
      const report = this.generateMarkdownReport(evaluation);
      await fs.writeFile(
        path.join(this.reportsDir, 'ValidationReport.md'),
        report
      );

      console.log(`📄 Report generated: ${path.join(this.reportsDir, 'ValidationReport.md')}`);
      
      return evaluation;
    } catch (error) {
      console.error('❌ AI evaluation failed:', error);
      throw error;
    }
  }

  generateMarkdownReport(evaluation) {
    const screenshots = this.screenshots.map((screenshot, index) => 
      `![Step ${index + 1}](./${path.basename(screenshot)})`
    ).join('\n\n');

    const overallScore = Object.values(evaluation.rubric).reduce((sum, r) => sum + r.score, 0) / Object.keys(evaluation.rubric).length;

    return `# Product Validation Report

**Persona:** ${this.persona.id}  
**Goal:** ${this.persona.goal}  
**Task:** ${this.persona.task}  
**Generated:** ${new Date().toISOString()}

## Executive Summary

${evaluation.summary}

## Rubric Scores

| Criteria | Score | Justification |
|----------|-------|---------------|
${Object.entries(evaluation.rubric).map(([key, value]) => 
  `| ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} | ${value.score}/5 | ${value.justification} |`
).join('\n')}

## Overall Score

**${overallScore.toFixed(2)}/5**

## Verdict

**${evaluation.verdict.toUpperCase()}**

## Top Blockers

${evaluation.blockers ? evaluation.blockers.map((blocker, index) => `${index + 1}. ${blocker}`).join('\n') : 'No blockers identified'}

## Quick Wins

${evaluation.quickWins ? evaluation.quickWins.map((win, index) => `${index + 1}. ${win}`).join('\n') : 'No quick wins identified'}

## Step-by-Step Analysis

${this.steps.map((step, index) => `
### Step ${index + 1}: ${step.description}
- **Timestamp:** ${step.timestamp}
- **Duration:** ${step.duration}ms
- **Status:** ${step.success ? '✅ Success' : '❌ Failed'}
${step.result ? `- **Result:** ${JSON.stringify(step.result, null, 2)}` : ''}
${step.error ? `- **Error:** ${step.error}` : ''}
`).join('\n')}

## Screenshots

${screenshots}

## Raw Data

- [Artifacts](./artifacts.json)
- [Evaluation](./evaluation.json)
`;
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

export default TestRunner;
