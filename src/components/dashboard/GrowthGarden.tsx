import { Sprout, Flower2, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavingsGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  stage: "seed" | "sprout" | "flower" | "tree";
}

const goals: SavingsGoal[] = [
  { id: "1", name: "Emergency Fund", current: 800, target: 1000, stage: "flower" },
  { id: "2", name: "New Laptop", current: 350, target: 1500, stage: "sprout" },
  { id: "3", name: "Vacation", current: 150, target: 2000, stage: "seed" },
];

const getPlantIcon = (stage: SavingsGoal["stage"], progress: number) => {
  switch (stage) {
    case "seed":
      return <div className="text-3xl animate-pulse">🌱</div>;
    case "sprout":
      return <Sprout className="h-8 w-8 text-garden-leaf animate-sway" />;
    case "flower":
      return <Flower2 className="h-8 w-8 text-garden-flower animate-float" />;
    case "tree":
      return <TreeDeciduous className="h-8 w-8 text-garden-leaf" />;
    default:
      return <div className="text-3xl">🌱</div>;
  }
};

const GrowthGarden = () => {
  return (
    <div className="mx-5 mt-6 rounded-2xl bg-card p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Growth Garden 🌿</h3>
          <p className="text-xs text-muted-foreground">Watch your savings bloom</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          + New Goal
        </Button>
      </div>
      
      {/* Garden Scene */}
      <div className="relative h-32 rounded-xl bg-gradient-to-b from-garden-sky/30 to-secondary overflow-hidden mb-4">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-garden-soil/30 to-transparent" />
        
        {/* Plants positioned along the ground */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-around items-end px-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.id} className="flex flex-col items-center">
                <div className="mb-1">{getPlantIcon(goal.stage, progress)}</div>
                <span className="text-[10px] font-medium text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full">
                  {Math.round(progress)}%
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-3 right-4 text-xl animate-float" style={{ animationDelay: "0.5s" }}>☀️</div>
        <div className="absolute top-6 left-6 text-sm opacity-60">☁️</div>
        <div className="absolute top-4 left-16 text-xs opacity-40">☁️</div>
      </div>
      
      {/* Goal List */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                {getPlantIcon(goal.stage, progress)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground truncate">{goal.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ${goal.current} / ${goal.target}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GrowthGarden;
