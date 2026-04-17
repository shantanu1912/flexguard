import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface RecurringBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  next_due_date: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useRecurringBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) {
      setBills([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("recurring_bills")
      .select("*")
      .eq("user_id", user.id)
      .order("next_due_date", { ascending: true });
    if (error) {
      console.error(error);
      toast.error("Failed to load bills");
    } else {
      setBills((data as RecurringBill[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createBill = async (input: {
    name: string;
    amount: number;
    category: string;
    frequency: string;
    next_due_date: string;
    notes?: string;
  }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("recurring_bills")
      .insert({ ...input, user_id: user.id, notes: input.notes ?? null })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add bill");
      return null;
    }
    setBills((prev) => [...prev, data as RecurringBill].sort((a, b) => a.next_due_date.localeCompare(b.next_due_date)));
    return data as RecurringBill;
  };

  const updateBill = async (id: string, patch: Partial<RecurringBill>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("recurring_bills")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      toast.error("Failed to update");
      return null;
    }
    setBills((prev) => prev.map((b) => (b.id === id ? (data as RecurringBill) : b)));
    return data as RecurringBill;
  };

  const deleteBill = async (id: string) => {
    if (!user) return false;
    const { error } = await supabase.from("recurring_bills").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return false;
    }
    setBills((prev) => prev.filter((b) => b.id !== id));
    return true;
  };

  const monthlyTotal = bills
    .filter((b) => b.is_active)
    .reduce((sum, b) => {
      const amt = Number(b.amount);
      switch (b.frequency) {
        case "weekly":
          return sum + amt * 4.33;
        case "yearly":
          return sum + amt / 12;
        case "quarterly":
          return sum + amt / 3;
        default:
          return sum + amt;
      }
    }, 0);

  return { bills, loading, createBill, updateBill, deleteBill, refetch: fetch, monthlyTotal };
};
