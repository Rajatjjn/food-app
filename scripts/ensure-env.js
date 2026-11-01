const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'tiffin-finder-secure-jwt-secret-key-min-32-chars-long';
}

if (!process.env.NEXT_PUBLIC_DEFAULT_CITY) {
  process.env.NEXT_PUBLIC_DEFAULT_CITY = 'Surat';
}

if (!process.env.NEXT_PUBLIC_APP_TIMEZONE) {
  process.env.NEXT_PUBLIC_APP_TIMEZONE = 'Asia/Kolkata';
}

// Write .env if not exists so Prisma CLI can read it during cloud builds
if (!fs.existsSync(envPath)) {
  const content = [
    `DATABASE_URL="${process.env.DATABASE_URL}"`,
    `JWT_SECRET="${process.env.JWT_SECRET}"`,
    `NEXT_PUBLIC_APP_NAME="Tiffin Finder"`,
    `NEXT_PUBLIC_DEFAULT_CITY="${process.env.NEXT_PUBLIC_DEFAULT_CITY}"`,
    `NEXT_PUBLIC_APP_TIMEZONE="${process.env.NEXT_PUBLIC_APP_TIMEZONE}"`,
  ].join('\n');

  try {
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('[ensure-env] Created temporary .env for build execution.');
  } catch (err) {
    console.warn('[ensure-env] Could not write .env file, continuing with process.env:', err.message);
  }
} else {
  console.log('[ensure-env] Existing .env found.');
}
