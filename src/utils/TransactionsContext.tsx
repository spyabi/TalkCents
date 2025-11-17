import React, { createContext, useContext, useState, useEffect } from "react";
const API_URL = "http://18.234.224.108:8000/api"
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
  category: { name: string; icon: string };
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

  // create empty space
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // get expenditure from backend
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const pendingRes = await fetch(`${API_URL}/expenditure/pending`);
        const approvedRes = await fetch(`${API_URL}/expenditure/approved`);

        const pending = await pendingRes.json();
        const approved = await approvedRes.json();

        setTransactions([...pending, ...approved]);
      } catch (error) {
        console.log("Failed to load transactions:", error);
      }
    };

    loadTransactions();
  }, []);

  // add expenditure
  // const addTransaction = async (tx: Transaction) => {
  //   setTransactions((prev) => [...prev, tx]);
  // };
  const addTransaction = async (tx: Transaction) => {
    const response = await fetch(`${API_URL}/expenditure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tx.name,
        amount: tx.amount,
        type: tx.type,
        category: tx.category.name,
        date: tx.date,
        note: tx.note || ""
      })
    });

    const saved = await response.json();
    setTransactions(prev => [...prev, saved]);
  };


  // edit transaction
  // const editTransaction = async (updated: Transaction) => {
  //   setTransactions(prev =>
  //     prev.map(tx => (tx.id === updated.id ? updated : tx))
  //   );
  const editTransaction = async (tx: Transaction) => {
    const res = await fetch(`${API_URL}/expenditure/${tx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx)
    });

    const updated = await res.json();

    setTransactions(prev =>
      prev.map(t => t.id === updated.id ? updated : t)
    );
  };



  // delete transaction
  // const deleteTransaction = async (id: string) => {
  //   setTransactions((prev) => prev.filter((t) => t.id !== id));
  // };
  const deleteTransaction = async (id: string) => {
    await fetch(`${API_URL}/expenditure/${id}`, {
      method: "DELETE",
    });

    setTransactions(prev => prev.filter(t => t.id !== id));
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


