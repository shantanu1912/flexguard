import { useState } from "react";
import { Plus, Calendar as CalendarIcon, Trash2, Power, Loader2, Repeat, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useRecurringBills } from "@/hooks/useRecurringBills";
import { toast } from "sonner";
import { format, differenceInDays, addDays, addMonths, addWeeks, addYears } from "date-fns";

const CATEGORIES = ["Subscription", "Rent", "EMI", "Utilities", "Insurance", "Other"];
const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const advanceDate = (date: string, freq: string): string => {
  const d = new Date(date);
  let next: Date;
  switch (freq) {
    case "weekly": next = addWeeks(d, 1); break;
    case "quarterly": next = addMonths(d, 3); break;
    case "yearly": next = addYears(d, 1); break;
    default: next = addMonths(d, 1);
  }
  return format(next, "yyyy-MM-dd");
};

const Recurring = () => {
  const { bills, loading, createBill, updateBill, deleteBill, monthlyTotal } = useRecurringBills();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Subscription",
    frequency: "monthly",
    next_due_date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    notes: "",
  });

  const handleSave = async () => {
    const amt = Number(form.amount);
    if (!form.name.trim()) return toast.error("Name required");
    if (!amt || amt <= 0) return toast.error("Amount must be > 0");
    const r = await createBill({
      name: form.name.trim(),
      amount: amt,
      category: form.category,
      frequency: form.frequency,
      next_due_date: form.next_due_date,
      notes: form.notes || undefined,
    });
    if (r) {
      toast.success("Bill added");
      setDialogOpen(false);
      setForm({
        name: "",
        amount: "",
        category: "Subscription",
        frequency: "monthly",
        next_due_date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
        notes: "",
      });
    }
  };

  const handleMarkPaid = async (billId: string, currentDue: string, freq: string) => {
    const next = advanceDate(currentDue, freq);
    const r = await updateBill(billId, { next_due_date: next });
    if (r) toast.success(`Marked paid · next due ${format(new Date(next), "MMM d")}`);
  };

  const today = new Date();
  const upcoming = bills.filter((b) => b.is_active);
  const dueSoon = upcoming.filter((b) => differenceInDays(new Date(b.next_due_date), today) <= 7);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recurring</h1>
          <p className="text-sm text-muted-foreground">Subscriptions & bills</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </header>

      {/* Total */}
      <div className="mx-5 rounded-2xl gradient-hero p-5 text-primary-foreground mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Repeat className="h-4 w-4" />
          <span className="text-sm">Avg monthly outflow</span>
        </div>
        <h2 className="text-3xl font-bold mb-1">{formatINR(monthlyTotal)}</h2>
        <p className="text-sm opacity-80">across {upcoming.length} active subscriptions</p>
      </div>

      {/* Due soon */}
      {dueSoon.length > 0 && (
        <div className="mx-5 rounded-2xl bg-warning/10 border border-warning/30 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 text-warning">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Due in next 7 days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {dueSoon.length} bill{dueSoon.length > 1 ? "s" : ""} totaling{" "}
            <span className="font-semibold text-foreground">
              {formatINR(dueSoon.reduce((s, b) => s + Number(b.amount), 0))}
            </span>
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : bills.length === 0 ? (
        <div className="mx-5 rounded-2xl bg-card p-8 text-center shadow-sm">
          <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No recurring bills</p>
          <p className="text-xs text-muted-foreground mb-4">
            Track Netflix, rent, EMIs and never miss a payment
          </p>
          <Button variant="gradient" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add first bill
          </Button>
        </div>
      ) : (
        <div className="mx-5 space-y-3">
          {bills.map((b) => {
            const days = differenceInDays(new Date(b.next_due_date), today);
            const isOverdue = days < 0;
            const isSoon = days >= 0 && days <= 7;
            return (
              <div
                key={b.id}
                className={`rounded-2xl bg-card p-4 shadow-sm hover-lift ${
                  !b.is_active ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{b.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium uppercase">
                        {b.frequency}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.category}</p>
                  </div>
                  <span className="font-bold text-foreground">{formatINR(Number(b.amount))}</span>
                </div>
                <div className="flex items-center gap-1 text-xs mb-3">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span
                    className={
                      isOverdue
                        ? "text-destructive font-medium"
                        : isSoon
                        ? "text-warning font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {isOverdue
                      ? `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`
                      : days === 0
                      ? "Due today"
                      : `Due in ${days} day${days === 1 ? "" : "s"} · ${format(new Date(b.next_due_date), "MMM d")}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {b.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleMarkPaid(b.id, b.next_due_date, b.frequency)}
                    >
                      Mark paid
                    </Button>
                  )}
                  <button
                    onClick={() => updateBill(b.id, { is_active: !b.is_active })}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
                    aria-label="Toggle active"
                    title={b.is_active ? "Pause" : "Resume"}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBill(b.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add recurring bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Netflix, Rent"
              />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Next due date</Label>
              <Input
                type="date"
                value={form.next_due_date}
                onChange={(e) => setForm((f) => ({ ...f, next_due_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSave}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default Recurring;
