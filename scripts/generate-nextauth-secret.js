#!/usr/bin/env node

/**
 * Generate a secure NEXTAUTH_SECRET for production
 */

const crypto = require('crypto');

function generateSecureSecret() {
  // Generate a 64-byte (512-bit) random secret
  const secret = crypto.randomBytes(64).toString('hex');
  return secret;
}

function generateMultipleSecrets(count = 3) {
  console.log('🔐 NEXTAUTH_SECRET Generator');
  console.log('================================');
  console.log('');
  console.log('⚠️  IMPORTANT: Your current secret is insecure!');
  console.log('   Current: your-secret-key-change-this-in-production');
  console.log('');
  console.log('✅ Here are secure secrets you can use:');
  console.log('');
  
  for (let i = 1; i <= count; i++) {
    const secret = generateSecureSecret();
    console.log(`Option ${i}:`);
    console.log(`NEXTAUTH_SECRET=${secret}`);
    console.log('');
  }
  
  console.log('📋 Instructions:');
  console.log('1. Copy one of the secrets above');
  console.log('2. Set it in your Vercel environment variables');
  console.log('3. Redeploy your application');
  console.log('');
  console.log('🔧 Vercel Dashboard Steps:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Update NEXTAUTH_SECRET with one of the secrets above');
  console.log('5. Redeploy');
}

// Generate secrets
generateMultipleSecrets();