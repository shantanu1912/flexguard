import { ArrowUpRight, ArrowDownRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
}

const BalanceCard = ({ balance, income, expenses }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mx-5 rounded-3xl gradient-hero p-6 text-primary-foreground shadow-lg animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm opacity-90">Total Balance</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-white/20"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      
      <h2 className="text-4xl font-bold mb-6">
        {showBalance ? formatCurrency(balance) : "••••••"}
      </h2>
      
      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl bg-white/15 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <span className="text-xs opacity-80">Income</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(income)}</p>
        </div>
        
        <div className="flex-1 rounded-2xl bg-white/15 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <span className="text-xs opacity-80">Expenses</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(expenses)}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
