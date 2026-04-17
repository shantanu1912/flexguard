import { useState, useMemo } from "react";
import { Search, Plus, Trash2, Pencil, Download, Loader2, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { toast } from "sonner";
import { format } from "date-fns";

const CATEGORIES = ["Food & Drink", "Shopping", "Entertainment", "Transport", "Bills & Utilities", "Health", "Salary", "Other"];

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Transactions = () => {
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Other",
    amount: "",
    transaction_type: "expense" as "income" | "expense",
    notes: "",
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", category: "Other", amount: "", transaction_type: "expense", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      name: t.name,
      category: t.category,
      amount: String(t.amount),
      transaction_type: t.transaction_type,
      notes: t.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const amt = Number(form.amount);
    if (!form.name.trim()) return toast.error("Name is required");
    if (!amt || amt <= 0) return toast.error("Amount must be greater than 0");

    if (editing) {
      const r = await updateTransaction(editing.id, {
        name: form.name.trim(),
        category: form.category,
        amount: amt,
        transaction_type: form.transaction_type,
        notes: form.notes || undefined,
      });
      if (r) {
        toast.success("Transaction updated");
        setDialogOpen(false);
      }
    } else {
      const r = await createTransaction({
        name: form.name.trim(),
        category: form.category,
        amount: amt,
        transaction_type: form.transaction_type,
        notes: form.notes || undefined,
      });
      if (r) {
        toast.success("Transaction added");
        setDialogOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const ok = await deleteTransaction(confirmDelete);
    if (ok) toast.success("Transaction deleted");
    setConfirmDelete(null);
  };

  const filtered = useMemo(() => {
    let list = transactions;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q)
      );
    }
    if (filterCategory !== "all") list = list.filter((t) => t.category === filterCategory);
    if (typeFilter !== "all") list = list.filter((t) => t.transaction_type === typeFilter);

    list = [...list].sort((a, b) => {
      const da = new Date(a.transaction_date).getTime();
      const db = new Date(b.transaction_date).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });
    return list;
  }, [transactions, search, filterCategory, typeFilter, sortDir]);

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const headers = ["Date", "Name", "Category", "Type", "Amount (INR)", "Notes"];
    const rows = filtered.map((t) => [
      format(new Date(t.transaction_date), "yyyy-MM-dd"),
      `"${t.name.replace(/"/g, '""')}"`,
      t.category,
      t.transaction_type,
      Number(t.amount).toString(),
      `"${(t.notes ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flexguard-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {transactions.length}</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={exportCSV} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="gradient" size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="mx-5 space-y-3 mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="flex-1">
              <Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            title="Toggle sort"
          >
            {sortDir === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
          </Button>
        </div>
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-5 rounded-2xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">No transactions match your filters</p>
        </div>
      ) : (
        <div className="mx-5 space-y-2">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group rounded-xl bg-card p-3 shadow-sm flex items-center gap-3 hover-lift"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">{t.name}</span>
                  {t.emotion_tag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-medium">
                      {t.emotion_tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{t.category}</span>
                  <span>·</span>
                  <span>{format(new Date(t.transaction_date), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-semibold ${
                    t.transaction_type === "income" ? "text-success" : "text-foreground"
                  }`}
                >
                  {t.transaction_type === "income" ? "+" : "-"}
                  {formatINR(Number(t.amount))}
                </span>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(t)}
                  className="p-1 text-muted-foreground hover:text-primary"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(t.id)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Tabs
              value={form.transaction_type}
              onValueChange={(v) => setForm((f) => ({ ...f, transaction_type: v as "income" | "expense" }))}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="expense">Expense</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Coffee at Starbucks"
              />
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="500"
              />
            </div>
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
              <Label>Notes (optional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Anything to remember..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSave}>
              {editing ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default Transactions;
