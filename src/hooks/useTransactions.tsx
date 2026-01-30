import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  user_id: string;
  name: string;
  category: string;
  amount: number;
  payee_vpa: string | null;
  transaction_type: "income" | "expense";
  emotion_tag: string | null;
  notes: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  name: string;
  category: string;
  amount: number;
  payee_vpa?: string;
  transaction_type?: "income" | "expense";
  emotion_tag?: string;
  notes?: string;
  transaction_date?: string;
}

export interface UpdateTransactionInput {
  name?: string;
  category?: string;
  amount?: number;
  payee_vpa?: string;
  transaction_type?: "income" | "expense";
  emotion_tag?: string;
  notes?: string;
  transaction_date?: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions((data as Transaction[]) || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTransaction = async (input: CreateTransactionInput): Promise<Transaction | null> => {
    if (!user) {
      toast.error("You must be logged in to add transactions");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          name: input.name,
          category: input.category,
          amount: input.amount,
          payee_vpa: input.payee_vpa || null,
          transaction_type: input.transaction_type || "expense",
          emotion_tag: input.emotion_tag || null,
          notes: input.notes || null,
          transaction_date: input.transaction_date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction = data as Transaction;
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to save transaction");
      return null;
    }
  };

  const updateTransaction = async (
    id: string,
    input: UpdateTransactionInput
  ): Promise<Transaction | null> => {
    if (!user) {
      toast.error("You must be logged in to update transactions");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("transactions")
        .update(input)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTransaction = data as Transaction;
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      );
      return updatedTransaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
      return null;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to delete transactions");
      return false;
    }

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
      return false;
    }
  };

  // Calculate totals
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.transaction_type === "income") {
        acc.income += Number(t.amount);
      } else {
        acc.expenses += Number(t.amount);
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const balance = totals.income - totals.expenses;

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
    totals: {
      ...totals,
      balance,
    },
  };
};
