const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist');

const requiredPublicVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missing = requiredPublicVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required Vercel environment variables: ${missing.join(', ')}`);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of ['index.html', 'css', 'js', 'Pngss', 'manifest.json', 'sw.js']) {
  fs.cpSync(path.join(rootDir, entry), path.join(outDir, entry), { recursive: true });
}

const publicConfig = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

fs.writeFileSync(
  path.join(outDir, 'js', 'env.js'),
  `window.HELP_VITALL_ENV = ${JSON.stringify(publicConfig)};\n`,
  'utf8'
);

console.log('Build completed in dist/.');
