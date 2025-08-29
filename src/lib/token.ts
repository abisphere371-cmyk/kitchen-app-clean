// Token management is now handled via cookies, not localStorage
// This file is kept for compatibility but is no longer used

export const getToken = (): string | null => {
  return null;
};

export const setToken = (token: string): void => {
  // No-op, cookies are handled by the browser
};

export const clearToken = (): void => {
  // No-op, cookies are handled by the browser
};

export const isTokenValid = (): boolean => {
  // Always return false since we're not using localStorage for tokens anymore
  return false;
};