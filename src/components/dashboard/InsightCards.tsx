import { TrendingUp, AlertTriangle, Trophy, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Insight {
  id: string;
  type: "success" | "warning" | "tip" | "achievement";
  title: string;
  description: string;
  icon: React.ReactNode;
}

const insights: Insight[] = [
  {
    id: "1",
    type: "warning",
    title: "Upcoming Payment",
    description: "Netflix subscription renews in 3 days ($15.99)",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    id: "2",
    type: "achievement",
    title: "7-Day Streak! 🔥",
    description: "No impulse purchases this week. Keep it up!",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: "3",
    type: "success",
    title: "Savings Goal",
    description: "You saved $127 more than last month!",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "4",
    type: "tip",
    title: "Smart Tip",
    description: "Try the 48-hour rule before buying items over $50",
    icon: <Lightbulb className="h-5 w-5" />,
  },
];

const getInsightStyles = (type: Insight["type"]) => {
  switch (type) {
    case "success":
      return "bg-success/10 border-success/30 text-success";
    case "warning":
      return "bg-warning/10 border-warning/30 text-warning";
    case "achievement":
      return "bg-accent/10 border-accent/30 text-accent";
    case "tip":
      return "bg-info/10 border-info/30 text-info";
    default:
      return "bg-secondary border-border text-foreground";
  }
};

const InsightCards = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-5 mt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Quick Insights</h3>
        <button 
          className="text-sm text-primary font-medium hover:underline"
          onClick={() => navigate("/insights")}
        >
          See all
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory">
        {insights.map((insight, index) => (
          <div
            key={insight.id}
            className={cn(
              "min-w-[200px] max-w-[200px] p-4 rounded-2xl border snap-start cursor-pointer hover:scale-[1.02] transition-transform",
              getInsightStyles(insight.type)
            )}
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            onClick={() => navigate("/insights")}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-current/10">{insight.icon}</div>
              <span className="text-sm font-semibold">{insight.title}</span>
            </div>
            <p className="text-xs opacity-80">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightCards;
