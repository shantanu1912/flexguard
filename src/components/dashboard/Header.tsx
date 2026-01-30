import { Bell, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userName: string;
}

const Header = ({ userName }: HeaderProps) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="px-5 py-4 space-y-3">
      {/* App Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">FlexGuard</h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">AI Financial Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
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
