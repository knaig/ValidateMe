# ValidateMe Quick Start ⚡

Get ValidateMe running in **5 minutes** for any project.

## 🚀 5-Minute Setup

```bash
# 1. Clone and install
git clone https://github.com/knaig/ValidateMe.git
cd ValidateMe
npm install && npm run install

# 2. Configure
cp .env.example .env
# Edit .env with your settings:
# PRODUCT_URL=https://your-app.com
# OPENAI_API_KEY=sk-proj-your-key

# 3. Verify
npm run verify

# 4. Test
npm run run -- --persona=first-time-user
```

## 📝 Essential Configuration

### `.env` file
```env
PRODUCT_URL=https://your-product.com
OPENAI_API_KEY=sk-proj-your-api-key-here
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
```

### `config/personas.yaml` - Define your users
```yaml
personas:
  - id: new-user
    goal: "Get started quickly"
    task: "Sign up and complete first task"
    
  - id: power-user
    goal: "Use advanced features"
    task: "Access settings and complex workflows"
```

### `config/evaluator.prompt` - Customize evaluation
```prompt
You are evaluating a [YOUR_PRODUCT_TYPE] application.
Focus on: [Your specific UX concerns]
Rubric: [Your success metrics]
```

## 🎯 Common Commands

```bash
# Single persona test
npm run run -- --persona=new-user

# All personas
npm run run:all

# Visual regression
npm run visual-regression

# Verify setup
npm run verify

# See browser (headed mode)
HEADFUL=1 npm run run
```

## 📊 Understanding Results

- **Reports**: `reports/[timestamp]-[persona]/ValidationReport.md`
- **Scores**: 1-5 scale (5 = excellent)
- **Verdict**: SHIP | FIX THEN SHIP | RETHINK
- **Blockers**: Issues preventing user success
- **Quick Wins**: Easy improvements

## 🔧 Project Examples

### E-commerce
```yaml
personas:
  - id: shopper
    goal: "Find and buy products"
    task: "Browse, add to cart, checkout"
```

### SaaS Dashboard
```yaml
personas:
  - id: admin
    goal: "Manage team and settings"
    task: "Create team, invite users, configure"
```

### Mobile App
```yaml
personas:
  - id: mobile-user
    goal: "Use app on mobile"
    task: "Download, sign up, complete tasks"
```

## 🚨 Troubleshooting

**API Key Issues:**
- Get key from https://platform.openai.com/api-keys
- Ensure key starts with `sk-proj-` or `sk-`
- Check you have OpenAI credits

**URL Issues:**
- Ensure URL is accessible
- Test in browser first
- Check for authentication requirements

**Browser Issues:**
- Run `npm run install` to install Playwright
- Try `HEADFUL=1` to see browser
- Check Node.js version (18+)

## 📈 Next Steps

1. **Run baseline test** → `npm run run:all`
2. **Review reports** → Check `reports/` folder
3. **Customize personas** → Edit `config/personas.yaml`
4. **Set up CI/CD** → Copy `.github/workflows/validate.yml`
5. **Iterate** → Fix blockers, test again

---

**Full Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)  
**Repository**: https://github.com/knaig/ValidateMe
