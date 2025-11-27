# Security Headers Configuration

## Overview

Security headers should be configured at the **HTTP server level** (not in HTML meta tags) for proper security. This document provides guidance on setting security headers for different deployment scenarios.

## Required Security Headers

For production deployment, configure the following HTTP headers:

### X-Frame-Options
```
X-Frame-Options: DENY
```
**Purpose**: Prevents the page from being displayed in a frame/iframe, protecting against clickjacking attacks.

**⚠️ Important**: This header **MUST** be set via HTTP headers, not meta tags. It has been removed from `index.html`.

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
**Purpose**: Prevents MIME type sniffing, forcing browsers to respect the declared content type.

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
**Purpose**: Enables the browser's built-in XSS filter (though modern browsers handle this automatically).

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
**Purpose**: Controls how much referrer information is sent with requests.

### Content-Security-Policy (Recommended)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kgf-gold-price-predictor.onrender.com;
```
**Purpose**: Restricts which resources can be loaded, preventing XSS attacks.

**Note**: Adjust the CSP policy based on your application's needs. The example above is a starting point.

## Configuration by Deployment Platform

### Vercel

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kgf-gold-price-predictor.onrender.com;"
        }
      ]
    }
  ]
}
```

### Netlify

Create `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kgf-gold-price-predictor.onrender.com;"
```

### Nginx

Add to your Nginx configuration:
```nginx
server {
    # ... other configuration ...
    
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kgf-gold-price-predictor.onrender.com;" always;
}
```

### Apache

Add to `.htaccess` or Apache configuration:
```apache
<IfModule mod_headers.c>
    Header set X-Frame-Options "DENY"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://kgf-gold-price-predictor.onrender.com;"
</IfModule>
```

### Cloudflare

Configure via Cloudflare Dashboard:
1. Go to **Security** → **Headers**
2. Add custom headers for each security header
3. Or use Cloudflare Workers/Page Rules

### Render.com

For static sites on Render, you may need to:
1. Use a custom server configuration
2. Or configure headers via Render's platform settings

## Testing Security Headers

### Browser DevTools
1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload the page
4. Click on the document request
5. Check **Headers** section for security headers

### Online Tools
- [SecurityHeaders.com](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

### Command Line
```bash
curl -I https://your-domain.com
```

## Development Server

For local development with Vite, security headers are not automatically set. The Vite dev server is for development only and should not be used in production.

For production, always configure security headers at the HTTP server level.

## Notes

- **X-Frame-Options** cannot be set via meta tags and must be set via HTTP headers
- **Content-Security-Policy** should be carefully configured to avoid breaking functionality
- Test your CSP policy thoroughly before deploying to production
- Some headers may need adjustment based on your specific requirements

---

**Last Updated**: 2024


