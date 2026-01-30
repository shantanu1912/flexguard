import { useState } from "react";
import { cn } from "@/lib/utils";

const emotions = [
  { emoji: "😊", label: "Happy", color: "bg-success/20 border-success" },
  { emoji: "😔", label: "Sad", color: "bg-info/20 border-info" },
  { emoji: "😤", label: "Stressed", color: "bg-destructive/20 border-destructive" },
  { emoji: "🤑", label: "FOMO", color: "bg-warning/20 border-warning" },
  { emoji: "😌", label: "Calm", color: "bg-primary/20 border-primary" },
];

const EmotionTracker = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  return (
    <div className="mx-5 mt-6 rounded-2xl bg-card p-5 shadow-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">How are you feeling?</h3>
          <p className="text-xs text-muted-foreground">Track your emotions to understand spending triggers</p>
        </div>
        <div className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center">
          <span className="text-lg">🧠</span>
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {emotions.map((emotion) => (
          <button
            key={emotion.label}
            onClick={() => setSelectedEmotion(emotion.label)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[4.5rem] p-3 rounded-xl border-2 transition-all duration-200",
              selectedEmotion === emotion.label
                ? emotion.color
                : "bg-secondary border-transparent hover:border-primary/30"
            )}
          >
            <span className="text-2xl">{emotion.emoji}</span>
            <span className="text-xs font-medium text-foreground">{emotion.label}</span>
          </button>
        ))}
      </div>
      
      {selectedEmotion && (
        <div className="mt-4 p-3 rounded-xl bg-secondary/50 border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-medium text-primary">AI Insight:</span>{" "}
            {selectedEmotion === "FOMO" && "You're 3x more likely to overspend when feeling FOMO. Take 24hrs before big purchases!"}
            {selectedEmotion === "Stressed" && "Stress spending detected 4 times this week. Try the 5-minute breathing exercise first."}
            {selectedEmotion === "Happy" && "Great mood! Your savings rate is 40% higher when you're feeling positive."}
            {selectedEmotion === "Sad" && "Comfort spending alert. Consider calling a friend instead of retail therapy."}
            {selectedEmotion === "Calm" && "Perfect mindset for financial decisions. Great time to review your goals!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionTracker;
