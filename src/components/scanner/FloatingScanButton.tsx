import { useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import UPIScanner from "./UPIScanner";

interface FloatingScanButtonProps {
  onExpenseAdded?: (expense: {
    name: string;
    category: string;
    amount: number;
    payeeVpa: string;
  }) => void;
}

const FloatingScanButton = ({ onExpenseAdded }: FloatingScanButtonProps) => {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 right-5 z-40">
        {/* Pulsing rings */}
        <span className="absolute inset-0 rounded-full gradient-hero opacity-40 animate-ping" />
        <span className="absolute inset-0 rounded-full gradient-hero opacity-30 animate-pulse-glow" />
        <Button
          onClick={() => setScannerOpen(true)}
          className="relative h-14 w-14 rounded-full shadow-lg gradient-hero animate-gradient-shift hover:opacity-90 transition-all duration-300 hover:scale-110 active:scale-95"
          size="icon"
        >
          <ScanLine className="h-6 w-6 text-primary-foreground" />
        </Button>
      </div>

      <UPIScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onExpenseAdded={onExpenseAdded}
      />
    </>
  );
};

export default FloatingScanButton;
