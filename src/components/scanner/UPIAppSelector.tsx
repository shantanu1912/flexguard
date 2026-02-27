import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Smartphone, ExternalLink } from "lucide-react";

interface UPIAppOption {
  id: string;
  name: string;
  scheme: string;
  logo?: string;
  fallbackIcon: string;
  color: string;
}

const upiApps: UPIAppOption[] = [
  { id: "gpay", name: "Google Pay", scheme: "gpay", logo: "/upi-icons/gpay.png", fallbackIcon: "G", color: "bg-blue-500" },
  { id: "phonepe", name: "PhonePe", scheme: "phonepe", logo: "/upi-icons/phonepe.png", fallbackIcon: "P", color: "bg-purple-600" },
  { id: "paytm", name: "Paytm", scheme: "paytm", logo: "/upi-icons/paytm.png", fallbackIcon: "₽", color: "bg-sky-500" },
  { id: "amazonpay", name: "Amazon Pay", scheme: "amazonpay", fallbackIcon: "A", color: "bg-amber-500" },
  { id: "bhim", name: "BHIM UPI", scheme: "bhim", logo: "/upi-icons/bhim.png", fallbackIcon: "B", color: "bg-emerald-600" },
  { id: "default", name: "Other UPI App", scheme: "upi", fallbackIcon: "U", color: "bg-muted-foreground" },
];

interface UPIAppSelectorProps {
  open: boolean;
  onClose: () => void;
  upiUrl: string;
  onPaymentInitiated: () => void;
}

const buildAppSpecificUrl = (baseUrl: string, scheme: string): string => {
  // Replace the upi:// prefix with the app-specific scheme
  if (scheme === "upi") {
    return baseUrl;
  }
  return baseUrl.replace(/^upi:\/\//, `${scheme}://`);
};

const UPIAppSelector = ({ open, onClose, upiUrl, onPaymentInitiated }: UPIAppSelectorProps) => {
  const handleAppSelect = (app: UPIAppOption) => {
    const appUrl = buildAppSpecificUrl(upiUrl, app.scheme);
    
    // Open the UPI app via deep link
    window.location.href = appUrl;
    
    // Notify parent that payment was initiated
    onPaymentInitiated();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            Choose UPI App
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-3">
          {upiApps.map((app) => (
            <Button
              key={app.id}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-secondary transition-all"
              onClick={() => handleAppSelect(app)}
            >
              <div className={`w-12 h-12 rounded-full ${app.logo ? 'bg-white' : app.color} flex items-center justify-center overflow-hidden`}>
                {app.logo ? (
                  <img src={app.logo} alt={app.name} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-white font-bold text-lg">{app.fallbackIcon}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground text-center">{app.name}</span>
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Opens your selected app to complete payment
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default UPIAppSelector;
