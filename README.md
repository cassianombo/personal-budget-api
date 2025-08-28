# Personal Budget API

A NestJS-based API for managing personal budgets, transactions, accounts, and categories.

## Features

- **User Management**: Create and manage user accounts
- **Categories**: Pre-defined expense and income categories with icons and colors
- **Accounts**: Manage multiple financial accounts
- **Transactions**: Track income and expenses with categorization
- **Database**: PostgreSQL with TypeORM integration

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Database Setup

1. **Start PostgreSQL with Docker:**
```bash
docker run --name personal-budget-api \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=personal-budget \
  -p 5432:5432 \
  -d postgres
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the root directory with your database configuration.

4. **Run the application:**
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Categories Seeding

The application comes with pre-defined categories for both expenses and income. To seed your database with these categories:

```bash
npm run seed:categories
```

### Available Categories

#### Expense Categories (12)
- Food & Dining
- Transportation  
- Entertainment
- Shopping
- Bills & Utilities
- Healthcare
- Education
- Housing
- Insurance
- Personal Care
- Travel
- Gifts

#### Income Categories (6)
- Salary
- Freelance
- Investments
- Business
- Rental Income
- Other Income

Each category includes:
- Descriptive name
- Icon representation
- Background color for UI
- Type classification (income/expense)

## API Endpoints

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for detailed endpoint documentation.

## Development

### Available Scripts

- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed:categories` - Seed database with categories

### Project Structure

```
src/
├── accounts/          # Account management
├── categories/        # Category management and seeding
├── transactions/      # Transaction management
├── users/            # User management
├── config/           # Configuration files
└── scripts/          # Database seeding scripts
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is unlicensed.


