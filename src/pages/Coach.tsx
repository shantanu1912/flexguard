import { useState } from "react";
import { Send, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/dashboard/BottomNavigation";

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
}

const suggestedQuestions = [
  "How can I save more money?",
  "What's the 50/30/20 rule?",
  "How do I stop impulse buying?",
  "Should I pay off debt or save?",
];

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "coach",
      content: "Hey! 👋 I'm your AI Financial Coach. I'm here to help you build better money habits and reach your goals. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: getCoachResponse(messageText),
      };
      setMessages((prev) => [...prev, coachResponse]);
    }, 1000);
  };

  const getCoachResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("save") || q.includes("saving")) {
      return "Great question! Start with the 50/30/20 rule: 50% on needs, 30% on wants, 20% on savings. Try automating your savings so it happens before you even see the money. Small amounts add up - even $20/week becomes $1,040/year! 💰";
    }
    if (q.includes("50/30/20") || q.includes("rule")) {
      return "The 50/30/20 rule is a simple budgeting method: 50% of income goes to needs (rent, groceries), 30% to wants (dining out, entertainment), and 20% to savings/debt. It's a great starting point! 📊";
    }
    if (q.includes("impulse") || q.includes("stop buying")) {
      return "Try the 24-hour rule: wait a day before buying anything over $50. Also, unsubscribe from marketing emails and remove saved payment info from shopping sites. Your FOMO purchases dropped 60% when you tracked emotions! 🧠";
    }
    if (q.includes("debt") || q.includes("pay off")) {
      return "It depends! High-interest debt (credit cards) should be priority #1. But also build a small emergency fund ($500-1000) first. Consider the avalanche method (highest interest first) or snowball (smallest balance first) for motivation! 📈";
    }
    return "That's a great topic to explore! Based on your spending patterns, I'd suggest focusing on reducing your food & drink expenses first - you're spending 35% there. Want specific tips for that? 🎯";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="px-5 py-4 flex items-center gap-3 border-b border-border">
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">AI Coach</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Powered by behavioral science
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-5 pb-4">
          <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI coach..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button variant="gradient" size="icon" onClick={() => handleSend()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Coach;
