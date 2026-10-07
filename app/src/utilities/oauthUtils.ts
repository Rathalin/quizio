/**
 * Non-loopback redirect URIs that MCP/OAuth clients are allowed to use.
 * Loopback redirect URIs (http://localhost:*, http://127.0.0.1:*, http://[::1]:*) are always allowed.
 * Keep in sync with backend/handlers/oauth.go (the backend is the source of truth when issuing codes).
 */
const allowedRedirectUris = ['https://vscode.dev/redirect', 'https://insiders.vscode.dev/redirect'];

export function isAllowedOAuthRedirectUri(redirectUri: string): boolean {
  if (allowedRedirectUris.includes(redirectUri)) {
    return true;
  }

  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' || url.username || url.password || url.hash) {
    return false;
  }

  const host = url.hostname;
  return host === 'localhost' || host === '[::1]' || /^127(\.\d{1,3}){3}$/.test(host);
}

