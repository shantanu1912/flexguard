import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  period: string;
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      toast.error("Failed to load budgets");
    } else {
      setBudgets((data as Budget[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const upsertBudget = async (category: string, limit_amount: number) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("budgets")
      .upsert(
        { user_id: user.id, category, limit_amount, period: "monthly" },
        { onConflict: "user_id,category,period" }
      )
      .select()
      .single();
    if (error) {
      toast.error("Failed to save budget");
      return null;
    }
    setBudgets((prev) => {
      const existing = prev.find((b) => b.category === category);
      if (existing) return prev.map((b) => (b.id === data.id ? (data as Budget) : b));
      return [...prev, data as Budget];
    });
    return data as Budget;
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete budget");
      return;
    }
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return { budgets, loading, upsertBudget, deleteBudget, refetch: fetch };
};
