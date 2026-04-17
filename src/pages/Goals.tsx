import { useState } from "react";
import { Plus, Sprout, Flower2, TreeDeciduous, Target, Trash2, Loader2, PiggyBank } from "lucide-react";
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
import NewGoalDialog from "@/components/goals/NewGoalDialog";
import { useSavingsGoals, SavingsGoal } from "@/hooks/useSavingsGoals";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getStage = (current: number, target: number): "seed" | "sprout" | "flower" | "tree" => {
  const pct = (current / target) * 100;
  if (pct >= 100) return "tree";
  if (pct >= 60) return "flower";
  if (pct >= 25) return "sprout";
  return "seed";
};

const stageIcon = (stage: ReturnType<typeof getStage>) => {
  switch (stage) {
    case "seed": return <span className="text-2xl">🌱</span>;
    case "sprout": return <Sprout className="h-6 w-6 text-garden-leaf" />;
    case "flower": return <Flower2 className="h-6 w-6 text-garden-flower" />;
    case "tree": return <TreeDeciduous className="h-6 w-6 text-garden-leaf" />;
  }
};

const Goals = () => {
  const { goals, loading, createGoal, deleteGoal, contributeToGoal } = useSavingsGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fireConfetti = () => {
    const end = Date.now() + 800;
    const colors = ["#10b981", "#34d399", "#f59e0b", "#ef4444"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleCreate = async (name: string, target: number, emoji: string, deadline?: string) => {
    await createGoal({ name, target_amount: target, emoji, deadline });
  };

  const handleContribute = async () => {
    if (!contribGoal) return;
    const amt = Number(contribAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const result = await contributeToGoal(contribGoal.id, amt);
    if (result) {
      toast.success(`+${formatINR(amt)} added to ${contribGoal.name}`);
      if (result.isComplete) {
        fireConfetti();
        setTimeout(() => toast.success("🎉 Goal completed! Tree grown 🌳"), 200);
      }
      setContribGoal(null);
      setContribAmount("");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const ok = await deleteGoal(confirmDelete);
    if (ok) toast.success("Goal removed");
    setConfirmDelete(null);
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const overallPct = totalTarget ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground">Grow your savings garden</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </header>

      {/* Summary */}
      <div className="mx-5 rounded-2xl gradient-hero p-5 text-primary-foreground mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4" />
          <span className="text-sm opacity-90">Total Progress</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">{formatINR(totalSaved)}</h2>
        <p className="text-sm opacity-80">of {formatINR(totalTarget)} goal</p>
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${Math.min(overallPct, 100)}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <div className="mx-5 rounded-2xl bg-card p-8 text-center shadow-sm">
          <span className="text-5xl block mb-3">🌱</span>
          <p className="text-sm font-medium text-foreground mb-1">No goals yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Plant your first savings seed and watch it grow
          </p>
          <Button variant="gradient" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Create your first goal
          </Button>
        </div>
      ) : (
        <div className="mx-5 space-y-4">
          {goals.map((goal) => {
            const current = Number(goal.current_amount);
            const target = Number(goal.target_amount);
            const progress = (current / target) * 100;
            const stage = getStage(current, target);
            const isComplete = progress >= 100;
            return (
              <div key={goal.id} className="rounded-2xl bg-card p-5 shadow-sm hover-lift">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                    {goal.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{goal.name}</h3>
                      {stageIcon(stage)}
                      {isComplete && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">
                          Done 🎉
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formatINR(current)} of {formatINR(target)}
                    </p>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all duration-700"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
                      <div className="flex gap-1">
                        {!isComplete && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => setContribGoal(goal)}
                          >
                            <PiggyBank className="h-3 w-3" /> Add
                          </Button>
                        )}
                        <button
                          onClick={() => setConfirmDelete(goal.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                          aria-label="Delete goal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleCreate} />

      {/* Contribute */}
      <Dialog open={!!contribGoal} onOpenChange={(o) => !o && setContribGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add to {contribGoal?.emoji} {contribGoal?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                placeholder="500"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000, 5000].map((q) => (
                <button
                  key={q}
                  onClick={() => setContribAmount(String(q))}
                  className="flex-1 py-1.5 text-xs rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  ₹{q}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContribGoal(null)}>Cancel</Button>
            <Button variant="gradient" onClick={handleContribute}>Add to goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              All contributions will also be removed. This cannot be undone.
            </AlertDialogDescription>
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

export default Goals;
