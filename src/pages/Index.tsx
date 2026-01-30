import Header from "@/components/dashboard/Header";
import BalanceCard from "@/components/dashboard/BalanceCard";
import EmotionTracker from "@/components/dashboard/EmotionTracker";
import GrowthGarden from "@/components/dashboard/GrowthGarden";
import InsightCards from "@/components/dashboard/InsightCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import BottomNavigation from "@/components/dashboard/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header userName="Alex" />
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
