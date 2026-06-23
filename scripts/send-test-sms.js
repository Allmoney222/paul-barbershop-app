#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load .env.local into process.env (simple parser)
const envFile = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}

const to = process.argv[2];
if (!to) {
  console.error('Usage: node scripts/send-test-sms.js <to-phone-number>');
  process.exit(1);
}

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('Twilio credentials not found in .env.local');
  process.exit(1);
}

const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

(async () => {
  try {
    const res = await client.messages.create({
      body: 'Test SMS from 2Gether Hair Studio (Twilio)',
      from: TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('Message sent, sid=', res.sid);
    process.exit(0);
  } catch (err) {
    console.error('Failed to send SMS:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
