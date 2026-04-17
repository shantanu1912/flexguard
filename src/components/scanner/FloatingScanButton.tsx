import { useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import UPIScanner from "./UPIScanner";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";

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
  const { createTransaction } = useTransactions();

  const handleExpenseAdded = async (expense: {
    name: string;
    category: string;
    amount: number;
    payeeVpa: string;
  }) => {
    // If a parent handler is provided, defer to it (avoids duplicate saves).
    if (onExpenseAdded) {
      onExpenseAdded(expense);
      return;
    }

    // Otherwise save the transaction ourselves so the scan still gets logged
    // when used from pages that don't wire up a handler.
    const result = await createTransaction({
      name: expense.name,
      category: expense.category,
      amount: expense.amount,
      payee_vpa: expense.payeeVpa,
      transaction_type: "expense",
    });

    if (result) {
      toast.success(`₹${expense.amount.toLocaleString("en-IN")} expense saved!`);
    }
  };

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
        onExpenseAdded={handleExpenseAdded}
      />
    </>
  );
};

export default FloatingScanButton;
