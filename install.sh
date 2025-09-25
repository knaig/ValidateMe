#!/bin/bash

# ValidateMe Installation Script
# Installs ValidateMe globally for easy use across projects

set -e

echo "🚀 Installing ValidateMe - AI Product Validation Framework"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install ValidateMe globally
echo ""
echo "📦 Installing ValidateMe..."
npm install -g @knaig/validate-me

# Install Playwright browsers
echo ""
echo "🎭 Installing Playwright browsers..."
npx playwright install

echo ""
echo "🎉 ValidateMe installed successfully!"
echo ""
echo "📝 Quick start:"
echo "   1. Create a new directory for your project"
echo "   2. Run: validate-me init"
echo "   3. Edit .env file with your product URL and OpenAI API key"
echo "   4. Run: validate-me test --persona=first-time-user"
echo ""
echo "📚 Documentation: https://github.com/knaig/ValidateMe"
echo "🐛 Issues: https://github.com/knaig/ValidateMe/issues"
echo ""
echo "Happy validating! 🚀"
