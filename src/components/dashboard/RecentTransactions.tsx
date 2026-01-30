import { ShoppingBag, Coffee, Utensils, Car, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  icon: React.ReactNode;
  emotionTag?: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    name: "Spotify Premium",
    category: "Entertainment",
    amount: -9.99,
    date: "Today",
    icon: <Music className="h-4 w-4" />,
  },
  {
    id: "2",
    name: "Starbucks",
    category: "Food & Drink",
    amount: -6.50,
    date: "Today",
    icon: <Coffee className="h-4 w-4" />,
    emotionTag: "😤 Stress buy",
  },
  {
    id: "3",
    name: "Uber Eats",
    category: "Food & Drink",
    amount: -24.99,
    date: "Yesterday",
    icon: <Utensils className="h-4 w-4" />,
  },
  {
    id: "4",
    name: "ZARA",
    category: "Shopping",
    amount: -89.00,
    date: "Yesterday",
    icon: <ShoppingBag className="h-4 w-4" />,
    emotionTag: "🤑 FOMO buy",
  },
  {
    id: "5",
    name: "Gas Station",
    category: "Transport",
    amount: -45.00,
    date: "2 days ago",
    icon: <Car className="h-4 w-4" />,
  },
];

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
    default:
      return "bg-secondary text-foreground";
  }
};

const RecentTransactions = () => {
  return (
    <div className="mx-5 mt-6 mb-24 animate-slide-up" style={{ animationDelay: "0.4s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary font-medium">View all</button>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", getCategoryColor(transaction.category))}>
              {transaction.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">{transaction.name}</span>
                {transaction.emotionTag && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium whitespace-nowrap">
                    {transaction.emotionTag}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{transaction.date}</span>
            </div>
            
            <span className={cn(
              "text-sm font-semibold",
              transaction.amount < 0 ? "text-foreground" : "text-success"
            )}>
              {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
