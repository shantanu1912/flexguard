import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

const extractUpiPayload = (data: string): string | null => {
  const trimmed = data.trim();
  const decoded = (() => {
    try {
      return decodeURIComponent(trimmed);
    } catch {
      return trimmed;
    }
  })();

  const candidates = [trimmed, decoded];

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const upiIndex = lower.indexOf("upi://pay");
    if (upiIndex >= 0) {
      return candidate.slice(upiIndex).trim();
    }
  }

  return null;
};

const parseUPIQR = (data: string): UPIData | null => {
  try {
    const upiPayload = extractUpiPayload(data);

    if (!upiPayload) {
      return null;
    }

    const url = new URL(upiPayload);
    const params = url.searchParams;

    return {
      payeeVpa: params.get("pa") || "",
      payeeName: params.get("pn") || params.get("pa")?.split("@")[0] || "Unknown",
      amount: params.get("am") || "",
      transactionNote: params.get("tn") || "",
      rawUrl: upiPayload,
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
  const isStartingRef = useRef(false);
  const lastScanRef = useRef<string | null>(null);
  const scanRestartTimerRef = useRef<number | null>(null);

  const startScanner = async () => {
    if (!containerRef.current || scannerRef.current || isStartingRef.current) return;

    try {
      isStartingRef.current = true;
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (lastScanRef.current === decodedText) return;

          const upiData = parseUPIQR(decodedText);
          if (upiData) {
            lastScanRef.current = decodedText;
            setScannedData(upiData);
            stopScanner();
            setStep("app-selection");
            toast.success("UPI QR code scanned!");
          }
        },
        () => {} // Ignore scan failures
      );
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Could not access camera. Please check permissions.");
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
        scannerRef.current = null;
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
    lastScanRef.current = null;
    setStep("scanning");
    if (scanRestartTimerRef.current) {
      window.clearTimeout(scanRestartTimerRef.current);
    }
    scanRestartTimerRef.current = window.setTimeout(() => {
      startScanner();
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (scanRestartTimerRef.current) {
        window.clearTimeout(scanRestartTimerRef.current);
      }
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
        <DialogContent className="sm:max-w-md" aria-describedby="scanner-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Scan UPI QR Code
            </DialogTitle>
            <DialogDescription id="scanner-description">
              Point your camera at a UPI QR code to scan and pay
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              id="qr-reader"
              ref={containerRef}
              className="w-full aspect-square rounded-xl overflow-hidden bg-muted"
            />
            <p className="text-sm text-muted-foreground text-center">
              Ensure camera permissions are enabled
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
