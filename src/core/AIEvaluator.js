#!/usr/bin/env node

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

/**
 * AI-Powered Product Evaluator using OpenAI API
 * Evaluates product user experience using actual LLM
 */
export class AIEvaluator {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`❌ OPENAI_API_KEY not found in environment variables.
      
Please ensure:
1. Add OPENAI_API_KEY to your .env or .env.local file
2. Get a valid API key from: https://platform.openai.com/api-keys
3. The key should start with 'sk-proj-' or 'sk-'

Example:
OPENAI_API_KEY=sk-proj-your_actual_api_key_here

The system requires real AI evaluation and cannot fallback to simulation.`);
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async evaluateProductExperience(artifacts, persona, screenshots = []) {
    console.log('🤖 Running AI evaluation with OpenAI...');
    
    try {
      const evaluationPrompt = await this.buildEvaluationPrompt(artifacts, persona, screenshots);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: await this.getSystemPrompt()
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const evaluationText = response.choices[0].message.content;
      const evaluation = this.parseEvaluation(evaluationText);
      
      console.log('✅ AI evaluation completed');
      return evaluation;
      
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
        throw new Error(`❌ Invalid OpenAI API key.
        
Please ensure:
1. Your API key is correct and active
2. You have sufficient credits in your OpenAI account
3. The key has access to GPT-4 models

Get a valid API key from: https://platform.openai.com/api-keys

The system requires real AI evaluation and cannot fallback to simulation.`);
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw new Error(`❌ OpenAI API rate limit exceeded.
        
Please:
1. Wait a few minutes before retrying
2. Check your OpenAI usage limits
3. Consider upgrading your OpenAI plan if needed

The system requires real AI evaluation and cannot fallback to simulation.`);
      } else {
        throw new Error(`❌ AI evaluation failed: ${error.message}
        
Please ensure:
1. Your internet connection is stable
2. OpenAI API is accessible
3. Your API key has proper permissions

The system requires real AI evaluation and cannot fallback to simulation.`);
      }
    }
  }

  async getSystemPrompt() {
    const promptPath = path.join(process.cwd(), 'config', 'evaluator.prompt');
    try {
      return await fs.readFile(promptPath, 'utf8');
    } catch (error) {
      return this.getDefaultSystemPrompt();
    }
  }

  getDefaultSystemPrompt() {
    return `You are a "Product Evaluator" for user experience testing. Judge if the product helps users achieve their goals effectively.

Rubric (score 1–5; justify with 1–2 sentences + evidence links/screens):

1. Onboarding clarity
2. Task completion efficiency
3. User interface quality
4. Flow friction
5. Content clarity
6. Feature accessibility
7. Overall satisfaction

Deliverables:

* Summary (≤150 words)
* Step-by-step notes with timestamps and screenshot refs
* Top 5 blockers (ranked)
* Top 5 quick wins (ranked)
* Verdict: {ship | fix then ship | rethink}`;
  }

  async buildEvaluationPrompt(artifacts, persona, screenshots) {
    const steps = artifacts.steps || [];
    const success = artifacts.success || false;
    
    let prompt = `# Product Validation Evaluation Request

## Persona Context
- **ID**: ${persona.id}
- **Goal**: ${persona.goal}
- **Task**: ${persona.task}

## Execution Summary
- **Success**: ${success ? 'Yes' : 'No'}
- **Total Steps**: ${steps.length}
- **Screenshots**: ${screenshots.length}
- **Product URL**: ${artifacts.config?.productUrl || 'Not specified'}

## Step-by-Step Execution Log
`;

    steps.forEach((step, index) => {
      prompt += `${index + 1}. **${step.timestamp}** - ${step.stepId}: ${step.success ? '✅' : '❌'}\n`;
      if (step.result) {
        prompt += `   Result: ${JSON.stringify(step.result)}\n`;
      }
      if (step.error) {
        prompt += `   Error: ${step.error}\n`;
      }
      prompt += '\n';
    });

    if (screenshots.length > 0) {
      prompt += `## Screenshots Available\n`;
      screenshots.forEach((screenshot, index) => {
        prompt += `${index + 1}. ${path.basename(screenshot)}\n`;
      });
      prompt += '\n';
    }

    prompt += `## Evaluation Request

Please evaluate this product user experience test run and provide:

1. **Summary** (≤150 words): Overall assessment of the user journey
2. **Rubric Scores** (1-5 scale with justification):
   - Onboarding clarity
   - Task completion efficiency  
   - User interface quality
   - Flow friction
   - Content clarity
   - Feature accessibility
   - Overall satisfaction
3. **Top 5 Blockers** (ranked by severity)
4. **Top 5 Quick Wins** (ranked by impact)
5. **Verdict**: ship | fix then ship | rethink

Format your response as JSON with the following structure:
{
  "summary": "Your summary here",
  "rubric": {
    "onboarding_clarity": {"score": 4, "justification": "Clear navigation and sign-in process"},
    "task_completion_efficiency": {"score": 3, "justification": "Good workflow but could be more streamlined"},
    "user_interface_quality": {"score": 4, "justification": "Modern design with good usability"},
    "flow_friction": {"score": 4, "justification": "Minimal clicks, smooth progression"},
    "content_clarity": {"score": 3, "justification": "Mostly clear but some ambiguous labels"},
    "feature_accessibility": {"score": 4, "justification": "Features are easily discoverable"},
    "overall_satisfaction": {"score": 4, "justification": "High confidence in user satisfaction"}
  },
  "blockers": [
    "Email validation could be more robust",
    "Navigation could be clearer",
    "Error handling needs improvement",
    "Mobile responsiveness issues",
    "Loading states unclear"
  ],
  "quick_wins": [
    "Add progress indicators", 
    "Improve button labeling",
    "Add tooltips for complex features",
    "Implement auto-save functionality",
    "Add keyboard shortcuts"
  ],
  "verdict": "fix then ship"
}`;

    return prompt;
  }

  parseEvaluation(evaluationText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error(`❌ Could not parse JSON from AI response. 
      
The AI evaluation returned an invalid response format. Please check:
1. The OpenAI API key is valid and has sufficient credits
2. The API endpoint is accessible
3. The model 'gpt-4-turbo-preview' is available

The system requires real AI evaluation and cannot fallback to simulation.`);
    } catch (error) {
      if (error.message.includes('Could not parse JSON')) {
        throw error; // Re-throw our custom error
      }
      
      throw new Error(`❌ Error parsing AI evaluation: ${error.message}
      
Please ensure:
1. The AI response format is valid
2. The OpenAI API is returning proper JSON
3. Your API key has sufficient credits

The system requires real AI evaluation and cannot fallback to simulation.`);
    }
  }

  async generateVisualAnalysis(screenshots) {
    if (screenshots.length === 0) {
      throw new Error(`❌ No screenshots available for visual analysis.
      
Please ensure:
1. Screenshots are being captured during test execution
2. Screenshot paths are valid and accessible
3. The test run completed successfully

The system requires real visual analysis and cannot fallback to simulation.`);
    }

    try {
      const prompt = `Analyze these product UI screenshots and provide insights on:

1. Visual design quality and consistency
2. User interface clarity and intuitiveness  
3. Navigation flow and information architecture
4. Accessibility and usability concerns
5. Mobile responsiveness (if applicable)
6. Brand consistency and professional appearance

Screenshots: ${screenshots.map(s => path.basename(s)).join(', ')}

Provide a concise analysis focusing on the most important visual and UX issues.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...await Promise.all(screenshots.map(async screenshot => ({
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${await this.encodeImage(screenshot)}`
                }
              })))
            ]
          }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
        throw new Error(`❌ Invalid OpenAI API key for visual analysis.
        
Please ensure:
1. Your API key is correct and active
2. You have sufficient credits in your OpenAI account
3. The key has access to GPT-4 Vision models

Get a valid API key from: https://platform.openai.com/api-keys

The system requires real visual analysis and cannot fallback to simulation.`);
      } else {
        throw new Error(`❌ Visual analysis failed: ${error.message}
        
Please ensure:
1. Your internet connection is stable
2. OpenAI API is accessible
3. Your API key has access to GPT-4 Vision models

The system requires real visual analysis and cannot fallback to simulation.`);
      }
    }
  }

  async encodeImage(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      console.error(`Error encoding image ${imagePath}:`, error);
      return null;
    }
  }
}

export default AIEvaluator;
