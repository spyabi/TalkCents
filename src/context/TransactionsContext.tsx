import React, { createContext, useContext, useState } from "react";

export type Category = {
  name: string;
  icon?: string;
};

export type Transaction = {
  id: string;
  type: "Income" | "Expense";
  name: string;
  amount: number;
  date: string;
  category:{ name: string; icon: string }; 
  note?: string;
};

type TransactionsContextType = {
  categories: Category[];
  addCategory: (name: string, icon?: string) => Promise<void>;

  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};


const TransactionsContext = createContext<TransactionsContextType | null>(null);

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([
    { name: "Food & Drinks", icon: '🍔' },
    { name: "Shopping", icon: "🛍️" },
    { name: "Transport", icon: "🚃" },
    { name: "Others", icon: "🗂️" },
  ]);

  // Add a new category
const addCategory = async (name: string, icon?: string) => {
  setCategories((prev) => [...prev, { name, icon }]);
};

  // edit transaction
const editTransaction = async (updated: Transaction) => {
  setTransactions(prev =>
    prev.map(tx => (tx.id === updated.id ? updated : tx))
  );
};

// delete transaction
const deleteTransaction = async (id: string) => {
  setTransactions((prev) => prev.filter((t) => t.id !== id));
};


  // const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
  {
    id: "1",
    name: "Camera",
    category: { 
      name: "Shopping", 
      icon: "🛍️" 
    },
    amount: 450,
    type: "Expense",
    date: "2025-09-20",
  },
  {
    id: "2",
    name: "Coffee Machine",
    category: { 
      name: "Shopping", 
      icon: "🛍️" 
    },
    amount: 450,
    type: "Expense",
    date: "2025-09-20",
  },
  {
    id: "3",
    name: "Uniqlo Part Time Salary",
    category: { 
      name: "Salary", 
      icon: "🛍️" 
    },
    amount: 400,
    type: "Income",
    date: "2025-09-13",
  },
  {
    id: "4",
    name: "MacDonald's",
    category: { 
      name: "Food", 
      icon: "🍔" 
    },
    amount: 50,
    type: "Expense",
    date: "2025-09-01",
  },
]);


const addTransaction = async (tx: Transaction) => {
  setTransactions((prev) => [...prev, tx]);
};

  return (
    <TransactionsContext.Provider
      value={{
        categories,
        addCategory,
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used inside TransactionsProvider");
  }
  return context;
};


