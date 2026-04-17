import { useState, useMemo } from "react";
import { Plus, Wallet, AlertTriangle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";

const CATEGORIES = ["Food & Drink", "Shopping", "Entertainment", "Transport", "Bills & Utilities", "Health", "Other"];

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Budgets = () => {
  const { budgets, loading, upsertBudget, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState("");

  // Compute spending per category for current month
  const monthlySpend = useMemo(() => {
    const now = new Date();
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.transaction_type === "expense")
      .filter((t) => {
        const d = new Date(t.transaction_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + Number(t.amount);
      });
    return map;
  }, [transactions]);

  const totalLimit = budgets.reduce((s, b) => s + Number(b.limit_amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + (monthlySpend[b.category] ?? 0), 0);
  const safeToSpend = Math.max(totalLimit - totalSpent, 0);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const daysLeft = Math.max(daysInMonth - today + 1, 1);
  const dailySafe = safeToSpend / daysLeft;

  const handleSave = async () => {
    const num = Number(limit);
    if (!num || num <= 0) {
      toast.error("Enter a valid limit");
      return;
    }
    const result = await upsertBudget(category, num);
    if (result) {
      toast.success("Budget saved");
      setLimit("");
      setDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
          <p className="text-sm text-muted-foreground">Stay in control this month</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </header>

      {/* Safe-to-spend hero */}
      <div className="mx-5 rounded-2xl gradient-hero p-5 text-primary-foreground mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Wallet className="h-4 w-4" />
          <span className="text-sm">Safe to spend this month</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">{formatINR(safeToSpend)}</h2>
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>~{formatINR(dailySafe)}/day</span>
          <span>{daysLeft} days left</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: totalLimit ? `${Math.min((totalSpent / totalLimit) * 100, 100)}%` : "0%" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="mx-5 rounded-2xl bg-card p-8 text-center shadow-sm">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No budgets yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Create category budgets to get smart spending alerts
          </p>
          <Button variant="gradient" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Create your first budget
          </Button>
        </div>
      ) : (
        <div className="mx-5 space-y-3">
          {budgets.map((b) => {
            const spent = monthlySpend[b.category] ?? 0;
            const pct = (spent / Number(b.limit_amount)) * 100;
            const isOver = pct >= 100;
            const isNear = pct >= 80 && !isOver;
            return (
              <div key={b.id} className="rounded-2xl bg-card p-4 shadow-sm hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{b.category}</span>
                    {isOver && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
                        <AlertTriangle className="h-3 w-3" /> Over
                      </span>
                    )}
                    {isNear && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-medium">
                        <AlertTriangle className="h-3 w-3" /> Near limit
                      </span>
                    )}
                    {pct < 50 && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">
                        <CheckCircle2 className="h-3 w-3" /> On track
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Delete budget"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    {formatINR(spent)} of {formatINR(Number(b.limit_amount))}
                  </span>
                  <span className={`font-medium ${isOver ? "text-destructive" : "text-foreground"}`}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? "bg-destructive" : isNear ? "bg-warning" : "gradient-primary"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set monthly budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monthly limit (₹)</Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default Budgets;
