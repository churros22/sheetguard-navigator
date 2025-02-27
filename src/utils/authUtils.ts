
/**
 * Authentication utilities for managing user login state
 * and validation of credentials
 */

// The hardcoded password for authentication
const CORRECT_PASSWORD = 'cbe425';

/**
 * Check if the provided password is correct
 * @param password - The password to validate
 * @returns boolean indicating if password is correct
 */
export const validatePassword = (password: string): boolean => {
  return password === CORRECT_PASSWORD;
};

/**
 * Save authentication state to localStorage
 * @param isAuthenticated - Authentication state to save
 */
export const setAuthState = (isAuthenticated: boolean): void => {
  localStorage.setItem('isAuthenticated', isAuthenticated.toString());
};

/**
 * Get authentication state from localStorage
 * @returns boolean indicating if user is authenticated
 */
export const getAuthState = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

/**
 * Clear authentication state from localStorage (logout)
 */
export const clearAuthState = (): void => {
  localStorage.removeItem('isAuthenticated');
};
