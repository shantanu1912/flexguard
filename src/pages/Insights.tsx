import { PieChart, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import BottomNavigation from "@/components/dashboard/BottomNavigation";

const spendingCategories = [
  { name: "Food & Drink", amount: 420, percentage: 35, color: "bg-warning" },
  { name: "Shopping", amount: 280, percentage: 23, color: "bg-garden-flower" },
  { name: "Entertainment", amount: 180, percentage: 15, color: "bg-accent" },
  { name: "Transport", amount: 150, percentage: 12, color: "bg-info" },
  { name: "Other", amount: 170, percentage: 15, color: "bg-muted-foreground" },
];

const Insights = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4">
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">Your spending analysis</p>
      </header>

      {/* Monthly Overview */}
      <div className="mx-5 rounded-2xl gradient-hero p-5 text-primary-foreground mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm opacity-90">January 2026</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">$1,200</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-300" />
            <span className="text-sm">12% less than last month</span>
          </div>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="mx-5 rounded-2xl bg-card p-5 shadow-sm mb-6">
        <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {spendingCategories.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
                <span className="text-sm text-muted-foreground">${cat.amount}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div className="mx-5 rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Spending Trends</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-success/10 border border-success/30">
            <TrendingDown className="h-5 w-5 text-success mb-2" />
            <p className="text-xs text-muted-foreground">Shopping</p>
            <p className="text-lg font-bold text-success">-24%</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <TrendingUp className="h-5 w-5 text-destructive mb-2" />
            <p className="text-xs text-muted-foreground">Food & Drink</p>
            <p className="text-lg font-bold text-destructive">+18%</p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Insights;
