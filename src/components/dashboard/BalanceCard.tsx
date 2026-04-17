import { ArrowUpRight, ArrowDownRight, Eye, EyeOff, Sparkles } from "lucide-react";
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
    <div className="relative mx-5 rounded-3xl gradient-hero animate-gradient-shift p-6 text-primary-foreground shadow-lg animate-slide-up overflow-hidden shine-overlay">
      {/* Ambient blobs */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-blob pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-accent/20 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: "2s" }} />

      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 opacity-90 animate-bounce-soft" />
          <p className="text-sm opacity-90">Total Balance</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-white/20 press-down"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      <h2 key={String(showBalance) + balance} className="relative text-4xl font-bold mb-6 tracking-tight animate-count-up">
        {showBalance ? formatCurrency(balance) : "••••••"}
      </h2>

      <div className="relative flex gap-4">
        <div className="group flex-1 rounded-2xl bg-white/15 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5 cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <span className="text-xs opacity-80">Income</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(income)}</p>
        </div>

        <div className="group flex-1 rounded-2xl bg-white/15 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5 cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-white/25 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-12">
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
