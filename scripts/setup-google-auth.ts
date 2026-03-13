import { google } from 'googleapis';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const REDIRECT_URI = 'http://localhost:3847/callback';
const PORT = 3847;

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
];

const TOKEN_PATH = path.resolve(__dirname, '../config/google-oauth-token.json');
const ENV_LOCAL_PATH = path.resolve(__dirname, '../.env.local');

function isTokenValid(token: Record<string, unknown>): boolean {
  if (!token.access_token) return false;
  if (!token.expiry_date) return true; // No expiry — assume valid (refresh_token present)
  const expiresAt = token.expiry_date as number;
  return Date.now() < expiresAt - 60_000; // 1 min buffer
}

function appendEnvVars(): void {
  const envVars = `
# Google OAuth (added by setup-google-auth.ts)
GOOGLE_CLIENT_ID=${CLIENT_ID}
GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}
GSC_TOKEN_PATH=./config/google-oauth-token.json
GA4_TOKEN_PATH=./config/google-oauth-token.json
`;
  const existing = fs.existsSync(ENV_LOCAL_PATH) ? fs.readFileSync(ENV_LOCAL_PATH, 'utf-8') : '';
  if (!existing.includes('GSC_TOKEN_PATH')) {
    fs.appendFileSync(ENV_LOCAL_PATH, envVars);
    console.log('✓ Appended Google OAuth env vars to .env.local');
  } else {
    console.log('ℹ  .env.local already contains GSC_TOKEN_PATH — skipping append');
  }
}

async function main(): Promise<void> {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Check for existing valid token
  if (fs.existsSync(TOKEN_PATH)) {
    const raw = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const token = JSON.parse(raw) as Record<string, unknown>;

    if (isTokenValid(token)) {
      console.log('✓ Valid token already exists at:', TOKEN_PATH);
      appendEnvVars();
      return;
    }

    // Try to refresh if we have a refresh_token
    if (token.refresh_token) {
      console.log('Token expired — attempting refresh...');
      oauth2Client.setCredentials(token);
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
        console.log('✓ Token refreshed and saved to:', TOKEN_PATH);
        appendEnvVars();
        return;
      } catch (err) {
        console.warn('Refresh failed, re-authorizing...', err);
      }
    }
  }

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to always get refresh_token
  });

  console.log('\n========================================');
  console.log('AUTHORIZATION REQUIRED');
  console.log('========================================');
  console.log('\nOpen this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n----------------------------------------');
  console.log(`Waiting for callback on http://localhost:${PORT}/callback ...`);
  console.log('(The server will shut down automatically after authorization)\n');

  // NOTE: Make sure the following redirect URI is added in Google Cloud Console:
  //   http://localhost:3847/callback
  // Project: gen-lang-client-0400236876
  // OAuth 2.0 Client: 838397185575-19ipos0v9sblt1p9d8gloeobmgpsfrtv

  // Start local HTTP server to receive callback
  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const parsedUrl = url.parse(req.url, true);
      const code = parsedUrl.query.code as string | undefined;
      const error = parsedUrl.query.error as string | undefined;

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>No code received</h1>');
        server.close();
        reject(new Error('No authorization code in callback'));
        return;
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Ensure config dir exists
        fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>Authorization successful!</h1>
          <p>Token saved to <code>${TOKEN_PATH}</code></p>
          <p>You can close this tab.</p>
        `);

        console.log('✓ Token received and saved to:', TOKEN_PATH);
        appendEnvVars();

        server.close();
        resolve();
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Token exchange failed</h1><pre>${err}</pre>`);
        server.close();
        reject(err);
      }
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      reject(err);
    });

    server.listen(PORT);
  });
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
