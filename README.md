# ValidateMe 🚀

**AI-powered product validation framework with persona-based testing and visual regression analysis**

ValidateMe is a comprehensive testing framework that uses AI to evaluate product experiences through the lens of different user personas. It combines browser automation, AI evaluation, and visual regression testing to provide actionable insights about your product's user experience.

## ✨ Features

- **🎭 Persona-Based Testing** - Test your product through different user types and goals
- **🤖 AI-Powered Evaluation** - GPT-4 powered analysis with 7-point rubric scoring
- **📸 Visual Regression Testing** - Pixel-perfect comparison across test runs
- **🔄 CI/CD Integration** - GitHub Actions workflow for automated testing
- **📊 Comprehensive Reporting** - Detailed markdown reports with evidence and recommendations
- **⚡ Easy Setup** - Simple configuration and one-command execution

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/knaig/ValidateMe.git
cd ValidateMe

# Install dependencies
npm install

# Install Playwright browsers
npm run install
```

### 2. Configuration

Create a `.env` file with your settings:

```env
# Your product URL
PRODUCT_URL=https://your-product.com

# Test credentials (if needed)
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123

# OpenAI API key for AI evaluation
OPENAI_API_KEY=sk-proj-your-api-key-here

# Optional: Run in headed mode
HEADFUL=0
```

### 3. Define Your Personas

Create `config/personas.yaml`:

```yaml
personas:
  - id: power-user
    goal: "Complete complex workflow efficiently"
    task: "Set up advanced configuration and export results"
    
  - id: first-time-user
    goal: "Get started quickly with minimal friction"
    task: "Sign up and complete onboarding flow"
    
  - id: mobile-user
    goal: "Use product on mobile device"
    task: "Access key features via mobile interface"
```

### 4. Run Validation

```bash
# Single persona test
npm run run -- --persona=power-user

# All personas
npm run run:all

# Visual regression test
npm run visual-regression
```

## 📁 Project Structure

```
ValidateMe/
├── src/
│   ├── core/
│   │   ├── TestRunner.js          # Main test orchestration
│   │   ├── AIEvaluator.js         # OpenAI-powered evaluation
│   │   └── VisualRegression.js    # Pixel-perfect comparison
│   ├── browser/
│   │   └── PlaywrightClient.js    # Browser automation
│   └── runner.mjs                 # CLI entry point
├── config/
│   ├── personas.yaml              # User persona definitions
│   ├── evaluator.prompt           # AI evaluation criteria
│   └── playwright.config.js       # Browser configuration
├── scripts/
│   ├── verify-setup.mjs           # Setup verification
│   ├── scenario-generator.mjs     # Multi-persona runner
│   └── visual-regression-runner.mjs
├── reports/                       # Generated test reports
└── .github/workflows/             # CI/CD workflows
```

## 🎯 How It Works

### 1. **Persona-Driven Testing**
Define different user types with specific goals and tasks. The framework tests your product through each persona's lens.

### 2. **AI-Powered Evaluation**
GPT-4 analyzes the user journey and scores it on a 7-point rubric:
- Onboarding clarity
- Task completion efficiency
- User interface quality
- Flow friction
- Content clarity
- Feature accessibility
- Overall satisfaction

### 3. **Visual Regression Detection**
Compare screenshots across test runs to detect unintended UI changes.

### 4. **Actionable Insights**
Get specific recommendations for improvements with evidence-based scoring.

## 📊 Sample Report

```markdown
# Product Validation Report

**Persona:** power-user  
**Goal:** Complete complex workflow efficiently  
**Overall Score:** 4.2/5

## Rubric Scores
| Criteria | Score | Justification |
|----------|-------|---------------|
| Onboarding Clarity | 4/5 | Clear navigation but could use better first-time guidance |
| Task Completion | 5/5 | Excellent workflow efficiency and completion rates |

## Top Blockers
1. Advanced settings are hard to find
2. Export options could be more flexible

## Quick Wins
1. Add keyboard shortcuts for power users
2. Improve progress indicators
```

## 🔧 Advanced Configuration

### Custom Evaluation Criteria

Edit `config/evaluator.prompt` to customize the AI evaluation rubric:

```prompt
You are a "Product Evaluator" for [YOUR_PRODUCT_NAME]. 
Judge if the product helps users achieve their goals effectively.

Rubric (score 1–5):
1. Onboarding clarity
2. Task completion efficiency
3. User interface quality
4. Flow friction
5. Content clarity
6. Feature accessibility
7. Overall satisfaction
```

### Browser Configuration

Modify `config/playwright.config.js`:

```javascript
export default {
  use: {
    baseURL: process.env.PRODUCT_URL,
    headless: process.env.HEADFUL !== '1',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  }
};
```

## 🔄 CI/CD Integration

The framework includes a complete GitHub Actions workflow:

```yaml
# .github/workflows/validate.yml
name: Product Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run install
      - run: npm run run:all
      - uses: actions/upload-artifact@v3
        with:
          name: validation-reports
          path: reports/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/) for browser automation
- Powered by [OpenAI GPT-4](https://openai.com/) for AI evaluation
- Uses [Pixelmatch](https://github.com/mapbox/pixelmatch) for visual regression testing

## 📞 Support

- 📖 [Documentation](https://github.com/knaig/ValidateMe/wiki)
- 🐛 [Report Issues](https://github.com/knaig/ValidateMe/issues)
- 💬 [Discussions](https://github.com/knaig/ValidateMe/discussions)

---

**ValidateMe** - Because great products deserve great validation! 🚀
