import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import UPIAppSelector from "./UPIAppSelector";
import PaymentConfirmation from "./PaymentConfirmation";

interface UPIData {
  payeeName: string;
  payeeVpa: string;
  amount: string;
  transactionNote: string;
  rawUrl: string;
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

type ScannerStep = "scanning" | "app-selection" | "confirmation";

const parseUPIQR = (data: string): UPIData | null => {
  try {
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
      rawUrl: data,
    };
  } catch {
    return null;
  }
};

const UPIScanner = ({ open, onClose, onExpenseAdded }: UPIScannerProps) => {
  const [step, setStep] = useState<ScannerStep>("scanning");
  const [scannedData, setScannedData] = useState<UPIData | null>(null);
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
            stopScanner();
            setStep("app-selection");
            toast.success("UPI QR code scanned!");
          } else {
            toast.error("Not a valid UPI QR code");
          }
        },
        () => {} // Ignore scan failures
      );
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
  };

  const handleClose = () => {
    stopScanner();
    setScannedData(null);
    setStep("scanning");
    onClose();
  };

  const handlePaymentInitiated = () => {
    // Move to confirmation step after user selects a UPI app
    setStep("confirmation");
  };

  const handlePaymentConfirmed = (expense: {
    name: string;
    category: string;
    amount: number;
    payeeVpa: string;
  }) => {
    onExpenseAdded?.(expense);
    toast.success(`₹${expense.amount.toLocaleString("en-IN")} expense logged for ${expense.name}`);
    handleClose();
  };

  const handlePaymentCancelled = () => {
    toast.info("Payment not logged");
    handleClose();
  };

  const handleBackToScan = () => {
    setScannedData(null);
    setStep("scanning");
    setTimeout(startScanner, 300);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (open && step === "scanning" && !scannedData) {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, step, scannedData]);

  return (
    <>
      {/* Scanner Dialog */}
      <Dialog open={open && step === "scanning"} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Scan UPI QR Code
            </DialogTitle>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>

      {/* UPI App Selector Sheet */}
      {scannedData && (
        <UPIAppSelector
          open={step === "app-selection"}
          onClose={handleBackToScan}
          upiUrl={scannedData.rawUrl}
          onPaymentInitiated={handlePaymentInitiated}
        />
      )}

      {/* Payment Confirmation Dialog */}
      {scannedData && (
        <PaymentConfirmation
          open={step === "confirmation"}
          onClose={handleBackToScan}
          upiData={scannedData}
          onConfirm={handlePaymentConfirmed}
          onCancel={handlePaymentCancelled}
        />
      )}
    </>
  );
};

export default UPIScanner;
