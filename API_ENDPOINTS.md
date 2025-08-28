# Personal Budget API Endpoints

## Users

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Accounts

- `POST /accounts` - Create a new account
- `GET /accounts` - Get all accounts (or filter by userId query param)
- `GET /accounts/:id` - Get account by ID
- `PATCH /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

## Categories

- `POST /categories` - Create a new category
- `GET /categories` - Get all categories (or filter by userId/type query params)
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## Transactions

- `POST /transactions` - Create a new transaction
- `GET /transactions` - Get all transactions (or filter by userId/accountId/categoryId query params)
- `GET /transactions/:id` - Get transaction by ID
- `PATCH /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

## Query Parameters

### Accounts
- `userId` - Filter accounts by user ID

### Categories
- `userId` - Filter categories by user ID
- `type` - Filter categories by type (income/expense)

### Transactions
- `userId` - Filter transactions by user ID
- `accountId` - Filter transactions by account ID
- `categoryId` - Filter transactions by category ID

## Features

- **Automatic Balance Updates**: Account balances are automatically updated when transactions are created, updated, or deleted
- **Transaction Types**: Support for expense, income, and transfer transactions
- **Data Validation**: Input validation using class-validator decorators
- **Relationships**: Proper entity relationships with TypeORM
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
