import { ShoppingBag, Coffee, Utensils, Car, Music, Heart, Zap, MoreHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { formatDistanceToNow } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Entertainment":
      return <Music className="h-4 w-4" />;
    case "Food & Drink":
      return <Coffee className="h-4 w-4" />;
    case "Shopping":
      return <ShoppingBag className="h-4 w-4" />;
    case "Transport":
      return <Car className="h-4 w-4" />;
    case "Health":
      return <Heart className="h-4 w-4" />;
    case "Bills & Utilities":
      return <Zap className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Entertainment":
      return "bg-accent/15 text-accent";
    case "Food & Drink":
      return "bg-warning/15 text-warning";
    case "Shopping":
      return "bg-garden-flower/15 text-garden-flower";
    case "Transport":
      return "bg-info/15 text-info";
    case "Health":
      return "bg-success/15 text-success";
    case "Bills & Utilities":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-secondary text-foreground";
  }
};

const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Recently";
  }
};

const RecentTransactions = () => {
  const navigate = useNavigate();
  const { transactions, loading } = useTransactions();

  // Take only the 5 most recent
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="mx-5 mt-6 mb-24 animate-slide-up" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button 
          className="text-sm text-primary font-medium hover:underline"
          onClick={() => navigate("/insights")}
        >
          View all
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : recentTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No transactions yet</p>
          <p className="text-xs mt-1">Scan a UPI QR code to log your first expense</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => navigate("/insights")}
            >
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", getCategoryColor(transaction.category))}>
                {getCategoryIcon(transaction.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{transaction.name}</span>
                  {transaction.emotion_tag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium whitespace-nowrap">
                      {transaction.emotion_tag}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(transaction.transaction_date)}</span>
              </div>
              
              <span className={cn(
                "text-sm font-semibold",
                transaction.transaction_type === "expense" ? "text-foreground" : "text-success"
              )}>
                {transaction.transaction_type === "expense" ? "-" : "+"}{formatCurrency(Number(transaction.amount))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
