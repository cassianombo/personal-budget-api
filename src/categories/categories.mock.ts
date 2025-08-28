import { CategoryType } from './category.entity';

export const categoriesMock = [
  // Expense Categories
  {
    name: "Food & Dining",
    icon: "rest",
    background: "#FF5722",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Transportation",
    icon: "car",
    background: "#2196F3",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Entertainment",
    icon: "play",
    background: "#9C27B0",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Shopping",
    icon: "shoppingcart",
    background: "#E91E63",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Bills & Utilities",
    icon: "filetext1",
    background: "#FF9800",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Healthcare",
    icon: "heart",
    background: "#F44336",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Education",
    icon: "book",
    background: "#607D8B",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Housing",
    icon: "home",
    background: "#795548",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Insurance",
    icon: "lock",
    background: "#3F51B5",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Personal Care",
    icon: "user",
    background: "#FFC107",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Travel",
    icon: "car",
    background: "#00BCD4",
    type: CategoryType.EXPENSE,
  },
  {
    name: "Gifts",
    icon: "gift",
    background: "#8BC34A",
    type: CategoryType.EXPENSE,
  },

  // Income Categories
  {
    name: "Salary",
    icon: "creditcard",
    background: "#4CAF50",
    type: CategoryType.INCOME,
  },
  {
    name: "Freelance",
    icon: "tool",
    background: "#009688",
    type: CategoryType.INCOME,
  },
  {
    name: "Investments",
    icon: "linechart",
    background: "#FFEB3B",
    type: CategoryType.INCOME,
  },
  {
    name: "Business",
    icon: "profile",
    background: "#673AB7",
    type: CategoryType.INCOME,
  },
  {
    name: "Rental Income",
    icon: "bank",
    background: "#3F51B5",
    type: CategoryType.INCOME,
  },
  {
    name: "Other Income",
    icon: "plus",
    background: "#795548",
    type: CategoryType.INCOME,
  },
];

export default categoriesMock;
