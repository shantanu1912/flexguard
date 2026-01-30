import { useState } from "react";
import { Plus, Sprout, Flower2, TreeDeciduous, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import NewGoalDialog from "@/components/goals/NewGoalDialog";

interface SavingsGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  stage: "seed" | "sprout" | "flower" | "tree";
  emoji: string;
}

const initialGoals: SavingsGoal[] = [
  { id: "1", name: "Emergency Fund", current: 800, target: 1000, stage: "flower", emoji: "🛡️" },
  { id: "2", name: "New Laptop", current: 350, target: 1500, stage: "sprout", emoji: "💻" },
  { id: "3", name: "Vacation", current: 150, target: 2000, stage: "seed", emoji: "✈️" },
];

const getPlantIcon = (stage: SavingsGoal["stage"]) => {
  switch (stage) {
    case "seed":
      return <div className="text-2xl">🌱</div>;
    case "sprout":
      return <Sprout className="h-6 w-6 text-garden-leaf" />;
    case "flower":
      return <Flower2 className="h-6 w-6 text-garden-flower" />;
    case "tree":
      return <TreeDeciduous className="h-6 w-6 text-garden-leaf" />;
  }
};

const Goals = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddGoal = (name: string, target: number, emoji: string) => {
    const newGoal: SavingsGoal = {
      id: Date.now().toString(),
      name,
      current: 0,
      target,
      stage: "seed",
      emoji,
    };
    setGoals([...goals, newGoal]);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground">Grow your savings garden</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </header>

      {/* Summary Card */}
      <div className="mx-5 rounded-2xl gradient-hero p-5 text-primary-foreground mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4" />
          <span className="text-sm opacity-90">Total Progress</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">${totalSaved.toLocaleString()}</h2>
        <p className="text-sm opacity-80">of ${totalTarget.toLocaleString()} goal</p>
        <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${(totalSaved / totalTarget) * 100}%` }}
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="mx-5 space-y-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-card p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {goal.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{goal.name}</h3>
                    {getPlantIcon(goal.stage)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                  </p>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NewGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleAddGoal} />
      <BottomNavigation />
    </div>
  );
};

export default Goals;
