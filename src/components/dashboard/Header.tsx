import { useState } from "react";
import { Bell, Settings, Shield, LogOut, User as UserIcon, Sparkles, TrendingDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  userName: string;
}

const sampleNotifications = [
  {
    id: "1",
    icon: TrendingDown,
    title: "You spent 18% more on Food this week",
    time: "2h ago",
    color: "text-warning",
  },
  {
    id: "2",
    icon: Target,
    title: "Emergency Fund is 80% complete 🎉",
    time: "1d ago",
    color: "text-success",
  },
  {
    id: "3",
    icon: Sparkles,
    title: "New AI insight ready for you",
    time: "2d ago",
    color: "text-primary",
  },
];

const Header = ({ userName }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(true);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <header className="px-5 py-4 space-y-3">
      {/* App Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl gradient-primary animate-gradient-shift flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">FlexGuard</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">AI Financial Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Popover onOpenChange={(open) => open && setUnread(false)}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 press-down">
                <Bell className="h-5 w-5 transition-transform hover:animate-wiggle" />
                {unread && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent">
                    <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <p className="font-semibold text-sm">Notifications</p>
                <button
                  onClick={() => toast.success("All marked as read")}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      className="w-full flex items-start gap-3 p-3 hover:bg-secondary transition-colors text-left border-b border-border last:border-0"
                    >
                      <Icon className={`h-5 w-5 mt-0.5 ${n.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 press-down">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <UserIcon className="h-4 w-4 mr-2" />
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* User Greeting */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <span className="text-sm font-semibold text-foreground">{userName} 👋</span>
      </div>
    </header>
  );
};

export default Header;
