export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TITLE_LENGTH: 255,
} as const;

export const TRANSACTION_MESSAGES = {
  INVALID_ID: 'Invalid transaction ID provided',
  USER_ID_REQUIRED: 'User ID is required',
  ACCOUNT_NOT_FOUND: (id: number) => `Account with ID ${id} not found`,
  TRANSACTION_NOT_FOUND: (id: number) =>
    `Transaction with ID ${id} not found or does not belong to you`,
  CATEGORY_NOT_FOUND: (id: number) => `Category with ID ${id} not found`,
  INSUFFICIENT_BALANCE: (current: number, required: number) =>
    `Insufficient balance. Account has ${current} but needs ${required}`,
  TRANSFER_TARGET_REQUIRED:
    'Target account ID is required for transfer transactions',
  CANNOT_TRANSFER_SAME_ACCOUNT: 'Cannot transfer to the same account',
  CATEGORY_TYPE_MISMATCH: (expected: string, actual: string) =>
    `Category type must be ${expected} for ${actual} transactions`,
  TARGET_ACCOUNT_ONLY_FOR_TRANSFERS:
    'Target account ID can only be used for transfer transactions',
} as const;
