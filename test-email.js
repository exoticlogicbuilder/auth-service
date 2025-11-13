#!/usr/bin/env node

/**
 * Simple test script to demonstrate SendGrid SMTP email functionality
 * Run this script to test if your email configuration is working correctly
 */

import dotenv from 'dotenv';
import { emailService } from './dist/services/email.service.js';
import { validateEmailConfig } from './dist/utils/email-config.js';

// Load environment variables
dotenv.config();

async function testEmailConfiguration() {
  console.log('🔧 Testing Email Configuration...\n');
  
  // Validate configuration
  const validation = validateEmailConfig();
  
  console.log('Configuration Validation:');
  console.log('✅ Valid:', validation.isValid);
  
  if (validation.missingFields.length > 0) {
    console.log('❌ Missing Fields:', validation.missingFields.join(', '));
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }
  
  if (!validation.isValid) {
    console.log('\n❌ Email configuration is invalid. Please fix the missing fields and try again.');
    process.exit(1);
  }
  
  console.log('\n🔌 Testing SMTP Connection...');
  
  try {
    const connectionTest = await emailService.testConnection();
    if (connectionTest) {
      console.log('✅ SMTP connection successful!');
    } else {
      console.log('❌ SMTP connection failed!');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ SMTP connection error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function sendTestEmail() {
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  console.log(`\n📧 Sending test verification email to: ${testEmail}`);
  
  try {
    const testToken = 'test-verification-' + Date.now();
    await emailService.sendVerificationEmail(testEmail, testToken);
    console.log('✅ Test email sent successfully!');
    console.log(`📝 Test token: ${testToken}`);
  } catch (error) {
    console.log('❌ Failed to send test email:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 SendGrid SMTP Email Service Test\n');
  
  await testEmailConfiguration();
  
  // Only send test email if TEST_EMAIL is provided
  if (process.env.TEST_EMAIL) {
    await sendTestEmail();
  } else {
    console.log('\n💡 To send a test email, set the TEST_EMAIL environment variable:');
    console.log('   TEST_EMAIL=your-email@example.com npm run test-email');
  }
  
  console.log('\n✨ All tests completed successfully!');
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});