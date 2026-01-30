import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, Check, QrCode } from "lucide-react";
import { toast } from "sonner";

interface UPIData {
  payeeName: string;
  payeeVpa: string;
  amount: string;
  transactionNote: string;
}

interface UPIScannerProps {
  open: boolean;
  onClose: () => void;
  onExpenseAdded?: (expense: {
    name: string;
    category: string;
    amount: number;
    payeeVpa: string;
  }) => void;
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

const parseUPIQR = (data: string): UPIData | null => {
  try {
    // UPI QR format: upi://pay?pa=payee@upi&pn=PayeeName&am=100&tn=Note
    if (!data.toLowerCase().startsWith("upi://")) {
      return null;
    }

    const url = new URL(data);
    const params = url.searchParams;

    return {
      payeeVpa: params.get("pa") || "",
      payeeName: params.get("pn") || params.get("pa")?.split("@")[0] || "Unknown",
      amount: params.get("am") || "",
      transactionNote: params.get("tn") || "",
    };
  } catch {
    return null;
  }
};

const UPIScanner = ({ open, onClose, onExpenseAdded }: UPIScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<UPIData | null>(null);
  const [category, setCategory] = useState("Other");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const upiData = parseUPIQR(decodedText);
          if (upiData) {
            setScannedData(upiData);
            setName(upiData.payeeName);
            setAmount(upiData.amount);
            stopScanner();
            toast.success("UPI QR code scanned successfully!");
          } else {
            toast.error("Not a valid UPI QR code");
          }
        },
        () => {} // Ignore scan failures
      );

      setScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    setScannedData(null);
    setAmount("");
    setName("");
    setCategory("Other");
    onClose();
  };

  const handleSaveExpense = () => {
    if (!amount || !name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onExpenseAdded?.({
      name,
      category,
      amount: amountNum,
      payeeVpa: scannedData?.payeeVpa || "",
    });

    toast.success(`₹${amountNum.toLocaleString("en-IN")} expense logged for ${name}`);
    handleClose();
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (open && !scannedData) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, scannedData]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            {scannedData ? "Log Expense" : "Scan UPI QR Code"}
          </DialogTitle>
        </DialogHeader>

        {!scannedData ? (
          <div className="space-y-4">
            <div
              id="qr-reader"
              ref={containerRef}
              className="w-full aspect-square rounded-xl overflow-hidden bg-muted"
            />
            <p className="text-sm text-muted-foreground text-center">
              Point your camera at a UPI QR code to scan
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-success/10 border border-success/30">
              <p className="text-sm font-medium text-success flex items-center gap-2">
                <Check className="h-4 w-4" />
                QR Code Scanned
              </p>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {scannedData.payeeVpa}
              </p>
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
                <Label htmlFor="amount">Amount (₹)</Label>
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setScannedData(null);
                  setAmount("");
                  setName("");
                  setTimeout(startScanner, 300);
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan Again
              </Button>
              <Button className="flex-1" onClick={handleSaveExpense}>
                <Check className="h-4 w-4 mr-2" />
                Save Expense
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UPIScanner;
