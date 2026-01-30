import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface UPIData {
  payeeName: string;
  payeeVpa: string;
  amount: string;
  transactionNote: string;
}

interface PaymentConfirmationProps {
  open: boolean;
  onClose: () => void;
  upiData: UPIData;
  onConfirm: (data: { name: string; category: string; amount: number; payeeVpa: string }) => void;
  onCancel: () => void;
}

const categories = [
  "Food & Drink",
  "Shopping",
  "Entertainment",
  "Transport",
  "Bills & Utilities",
  "Health",
  "Other",
];

const PaymentConfirmation = ({ open, onClose, upiData, onConfirm, onCancel }: PaymentConfirmationProps) => {
  const [name, setName] = useState(upiData.payeeName);
  const [amount, setAmount] = useState(upiData.amount);
  const [category, setCategory] = useState("Other");

  const handleConfirm = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0 || !name) {
      return;
    }

    onConfirm({
      name,
      category,
      amount: amountNum,
      payeeVpa: upiData.payeeVpa,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Check className="h-5 w-5 text-primary" />
            Did you complete the payment?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary border border-border">
            <p className="text-sm font-medium">Payment to: {upiData.payeeName}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{upiData.payeeVpa}</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Payee Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter payee name"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount Paid (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Payment Failed
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Log Expense
            </Button>
          </div>

          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Scan Another QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmation;
