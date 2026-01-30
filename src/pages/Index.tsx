import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import EmotionTracker from "@/components/dashboard/EmotionTracker";
import GrowthGarden from "@/components/dashboard/GrowthGarden";
import InsightCards from "@/components/dashboard/InsightCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import FloatingScanButton from "@/components/scanner/FloatingScanButton";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useTransactions";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("User");
  const { createTransaction, totals } = useTransactions();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();
        
        if (data?.display_name) {
          setDisplayName(data.display_name);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleExpenseAdded = async (expense: {
    name: string;
    category: string;
    amount: number;
    payeeVpa: string;
  }) => {
    const result = await createTransaction({
      name: expense.name,
      category: expense.category,
      amount: expense.amount,
      payee_vpa: expense.payeeVpa,
      transaction_type: "expense",
    });

    if (result) {
      toast.success(`₹${expense.amount.toLocaleString("en-IN")} expense saved!`);
    }
  };

  if (!user) {
    return null;
  }

  // Use real totals if available, otherwise show placeholder values
  const balance = totals.balance || 85000;
  const income = totals.income || 125000;
  const expenses = totals.expenses || 40000;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header userName={displayName} />
      <BalanceCard balance={balance} income={income} expenses={expenses} />
      <EmotionTracker />
      <GrowthGarden />
      <InsightCards />
      <RecentTransactions />
      <FloatingScanButton onExpenseAdded={handleExpenseAdded} />
      <BottomNavigation />
    </div>
  );
};

export default Index;
