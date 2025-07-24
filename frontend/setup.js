#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🍷 PourUp Frontend Setup');
console.log('========================\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    // Create basic .env file
    const defaultEnv = `# React Frontend Environment Configuration
REACT_APP_API_URL=http://localhost:3000/api
NODE_ENV=development
REACT_APP_NAME=PourUp Frontend
REACT_APP_VERSION=1.0.0
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Created default .env file');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    console.error('Please run: npm install');
    process.exit(1);
  }
} else {
  console.log('ℹ️  Dependencies already installed');
}

// Create public assets if needed
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

// Check for favicon
const faviconPath = path.join(publicPath, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('ℹ️  Add a favicon.ico to the public folder for better branding');
}

// Verify backend connection
console.log('\n🔗 Checking backend connection...');
const backendUrl = process.env.REACT_APP_API_URL || 'https://6930b3a2fd27.ngrok-free.app/api';

try {
  const { execSync } = require('child_process');
  execSync(`curl -s ${backendUrl}/health`, { timeout: 5000 });
  console.log('✅ Backend API is accessible');
} catch (error) {
  console.log('⚠️  Backend API not accessible');
  console.log(`   Make sure the backend is running at: ${backendUrl}`);
  console.log('   Run: npm run setup && npm run dev (in backend directory)');
}

console.log('\n🎉 Frontend setup completed!\n');

console.log('📋 Next Steps:');
console.log('1. Start the frontend: npm start');
console.log('2. Open browser: http://localhost:3001');
console.log('3. Login with default credentials:');
console.log('   - Super Admin: admin@pourup.com / admin123');
console.log('   - Winery Admin: winery@pourup.com / winery123');

console.log('\n🔧 Available Commands:');
console.log('  npm start          Start development server');
console.log('  npm run build      Build for production');
console.log('  npm test           Run tests');
console.log('  npm run lint       Run linting');

console.log('\n📖 Documentation:');
console.log('  - Frontend README: ./README.md');
console.log('  - Backend API: ../API_DOCUMENTATION.md');
console.log('  - Postman Collection: ../POSTMAN_GUIDE.md');

console.log('\n🌐 Public Pages (no login required):');
console.log('  - Businesses: http://localhost:3001/businesses');
console.log('  - Outlets: http://localhost:3001/outlets');
console.log('  - Experiences: http://localhost:3001/experiences');

console.log('\n🔐 Login Page:');
console.log('  - Login: http://localhost:3001/login');

console.log('\nHappy coding! 🚀'); 