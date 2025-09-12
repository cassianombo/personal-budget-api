import { AccountType } from '../../accounts/account.entity';

export const ACCOUNT_SETTINGS = {
  icons: ['bank', 'creditcard', 'wallet', 'lock', 'gift', 'Trophy'],
  backgrounds: [
    '#F59E0B',
    '#10B981',
    '#6B7280',
    '#6366F1',
    '#8B5CF6',
    '#EF4444',
  ],
  types: Object.values(AccountType),
};
