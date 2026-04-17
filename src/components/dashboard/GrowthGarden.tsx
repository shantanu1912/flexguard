import { Sprout, Flower2, TreeDeciduous, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSavingsGoals, SavingsGoal } from "@/hooks/useSavingsGoals";

const getStage = (current: number, target: number): "seed" | "sprout" | "flower" | "tree" => {
  const pct = (current / target) * 100;
  if (pct >= 100) return "tree";
  if (pct >= 60) return "flower";
  if (pct >= 25) return "sprout";
  return "seed";
};

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const getPlantIcon = (stage: ReturnType<typeof getStage>) => {
  switch (stage) {
    case "seed":
      return <div className="text-3xl animate-pulse">🌱</div>;
    case "sprout":
      return <Sprout className="h-8 w-8 text-garden-leaf animate-sway" />;
    case "flower":
      return <Flower2 className="h-8 w-8 text-garden-flower animate-float" />;
    case "tree":
      return <TreeDeciduous className="h-8 w-8 text-garden-leaf" />;
  }
};

const GrowthGarden = () => {
  const navigate = useNavigate();
  const { goals, loading } = useSavingsGoals();

  const displayGoals = goals.slice(0, 3);

  return (
    <div className="mx-5 mt-6 rounded-2xl bg-card p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Growth Garden 🌿</h3>
          <p className="text-xs text-muted-foreground">Watch your savings bloom</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/goals")}>
          + New Goal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : displayGoals.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl block mb-2">🌱</span>
          <p className="text-sm text-muted-foreground mb-3">Plant your first savings seed</p>
          <Button variant="gradient" size="sm" onClick={() => navigate("/goals")}>
            Create a Goal
          </Button>
        </div>
      ) : (
        <>
          {/* Garden Scene */}
          <div className="relative h-32 rounded-xl bg-gradient-to-b from-garden-sky/30 to-secondary overflow-hidden mb-4">
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-garden-soil/30 to-transparent" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-around items-end px-4">
              {displayGoals.map((goal) => {
                const current = Number(goal.current_amount);
                const target = Number(goal.target_amount);
                const progress = (current / target) * 100;
                const stage = getStage(current, target);
                return (
                  <div key={goal.id} className="flex flex-col items-center">
                    <div className="mb-1">{getPlantIcon(stage)}</div>
                    <span className="text-[10px] font-medium text-muted-foreground bg-card/80 px-2 py-0.5 rounded-full">
                      {Math.round(progress)}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-3 right-4 text-xl animate-float" style={{ animationDelay: "0.5s" }}>☀️</div>
            <div className="absolute top-6 left-6 text-sm opacity-60">☁️</div>
          </div>

          {/* Goal List */}
          <div className="space-y-3">
            {displayGoals.map((goal) => {
              const current = Number(goal.current_amount);
              const target = Number(goal.target_amount);
              const progress = (current / target) * 100;
              const stage = getStage(current, target);
              return (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-secondary/50 p-2 -mx-2 rounded-xl transition-colors"
                  onClick={() => navigate("/goals")}
                >
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-xl">
                    {goal.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{goal.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatINR(current)} / {formatINR(target)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default GrowthGarden;
