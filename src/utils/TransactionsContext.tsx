import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { getToken } from './auth';

const API_URL = 'https://talkcents-backend-7r52622dga-as.a.run.app/docs#';

export type Category = {
  name: string;
  icon?: string;
};

export type Transaction = {
  id: string;
  type: 'Income' | 'Expense';
  name: string;
  amount: number;
  date: string;
  category: string;
  note?: string;
  status?: 'Pending' | 'Approved';
};

type TransactionsContextType = {
  categories: Category[];
  addCategory: (name: string, icon?: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  editTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextType | null>(null);

export const TransactionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  // 🔧 Helper: Convert Backend Data -> Frontend Transaction Shape
  const toClientTx = useCallback((raw: any): Transaction => {
    const id = String(raw.uuid ?? '');
    const type: 'Income' | 'Expense' =
      raw.type === 'Income' ? 'Income' : 'Expense';
    const name = String(raw.name ?? '');
    const amount = Number(raw.amount ?? raw.price ?? 0);

    const catName =
      typeof raw.category === 'string'
        ? raw.category
        : raw.category?.name ?? 'Others';

    const date = (() => {
      const d = raw.date_of_expense
        ? new Date(raw.date_of_expense)
        : raw.date
        ? new Date(raw.date)
        : new Date();
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    })();

    return {
      id,
      type,
      name,
      amount,
      date,
      category: catName,
      note: raw.notes ?? raw.note ?? '',
      status: raw.status ?? 'Pending',
    };
  }, []);

  const addCategory = async (name: string, icon?: string) => {
    setCategories(prev => [...prev, { name, icon }]);
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const refreshTransactions = useCallback(async () => {
    try {
      const storedToken = await getToken();

      const headers = {
        Authorization: `Bearer ${storedToken}`,
        'Content-Type': 'application/json',
      };

      const pendingRes = await fetch(`${API_URL}/expenditure/pending`, {
        headers,
      });
      const approvedRes = await fetch(`${API_URL}/expenditure/approved`, {
        headers,
      });

      const pending = await pendingRes.json();
      const approved = await approvedRes.json();

      // Map backend data to client shape
      const mapped = [...(pending ?? []), ...(approved ?? [])].map(toClientTx);
      setTransactions(mapped);
    } catch (error) {
      console.log('Failed to load transactions:', error);
      setTransactions([]);
    }
  }, [toClientTx]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // Add Transaction
  const addTransaction = async (tx: Transaction) => {
    console.log('Sending to API:', JSON.stringify(tx, null, 2));
    const storedToken = await getToken();

    const response = await fetch(`${API_URL}/expenditure`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${storedToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: tx.name,
        amount: tx.amount,
        category: tx.category,
        date_of_expense: tx.date,
        notes: tx.note || '',
        status: 'Approved',
      }),
    });

    const savedRaw = await response.json();
    console.log(`RESPONSE: ${JSON.stringify(savedRaw)}`);
    const saved = toClientTx(savedRaw);
    setTransactions(prev => [...prev, saved]);
  };

  // Edit Transaction
  const editTransaction = async (tx: Transaction) => {
    const storedToken = await getToken();

    const res = await fetch(`${API_URL}/expenditure/${tx.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify({
        name: tx.name,
        amount: tx.amount,
        category: tx.category,
        date_of_expense: tx.date,
        notes: tx.note ?? '',
        status: tx.status,
      }),
    });

    const updatedRaw = await res.json();
    const updated = toClientTx(updatedRaw);

    setTransactions(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  // Delete Transaction
  const deleteTransaction = async (id: string) => {
    const storedToken = await getToken();

    await fetch(`${API_URL}/expenditure/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
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
        refreshTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used inside TransactionsProvider');
  }
  return context;
};
