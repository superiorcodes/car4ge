# Authentication Guide

Comprehensive guide to authenticating with the CAR4GE API.

## Authentication Methods

CAR4GE supports the following authentication methods:

1. **API Key Authentication** (for server-to-server)
2. **OAuth 2.0** (for user-delegated access)
3. **Session Cookies** (for web browsers)

---

## API Key Authentication

The recommended method for application-to-application integration.

### Generating an API Key

1. **Log in** to your CAR4GE dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **"Generate New API Key"**
4. Enter a descriptive name (e.g., "Production API Client")
5. Select permissions:
   - **read** - View vehicles, maintenance, garages
   - **write** - Create and update records
   - **delete** - Remove records
6. Click **"Generate"**
7. **Copy and save** your key immediately (you won't see it again)

### Using API Keys

Include your API key in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer sk_live_abc123xyz789
```

### cURL Example

```bash
curl -X GET https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### JavaScript Example

```javascript
const apiKey = process.env.CAR4GE_API_KEY;

const response = await fetch('https://api.car4ge.com/v1/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### Python Example

```python
import requests

api_key = os.getenv('CAR4GE_API_KEY')

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.car4ge.com/v1/vehicles',
    headers=headers
)

data = response.json()
```

### Node.js SDK Example

```javascript
const { CarGage } = require('car4ge');

const client = new CarGage(process.env.CAR4GE_API_KEY);

// Use the client
const vehicles = await client.vehicles.list();
```

---

## API Key Security Best Practices

### 1. Environment Variables

Never hardcode API keys. Use environment variables:

```javascript
// ✅ Good
const apiKey = process.env.CAR4GE_API_KEY;

// ❌ Bad
const apiKey = 'sk_live_abc123xyz789';
```

### 2. .env Files

Create a `.env` file (don't commit to git):

```
CAR4GE_API_KEY=sk_live_abc123xyz789
```

In your `.gitignore`:
```
.env
.env.local
*.key
```

### 3. Key Rotation

Rotate API keys regularly:

1. Generate a new API key
2. Update your applications
3. Delete the old key in the dashboard

### 4. Minimal Permissions

Grant only necessary permissions:

- Use `read` for read-only integrations
- Don't grant `delete` unless necessary
- Create separate keys for different services

### 5. Monitoring

Monitor your API key usage:

1. Go to **Settings** → **API Keys**
2. Click on a key to view:
   - Last used
   - Request count
   - IP addresses
3. Delete unused keys

### 6. Revocation

If a key is compromised:

1. Go to **Settings** → **API Keys**
2. Click the trash icon next to the key
3. Click **"Confirm Delete"**
4. Generate a new key

---

## OAuth 2.0 Authentication

For user-delegated access (when building third-party applications).

### OAuth 2.0 Flow

1. **User initiates login** in your app
2. **Redirect to CAR4GE** authorization endpoint
3. **User authorizes** your app
4. **Redirect back** with authorization code
5. **Exchange code** for access token
6. **Use access token** to make API calls

### Setup OAuth Application

1. Go to **Settings** → **OAuth Applications**
2. Click **"Create Application"**
3. Enter application details:
   - **Application Name**
   - **Description**
   - **Redirect URIs** (e.g., `https://yourapp.com/callback`)
4. Click **"Create"**
5. Save your `client_id` and `client_secret`

### Authorization Endpoint

```
GET https://api.car4ge.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=vehicles:read,maintenance:read,maintenance:write&
  state=random_string
```

### OAuth Scopes

| Scope | Permission |
|-------|-----------|
| `vehicles:read` | Read vehicle data |
| `vehicles:write` | Create and update vehicles |
| `vehicles:delete` | Delete vehicles |
| `maintenance:read` | Read maintenance records |
| `maintenance:write` | Create and update maintenance |
| `maintenance:delete` | Delete maintenance records |
| `garages:read` | Read garage data |
| `garages:write` | Update garage data |
| `team:read` | Read team members |
| `team:write` | Manage team members |

### Token Endpoint

Exchange authorization code for access token:

```http
POST https://api.car4ge.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE_FROM_REDIRECT&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=https://yourapp.com/callback
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Using OAuth Token

```bash
curl -X GET https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Refreshing Token

```http
POST https://api.car4ge.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=REFRESH_TOKEN&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET
```

### OAuth Implementation (JavaScript)

```javascript
async function initiateOAuthFlow() {
  const clientId = process.env.REACT_APP_CAR4GE_CLIENT_ID;
  const redirectUri = window.location.origin + '/callback';
  const state = generateRandomString(); // Save this in session
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'vehicles:read,maintenance:read,garages:read',
    state: state
  });
  
  window.location.href = `https://api.car4ge.com/oauth/authorize?${params}`;
}

async function handleOAuthCallback(code, state) {
  // Validate state matches session value
  const savedState = sessionStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }
  
  // Exchange code for token (on backend)
  const response = await fetch('/api/oauth-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri: window.location.origin + '/callback' })
  });
  
  const { accessToken } = await response.json();
  
  // Store token securely
  localStorage.setItem('car4ge_token', accessToken);
  
  return accessToken;
}
```

---

## Session Cookies

Automatically handled when accessing CAR4GE UI through a web browser.

### Cookie Security

- **HttpOnly** - Not accessible to JavaScript
- **Secure** - Only transmitted over HTTPS
- **SameSite=Strict** - CSRF protection

---

## Token Expiration & Refresh

### Access Token Expiration

- **API Keys**: No expiration
- **OAuth Tokens**: 1 hour expiration
- **Refresh Token**: 30 days expiration

### Handling Expired Tokens

```javascript
async function apiCallWithRetry(url, options, retried = false) {
  const response = await fetch(url, options);
  
  if (response.status === 401 && !retried) {
    // Token expired, try to refresh
    const newToken = await refreshToken();
    options.headers.Authorization = `Bearer ${newToken}`;
    return apiCallWithRetry(url, options, true);
  }
  
  return response;
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('car4ge_refresh_token');
  
  const response = await fetch('https://api.car4ge.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.REACT_APP_CAR4GE_CLIENT_ID,
      client_secret: process.env.CAR4GE_CLIENT_SECRET
    })
  });
  
  const data = await response.json();
  localStorage.setItem('car4ge_token', data.access_token);
  
  return data.access_token;
}
```

---

## Multi-Factor Authentication (MFA)

For enhanced security, enable MFA on your account:

1. Go to **Settings** → **Security**
2. Click **"Enable Two-Factor Authentication"**
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes
6. Click **"Enable"**

When generating API keys with MFA enabled:
1. Log in as usual
2. Enter 2FA code when prompted
3. Generate API key normally

---

## Errors & Troubleshooting

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  }
}
```

**Solutions:**
- Verify API key is correct
- Ensure key hasn't been revoked
- Check Authorization header format

### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

**Solutions:**
- Grant additional permissions to API key
- Check user role has access

### CORS Errors

If making requests from a browser:

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Make API requests from your backend, not frontend
- Use a proxy server
- Contact support for CORS whitelisting

---

## Support

- **Documentation**: [docs.car4ge.com](https://docs.car4ge.com)
- **API Status**: [status.car4ge.com](https://status.car4ge.com)
- **Email Support**: support@car4ge.com
- **Live Chat**: Available in dashboard
