import { Bell, Settings, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userName: string;
}

const Header = ({ userName }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

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
          <Button variant="ghost" size="icon" className="relative h-9 w-9 press-down">
            <Bell className="h-5 w-5 transition-transform hover:animate-wiggle" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
