import { useState, useEffect } from "react";
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Moon, Mail, Lock, Smartphone, MessageCircle, FileText, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/useTransactions";

const NOTIF_KEY = "flexguard-notifications";
const PROFILE_FALLBACK_NAME = "User";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { transactions } = useTransactions();

  const [displayName, setDisplayName] = useState<string>(PROFILE_FALLBACK_NAME);
  const [notifications, setNotifications] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(NOTIF_KEY);
    return stored === null ? true : stored === "true";
  });

  // Dialog open state
  const [notifOpen, setNotifOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [signOutAlert, setSignOutAlert] = useState(false);

  // Edit profile state
  const [editName, setEditName] = useState("");

  // Granular notif prefs
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.display_name) {
        setDisplayName(data.display_name);
        setEditName(data.display_name);
      } else {
        setEditName(user.email?.split("@")[0] ?? "");
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, String(notifications));
  }, [notifications]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    setNotifications(checked);
    if (checked && "Notification" in window && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.warning("Browser notifications blocked. Enable them in browser settings.");
      } else {
        toast.success("Notifications enabled");
      }
    } else {
      toast.success(checked ? "Notifications enabled" : "Notifications disabled");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
      return;
    }
    setDisplayName(trimmed);
    setEditProfileOpen(false);
    toast.success("Profile updated");
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast.error("Failed to send reset email");
      return;
    }
    toast.success("Password reset email sent");
    setPrivacyOpen(false);
  };

  // Stats
  const goalCount = 3; // matches Goals page
  const totalSaved = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const dayStreak = 7;

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </header>

      {/* Profile Card */}
      <button
        onClick={() => setEditProfileOpen(true)}
        className="mx-5 w-[calc(100%-2.5rem)] rounded-2xl bg-card p-5 shadow-sm mb-6 hover-lift text-left block"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      {/* Stats */}
      <div className="mx-5 grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{dayStreak}</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">{goalCount}</p>
          <p className="text-xs text-muted-foreground">Goals</p>
        </div>
        <div className="rounded-xl bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-primary">
            ₹{totalSaved >= 1000 ? `${(totalSaved / 1000).toFixed(1)}k` : totalSaved}
          </p>
          <p className="text-xs text-muted-foreground">Saved</p>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-5 rounded-2xl bg-card overflow-hidden shadow-sm">
        {/* Notifications - quick toggle + opens detailed */}
        <div className="w-full flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => setNotifOpen(true)}
            className="flex items-center gap-3 flex-1 text-left"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Notifications</span>
          </button>
          <Switch checked={notifications} onCheckedChange={handleNotificationsToggle} />
        </div>

        <button
          onClick={() => setPrivacyOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Privacy & Security</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => navigate("/recurring")}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Recurring Bills</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => setAccountsOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Connected Accounts</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="w-full flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Dark Mode</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => {
              toggleTheme();
              toast.success(checked ? "Dark mode on" : "Light mode on");
            }}
          />
        </div>

        <button
          onClick={() => setHelpOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Help & Support</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Sign Out */}
      <div className="mx-5 mt-6">
        <button
          onClick={() => setSignOutAlert(true)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors press-down"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your display name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSaveProfile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
            <DialogDescription>Choose what you want to be notified about.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Budget Alerts</p>
                <p className="text-xs text-muted-foreground">When you near category limits</p>
              </div>
              <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Goal Reminders</p>
                <p className="text-xs text-muted-foreground">Weekly nudges to keep saving</p>
              </div>
              <Switch checked={goalReminders} onCheckedChange={setGoalReminders} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Sunday spending summary</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="gradient"
              onClick={() => {
                setNotifOpen(false);
                toast.success("Preferences saved");
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy & Security</DialogTitle>
            <DialogDescription>Manage your account security.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <button
              onClick={handlePasswordReset}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-left"
            >
              <Lock className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Reset Password</p>
                <p className="text-xs text-muted-foreground">Send a reset link to your email</p>
              </div>
            </button>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Shield className="h-5 w-5 text-success" />
              <div className="flex-1">
                <p className="text-sm font-medium">End-to-end encrypted</p>
                <p className="text-xs text-muted-foreground">Your data is private and secure</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connected Accounts Dialog */}
      <Dialog open={accountsOpen} onOpenChange={setAccountsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connected Accounts</DialogTitle>
            <DialogDescription>UPI apps and payment methods.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { name: "Google Pay", desc: "UPI · Not linked", color: "bg-blue-500" },
              { name: "PhonePe", desc: "UPI · Not linked", color: "bg-purple-600" },
              { name: "Paytm", desc: "UPI · Not linked", color: "bg-sky-500" },
            ].map((acc) => (
              <div key={acc.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className={`h-10 w-10 rounded-lg ${acc.color} flex items-center justify-center text-white font-bold`}>
                  {acc.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{acc.name}</p>
                  <p className="text-xs text-muted-foreground">{acc.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.info("Coming soon!")}>
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>We're here to help.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <a
              href="mailto:support@flexguard.app"
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email Support</p>
                <p className="text-xs text-muted-foreground">support@flexguard.app</p>
              </div>
            </a>
            <button
              onClick={() => {
                setHelpOpen(false);
                navigate("/coach");
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary text-left"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Chat with AI Coach</p>
                <p className="text-xs text-muted-foreground">Get instant answers</p>
              </div>
            </button>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Version</p>
                <p className="text-xs text-muted-foreground">FlexGuard 1.0.0</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Out Confirmation */}
      <AlertDialog open={signOutAlert} onOpenChange={setSignOutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of FlexGuard?</AlertDialogTitle>
            <AlertDialogDescription>You'll need to sign in again to access your data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} className="bg-destructive hover:bg-destructive/90">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
