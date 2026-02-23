import { createOAuth2Client } from '@/lib/google-auth';
import { loadTokens, saveTokens, type OAuthTokens } from './token-storage.service';

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

/**
 * Checks if a token needs refresh
 */
export function needsRefresh(tokens: OAuthTokens): boolean {
  return tokens.expiresAt - Date.now() < TOKEN_REFRESH_BUFFER;
}

/**
 * Refreshes an OAuth access token
 */
export async function refreshAccessToken(userId: string, tokens: OAuthTokens): Promise<OAuthTokens> {
  const oauth2Client = createOAuth2Client();

  // Set the refresh token
  oauth2Client.setCredentials({
    refresh_token: tokens.refreshToken,
  });

  try {
    // Request new access token
    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    // Update tokens
    const newTokens: OAuthTokens = {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || tokens.refreshToken, // Keep old refresh token if not provided
      expiresAt: credentials.expiry_date || Date.now() + 3600 * 1000,
      scope: credentials.scope || tokens.scope,
      tokenType: credentials.token_type || tokens.tokenType,
    };

    // Save updated tokens
    await saveTokens(userId, newTokens);

    return newTokens;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Gets a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  let tokens = await loadTokens(userId);

  if (!tokens) {
    throw new Error('No tokens found for user');
  }

  // Refresh if needed
  if (needsRefresh(tokens)) {
    tokens = await refreshAccessToken(userId, tokens);
  }

  return tokens.accessToken;
}
