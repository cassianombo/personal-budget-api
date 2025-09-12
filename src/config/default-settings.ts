export const DEFAULT_USER_SETTINGS = {
  language: 'en',
  currency: 'USD',
  isBiometricLocked: false,
};

// Available options for each setting
export const SETTING_OPTIONS = {
  language: ['en', 'pt', 'es'] as const,
  currency: ['USD', 'EUR', 'GBP', 'BRL'] as const,
  isBiometricLocked: [true, false] as const,
};

// Validation rules for settings
export const SETTING_VALIDATION = {
  language: ['en', 'pt', 'es'],
  currency: ['USD', 'EUR', 'GBP', 'BRL'],
  isBiometricLocked: [true, false],
};

// Type definitions for better TypeScript support
export type Language = (typeof SETTING_OPTIONS.language)[number];
export type Currency = (typeof SETTING_OPTIONS.currency)[number];
export type BiometricLock = (typeof SETTING_OPTIONS.isBiometricLocked)[number];

export interface UserSettings {
  language: Language;
  currency: Currency;
  isBiometricLocked: BiometricLock;
}
