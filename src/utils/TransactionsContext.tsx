import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getPending, getApproved } from "../utils/expenditure";

const API_URL = "http://18.234.224.108:8000/api";

export type Category = {
  name: string;
  icon?: string;
};

export type Transaction = {
  id: string;                                   // local/frontend id
  type: "Income" | "Expense";
  name: string;
  amount: number;
  date: string;
  category: { name: string; icon: string };
  note?: string;
  status?: "APPROVED" | "PENDING";
};

type TransactionsContextType = {
  categories: Category[];
  addCategory: (name: string, icon?: string) => Promise<void>;

  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  reloadTransactions: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextType | null>(null);

export const TransactionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = useState<Category[]>([
    { name: "Food & Drinks", icon: "🍔" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Transport", icon: "🚃" },
    { name: "Others", icon: "🗂️" },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addCategory = async (name: string, icon?: string) => {
    setCategories((prev) => [...prev, { name, icon }]);
  };

  // ---------- helpers ----------
  const pickIcon = useCallback(
  (name: string) =>
    categories.find(
      (c) => c.name.toLowerCase() === String(name).toLowerCase()
    )?.icon ?? "",
  [categories]
);

  const toClientTx = useCallback(
  (raw: any): Transaction => {
    const id = String(raw.id ?? raw._id ?? Date.now());

    const type: "Income" | "Expense" =
      raw.type === "Income" ? "Income" : "Expense";

    const name = String(raw.name ?? "");
    const amount = Number(raw.amount ?? raw.price ?? 0);

    const catName =
      typeof raw.category === "string"
        ? raw.category
        : raw.category?.name ?? "Others";

    const date = (() => {
      const d = raw.date ? new Date(raw.date) : new Date();
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })();

    return {
      id,
      type,
      name,
      amount,
      date,
      category: { name: catName, icon: pickIcon(catName) },
      note: raw.note ?? "",
    };
  },
  [pickIcon]
);

  // ---------- reload from backend (PENDING + APPROVED) ----------
  const reloadTransactions = useCallback(async () => {
    try {
      const [pending, approved] = await Promise.all([
        getPending(),
        getApproved(),
      ]);

      const mapped = [...(pending ?? []), ...(approved ?? [])].map(toClientTx);
      setTransactions(mapped);
    } catch (error) {
      console.log("Failed to load transactions:", error);
      setTransactions([]);
    }
  }, [toClientTx]);

  // initial load
  useEffect(() => {
    reloadTransactions();
  }, [reloadTransactions]);

  // ---------- CRUD that also touches backend ----------
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
      note: tx.note || "",
    }),
  });

  // Try to read an id from backend, but don't depend on full shape
  let savedId: string | undefined;
  try {
    const savedRaw = await response.json();
    savedId = savedRaw?.id ?? savedRaw?._id;
  } catch (e) {
    console.log("addTransaction: could not parse response JSON", e);
  }

  const saved: Transaction = {
    ...tx,
    id: savedId ? String(savedId) : tx.id, // keep our local id if backend doesn't give one
    category: {
      name: tx.category.name,
      icon: pickIcon(tx.category.name),    // ensure icon matches current categories
    },
  };

  setTransactions((prev) => [...prev, saved]);
};

  const editTransaction = async (tx: Transaction) => {
    await fetch(`${API_URL}/expenditure/${tx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tx.name,
        price: tx.amount,
        type: tx.type,
        category: tx.category.name,
        date: tx.date,
        note: tx.note || "",
      }),
    });

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === tx.id
          ? {
              ...tx,
              category: {
                name: tx.category.name,
                icon: pickIcon(tx.category.name),
              },
            }
          : t
      )
    );
  };

  const deleteTransaction = async (id: string) => {
    await fetch(`${API_URL}/expenditure/${id}`, {
      method: "DELETE",
    });

    setTransactions((prev) => prev.filter((t) => t.id !== id));
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
        reloadTransactions,
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
