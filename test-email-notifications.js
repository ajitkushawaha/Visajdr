// Test script to verify KYC and Agent status email notifications
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Agent = require('../models/Agent');

async function testEmailNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a test agent
    const testAgent = await Agent.findOne({}).lean();
    
    if (!testAgent) {
      console.log('No agents found in database. Please create an agent first.');
      return;
    }

    console.log(`Found test agent: ${testAgent.personalDetails.fullName}`);
    console.log(`Current KYC Status: ${testAgent.kycStatus}`);
    console.log(`Current Agent Status: ${testAgent.status}`);
    console.log(`Email: ${testAgent.personalDetails.email}`);

    // Test the email service
    const { emailService } = require('../lib/emailService');
    
    console.log('\n=== Testing KYC Status Update Email ===');
    const kycEmailSent = await emailService.sendKycStatusUpdate(
      testAgent.personalDetails.email,
      testAgent.personalDetails.fullName,
      'verified',
      testAgent.kycStatus
    );
    console.log(`KYC Email sent: ${kycEmailSent}`);

    console.log('\n=== Testing Agent Status Update Email ===');
    const agentEmailSent = await emailService.sendAgentStatusUpdate(
      testAgent.personalDetails.email,
      testAgent.personalDetails.fullName,
      'approved',
      testAgent.status
    );
    console.log(`Agent Email sent: ${agentEmailSent}`);

    console.log('\n✅ Email notification tests completed!');
    console.log('Check the agent\'s email inbox for the test emails.');

  } catch (error) {
    console.error('Error testing email notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testEmailNotifications();
