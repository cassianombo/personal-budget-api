export const DEFAULT_USER_SETTINGS = {
  language: 'en',
  currency: 'USD',
  isBiometricLocked: false,
};

// Available options for each setting
export const SETTING_OPTIONS = {
  language: [
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'es', label: 'Español' },
  ] as const,
  currency: [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'BRL', label: 'BRL (R$)' },
  ] as const,
  isBiometricLocked: [true, false] as const,
};

// Validation rules for settings
export const SETTING_VALIDATION = {
  language: ['en', 'pt', 'es'],
  currency: ['USD', 'EUR', 'GBP', 'BRL'],
  isBiometricLocked: [true, false],
};

// Type definitions for better TypeScript support
export type LanguageOption = (typeof SETTING_OPTIONS.language)[number];
export type CurrencyOption = (typeof SETTING_OPTIONS.currency)[number];
export type BiometricLock = (typeof SETTING_OPTIONS.isBiometricLocked)[number];

export interface UserSettings {
  language: string;
  currency: string;
  isBiometricLocked: BiometricLock;
}
