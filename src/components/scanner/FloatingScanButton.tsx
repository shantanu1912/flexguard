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
      <Button
        onClick={() => setScannerOpen(true)}
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full shadow-lg z-40 gradient-hero hover:opacity-90 transition-all duration-200 hover:scale-105"
        size="icon"
      >
        <ScanLine className="h-6 w-6 text-primary-foreground" />
      </Button>

      <UPIScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onExpenseAdded={onExpenseAdded}
      />
    </>
  );
};

export default FloatingScanButton;
