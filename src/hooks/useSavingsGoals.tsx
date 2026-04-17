import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note: string | null;
  contributed_at: string;
}

export const useSavingsGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Failed to load goals");
    } else {
      setGoals((data as SavingsGoal[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createGoal = async (input: { name: string; emoji: string; target_amount: number; deadline?: string | null }) => {
    if (!user) {
      toast.error("Please sign in");
      return null;
    }
    const { data, error } = await supabase
      .from("savings_goals")
      .insert({
        user_id: user.id,
        name: input.name,
        emoji: input.emoji,
        target_amount: input.target_amount,
        deadline: input.deadline ?? null,
      })
      .select()
      .single();
    if (error) {
      toast.error("Failed to create goal");
      return null;
    }
    setGoals((prev) => [data as SavingsGoal, ...prev]);
    toast.success("Goal created 🌱");
    return data as SavingsGoal;
  };

  const deleteGoal = async (id: string) => {
    if (!user) return false;
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete goal");
      return false;
    }
    setGoals((prev) => prev.filter((g) => g.id !== id));
    return true;
  };

  const contributeToGoal = async (goalId: string, amount: number, note?: string) => {
    if (!user) return null;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    const { data: contribution, error: cErr } = await supabase
      .from("goal_contributions")
      .insert({ goal_id: goalId, user_id: user.id, amount, note: note ?? null })
      .select()
      .single();
    if (cErr) {
      toast.error("Failed to add contribution");
      return null;
    }

    const newAmount = Number(goal.current_amount) + Number(amount);
    const isComplete = newAmount >= Number(goal.target_amount);
    const { data: updatedGoal, error: gErr } = await supabase
      .from("savings_goals")
      .update({
        current_amount: newAmount,
        status: isComplete ? "completed" : goal.status,
      })
      .eq("id", goalId)
      .select()
      .single();
    if (gErr) {
      console.error(gErr);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === goalId ? (updatedGoal as SavingsGoal) : g)));
    }
    return { contribution, isComplete };
  };

  return { goals, loading, createGoal, deleteGoal, contributeToGoal, refetch: fetch };
};
