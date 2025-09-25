# ValidateMe Setup Guide 🚀

Complete step-by-step guide to set up ValidateMe for your new project.

## 📋 Prerequisites

- **Node.js 18+** installed
- **Git** installed
- **OpenAI API key** (get from https://platform.openai.com/api-keys)
- **Your product URL** (local, staging, or production)

## 🚀 Quick Start (5 minutes)

### Step 1: Install ValidateMe

```bash
# Clone the repository
git clone https://github.com/knaig/ValidateMe.git
cd ValidateMe

# Install dependencies
npm install

# Install Playwright browsers
npm run install
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required settings in `.env`:**
```env
# Your product URL (required)
PRODUCT_URL=https://your-product.com

# OpenAI API key (required)
OPENAI_API_KEY=sk-proj-your-actual-api-key-here

# Test credentials (if your product requires login)
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
```

### Step 3: Verify Setup

```bash
# Check if everything is configured correctly
npm run verify
```

### Step 4: Run Your First Test

```bash
# Test with a single persona
npm run run -- --persona=first-time-user

# Or test all personas
npm run run:all
```

## 🔧 Detailed Configuration

### Step 1: Customize Personas

Edit `config/personas.yaml` to match your product's user types:

```yaml
personas:
  - id: new-user
    goal: "Get started quickly and understand the product"
    task: "Sign up, complete onboarding, and perform first basic task"
    
  - id: power-user
    goal: "Use advanced features efficiently"
    task: "Access advanced settings, use complex workflows, export data"
    
  - id: mobile-user
    goal: "Use product effectively on mobile"
    task: "Access key features via mobile interface"
    
  - id: enterprise-admin
    goal: "Manage team and organizational settings"
    task: "Set up team accounts, configure permissions, manage users"
```

### Step 2: Customize Evaluation Criteria

Edit `config/evaluator.prompt` for your specific product needs:

```prompt
You are evaluating a [YOUR_PRODUCT_TYPE] application (e.g., "project management", "e-commerce", "CRM").

Focus on:
- How well the product helps users achieve their specific goals
- The clarity of the user interface for your domain
- Efficiency of common workflows in your industry
- Accessibility for your target audience

Rubric (score 1–5):
1. Onboarding clarity - How easy is it for new users to get started?
2. Task completion efficiency - How quickly can users accomplish their goals?
3. User interface quality - Is the design intuitive for your domain?
4. Flow friction - Are there unnecessary steps or confusion?
5. Content clarity - Are labels and instructions clear?
6. Feature accessibility - Can users easily find what they need?
7. Overall satisfaction - Would users recommend this product?

[Add your specific evaluation criteria here]
```

### Step 3: Configure Browser Settings

Edit `config/playwright.config.js` if needed:

```javascript
export default defineConfig({
  use: {
    baseURL: process.env.PRODUCT_URL,
    headless: process.env.HEADFUL !== '1',
    // Add custom browser settings
    viewport: { width: 1280, height: 720 },
    // Add authentication state if needed
    // storageState: 'auth.json'
  }
});
```

## 🎯 Project-Specific Setup Examples

### Example 1: E-commerce Site

**Personas:**
```yaml
personas:
  - id: first-time-buyer
    goal: "Find and purchase a product quickly"
    task: "Browse products, add to cart, complete checkout"
    
  - id: returning-customer
    goal: "Re-order previous purchases efficiently"
    task: "Log in, find order history, re-order items"
    
  - id: mobile-shopper
    goal: "Shop on mobile device"
    task: "Browse, filter, and purchase on mobile"
```

**Environment:**
```env
PRODUCT_URL=https://your-store.com
TEST_EMAIL=test@yourstore.com
TEST_PASSWORD=testpass123
```

### Example 2: SaaS Dashboard

**Personas:**
```yaml
personas:
  - id: team-lead
    goal: "Set up team and manage projects"
    task: "Create team, invite members, set up first project"
    
  - id: team-member
    goal: "Complete assigned tasks efficiently"
    task: "Log in, view tasks, update progress, collaborate"
    
  - id: admin
    goal: "Manage organization settings"
    task: "Configure billing, manage users, set permissions"
```

### Example 3: Mobile-First App

**Personas:**
```yaml
personas:
  - id: mobile-user
    goal: "Use app effectively on mobile"
    task: "Download, sign up, complete core mobile workflows"
    
  - id: tablet-user
    goal: "Use app on tablet device"
    task: "Access via tablet, use touch interface, complete tasks"
```

## 🔍 Advanced Configuration

### Custom Test Steps

You can customize the test execution by modifying `src/core/TestRunner.js`:

```javascript
async executePersona() {
  // Add your custom test steps here
  await this.executeStep('custom_step', 'Your custom test', async () => {
    // Your custom automation logic
    await this.page.click('[data-testid="your-button"]');
    await this.page.fill('[data-testid="your-input"]', 'test value');
  });
}
```

### Custom Evaluation Prompts

Create persona-specific evaluation prompts:

```javascript
async buildEvaluationPrompt(artifacts, persona, screenshots) {
  let prompt = `# Evaluation for ${persona.id}
  
  This persona represents: ${persona.goal}
  Focus on: ${persona.task}
  
  [Your custom evaluation logic here]
  `;
  
  return prompt;
}
```

### Visual Regression Thresholds

Adjust sensitivity in `src/core/VisualRegression.js`:

```javascript
const diffPercentage = (diffPixels / (width * height)) * 100;
const passed = diffPercentage < 3; // More sensitive (3% vs 5%)
```

## 🚀 Running Tests

### Single Persona Test
```bash
npm run run -- --persona=new-user
```

### All Personas
```bash
npm run run:all
```

### Visual Regression Only
```bash
npm run visual-regression
```

### Headed Mode (see browser)
```bash
HEADFUL=1 npm run run -- --persona=first-time-user
```

### Specific Environment
```bash
PRODUCT_URL=https://staging.yourapp.com npm run run -- --persona=power-user
```

## 📊 Understanding Results

### Report Structure
```
reports/
├── 2025-01-15T10-30-45-new-user/
│   ├── ValidationReport.md      # Main report
│   ├── artifacts.json          # Raw test data
│   ├── evaluation.json         # AI evaluation
│   ├── 01-navigate.png         # Screenshots
│   ├── 02-page-loaded.png
│   └── visual-regression-report.md
```

### Score Interpretation
- **5/5**: Excellent - Ready to ship
- **4/5**: Good - Minor improvements needed
- **3/5**: Fair - Some issues to address
- **2/5**: Poor - Significant problems
- **1/5**: Critical - Major issues

### Verdict Meanings
- **SHIP**: Product is ready for users
- **FIX THEN SHIP**: Address blockers first
- **RETHINK**: Major UX overhaul needed

## 🔄 CI/CD Integration

### GitHub Actions Setup

1. **Add secrets to your repository:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SLACK_WEBHOOK_URL`: (Optional) Slack notifications

2. **Copy the workflow:**
```bash
cp .github/workflows/validate.yml .github/workflows/
```

3. **Customize the workflow:**
```yaml
# Update environment URLs
echo "PRODUCT_URL=https://staging.yourapp.com" >> $GITHUB_ENV

# Update persona matrix
strategy:
  matrix:
    persona: ['your-persona-1', 'your-persona-2']
```

### Manual Triggers
```bash
# Trigger via GitHub UI or CLI
gh workflow run validate.yml -f environment=production -f persona=power-user
```

## 🐛 Troubleshooting

### Common Issues

**1. OpenAI API Key Invalid**
```bash
❌ Invalid OpenAI API key
```
**Solution:** Check your API key format and credits

**2. Product URL Not Accessible**
```bash
❌ Product URL: Not accessible
```
**Solution:** Ensure URL is correct and accessible

**3. Playwright Browsers Not Installed**
```bash
⚠️ Playwright browsers: Not installed
```
**Solution:** Run `npm run install`

**4. Screenshot Failures**
```bash
⚠️ Screenshot failed
```
**Solution:** Check disk space and permissions

### Debug Mode

Run with verbose logging:
```bash
DEBUG=* npm run run -- --persona=first-time-user
```

### Manual Browser Testing

Test browser automation manually:
```bash
HEADFUL=1 npm run run -- --persona=first-time-user
```

## 📚 Next Steps

1. **Run initial validation** to establish baseline
2. **Review reports** and identify key issues
3. **Iterate on personas** based on your actual users
4. **Set up CI/CD** for automated testing
5. **Monitor trends** over time to track improvements

## 🤝 Support

- 📖 **Documentation**: [README.md](README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/knaig/ValidateMe/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/knaig/ValidateMe/discussions)

---

**Happy Validating!** 🚀
