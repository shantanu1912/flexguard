import { Home, PieChart, Target, Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
  { id: "insights", label: "Insights", icon: <PieChart className="h-5 w-5" />, path: "/insights" },
  { id: "goals", label: "Goals", icon: <Target className="h-5 w-5" />, path: "/goals" },
  { id: "coach", label: "AI Coach", icon: <Brain className="h-5 w-5" />, path: "/coach" },
  { id: "profile", label: "Profile", icon: <User className="h-5 w-5" />, path: "/profile" },
];

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-safe z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "gradient-primary text-primary-foreground shadow-glow"
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
