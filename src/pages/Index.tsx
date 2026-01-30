import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import EmotionTracker from "@/components/dashboard/EmotionTracker";
import GrowthGarden from "@/components/dashboard/GrowthGarden";
import InsightCards from "@/components/dashboard/InsightCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("User");

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header userName={displayName} />
      <BalanceCard balance={4250} income={5200} expenses={950} />
      <EmotionTracker />
      <GrowthGarden />
      <InsightCards />
      <RecentTransactions />
      <BottomNavigation />
    </div>
  );
};

export default Index;
