import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
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

const WELCOME_MESSAGE = "Olá! 👋 Sou seu Agente Financeiro pessoal. Estou aqui para ajudar você a organizar suas finanças de forma simples e prática.\n\nVocê pode me dizer coisas como:\n• \"Gastei R$50 no almoço hoje\"\n• \"Quanto gastei com alimentação este mês?\"\n• \"Me dê dicas para economizar\"\n\nComo posso ajudar você hoje?";

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setGoals([]);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [txResult, goalsResult, msgsResult] = await Promise.all([
        supabase.from("transactions").select("*").order("date", { ascending: false }),
        supabase.from("financial_goals").select("*").order("created_at", { ascending: true }),
        supabase.from("chat_messages").select("*").order("created_at", { ascending: true }),
      ]);

      if (txResult.data) {
        setTransactions(txResult.data.map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          category: t.category,
          description: t.description,
          date: t.date,
          type: t.type as "expense" | "income",
        })));
      }

      if (goalsResult.data) {
        setGoals(goalsResult.data.map((g) => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          deadline: g.deadline || "",
          category: g.category,
        })));
      }

      if (msgsResult.data && msgsResult.data.length > 0) {
        setMessages(msgsResult.data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: m.created_at,
        })));
      } else {
        // Insert welcome message if no messages exist
        const { data: welcomeMsg } = await supabase
          .from("chat_messages")
          .insert({ user_id: user.id, role: "assistant", content: WELCOME_MESSAGE })
          .select()
          .single();
        if (welcomeMsg) {
          setMessages([{ id: welcomeMsg.id, role: "assistant", content: welcomeMsg.content, timestamp: welcomeMsg.created_at }]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
      })
      .select()
      .single();
    if (data) {
      const newTx: Transaction = {
        id: data.id,
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
        type: data.type as "expense" | "income",
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const addGoal = async (goal: Omit<Goal, "id">) => {
    if (!user) return;
    const { data } = await supabase
      .from("financial_goals")
      .insert({
        user_id: user.id,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount,
        deadline: goal.deadline || null,
        category: goal.category,
      })
      .select()
      .single();
    if (data) {
      setGoals((prev) => [...prev, {
        id: data.id,
        title: data.title,
        targetAmount: Number(data.target_amount),
        currentAmount: Number(data.current_amount),
        deadline: data.deadline || "",
        category: data.category,
      }]);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline || null;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    await supabase.from("financial_goals").update(dbUpdates).eq("id", id);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    await supabase.from("financial_goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addMessage = async (message: Omit<ChatMessage, "id" | "timestamp">) => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: message.role, content: message.content })
      .select()
      .single();
    if (data) {
      setMessages((prev) => [...prev, {
        id: data.id,
        role: data.role as "user" | "assistant",
        content: data.content,
        timestamp: data.created_at,
      }]);
    }
  };

  const getTotalExpenses = (month?: number, year?: number) => {
    return transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        if (month !== undefined && year !== undefined) {
          const date = new Date(t.date + "T00:00:00");
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
          const date = new Date(t.date + "T00:00:00");
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
        const date = new Date(t.date + "T00:00:00");
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
        loading,
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
