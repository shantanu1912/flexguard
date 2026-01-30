import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import BottomNavigation from "@/components/dashboard/BottomNavigation";

const menuItems = [
  { icon: Bell, label: "Notifications", hasToggle: true },
  { icon: Shield, label: "Privacy & Security" },
  { icon: CreditCard, label: "Connected Accounts" },
  { icon: Moon, label: "Dark Mode", hasToggle: true },
  { icon: HelpCircle, label: "Help & Support" },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </header>

      {/* Profile Card */}
      <div className="mx-5 rounded-2xl bg-card p-5 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Alex Johnson</h2>
            <p className="text-sm text-muted-foreground">alex@example.com</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">7</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">3</p>
          <p className="text-xs text-muted-foreground">Goals</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">$1.3k</p>
          <p className="text-xs text-muted-foreground">Saved</p>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-5 rounded-2xl bg-card overflow-hidden shadow-sm">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors ${
              index !== menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
            {item.hasToggle ? (
              <Switch />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div className="mx-5 mt-6">
        <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
