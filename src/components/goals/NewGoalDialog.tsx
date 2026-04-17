import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, target: number, emoji: string, deadline?: string) => void | Promise<void>;
}

const emojis = ["💰", "🏠", "🚗", "✈️", "💻", "📱", "🎓", "💍", "🛡️", "🎯"];

const NewGoalDialog = ({ open, onOpenChange, onSave }: NewGoalDialogProps) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("💰");

  const handleSave = async () => {
    if (!name.trim() || !target) return;
    await onSave(name.trim(), Number(target), selectedEmoji, deadline || undefined);
    setName("");
    setTarget("");
    setDeadline("");
    setSelectedEmoji("💰");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Goal 🌱</DialogTitle>
          <DialogDescription>
            Set a savings goal and watch it grow in your garden!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emoji">Choose an icon</Label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., New Laptop, Vacation, Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Amount (₹)</Label>
            <Input
              id="target"
              type="number"
              placeholder="50000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gradient" className="flex-1" onClick={handleSave}>
            Create Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewGoalDialog;
