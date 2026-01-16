import React, { createContext, useContext, useState, useEffect } from "react";

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: "expense" | "income";
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  messages: ChatMessage[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  getTotalExpenses: (month?: number, year?: number) => number;
  getTotalIncome: (month?: number, year?: number) => number;
  getExpensesByCategory: () => { category: string; total: number; color: string }[];
  getMonthlyExpenses: () => { month: string; total: number }[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "hsl(var(--chart-1))",
  "Moradia": "hsl(var(--chart-2))",
  "Transporte": "hsl(var(--chart-3))",
  "Lazer": "hsl(var(--chart-4))",
  "Saúde": "hsl(var(--chart-5))",
  "Educação": "hsl(var(--chart-6))",
  "Compras": "hsl(var(--chart-7))",
  "Contas fixas": "hsl(var(--chart-8))",
  "Outros": "hsl(var(--muted-foreground))",
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "1", amount: 45.90, category: "Alimentação", description: "Almoço no restaurante", date: "2026-01-15", type: "expense" },
  { id: "2", amount: 150.00, category: "Transporte", description: "Combustível", date: "2026-01-14", type: "expense" },
  { id: "3", amount: 89.90, category: "Lazer", description: "Cinema e pipoca", date: "2026-01-13", type: "expense" },
  { id: "4", amount: 5000.00, category: "Salário", description: "Salário mensal", date: "2026-01-05", type: "income" },
  { id: "5", amount: 250.00, category: "Contas fixas", description: "Conta de luz", date: "2026-01-10", type: "expense" },
  { id: "6", amount: 120.00, category: "Saúde", description: "Farmácia", date: "2026-01-12", type: "expense" },
  { id: "7", amount: 350.00, category: "Compras", description: "Roupas", date: "2026-01-08", type: "expense" },
  { id: "8", amount: 200.00, category: "Educação", description: "Curso online", date: "2026-01-06", type: "expense" },
];

const INITIAL_GOALS: Goal[] = [
  { id: "1", title: "Fundo de emergência", targetAmount: 10000, currentAmount: 3500, deadline: "2026-06-30", category: "Reserva" },
  { id: "2", title: "Viagem de férias", targetAmount: 5000, currentAmount: 1200, deadline: "2026-12-15", category: "Lazer" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Olá! 👋 Sou seu Agente Financeiro pessoal. Estou aqui para ajudar você a organizar suas finanças de forma simples e prática.\n\nVocê pode me dizer coisas como:\n• \"Gastei R$50 no almoço hoje\"\n• \"Quanto gastei com alimentação este mês?\"\n• \"Me dê dicas para economizar\"\n\nComo posso ajudar você hoje?",
    timestamp: new Date().toISOString(),
  },
];

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("transactions");
    return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const stored = localStorage.getItem("goals");
    return stored ? JSON.parse(stored) : INITIAL_GOALS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : INITIAL_MESSAGES;
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const addGoal = (goal: Omit<Goal, "id">) => {
    const newGoal = { ...goal, id: crypto.randomUUID() };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const getTotalExpenses = (month?: number, year?: number) => {
    return transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        if (month !== undefined && year !== undefined) {
          const date = new Date(t.date);
          return date.getMonth() === month && date.getFullYear() === year;
        }
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalIncome = (month?: number, year?: number) => {
    return transactions
      .filter((t) => {
        if (t.type !== "income") return false;
        if (month !== undefined && year !== undefined) {
          const date = new Date(t.date);
          return date.getMonth() === month && date.getFullYear() === year;
        }
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS["Outros"],
      }))
      .sort((a, b) => b.total - a.total);
  };

  const getMonthlyExpenses = () => {
    const monthlyTotals: Record<string, number> = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const date = new Date(t.date);
        const key = `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
        monthlyTotals[key] = (monthlyTotals[key] || 0) + t.amount;
      });

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total }))
      .slice(-6);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        goals,
        messages,
        addTransaction,
        addGoal,
        updateGoal,
        deleteGoal,
        addMessage,
        getTotalExpenses,
        getTotalIncome,
        getExpensesByCategory,
        getMonthlyExpenses,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
