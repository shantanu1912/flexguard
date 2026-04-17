import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Smartphone, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface UPIAppOption {
  id: string;
  name: string;
  /** Android package name — used for intent:// targeting */
  androidPackage?: string;
  /** iOS custom scheme (Android falls back to plain upi://) */
  iosScheme?: string;
  fallbackIcon: string;
  color: string;
}

/**
 * Verified Android package names + iOS schemes for major Indian UPI apps.
 * On Android we use intent:// URLs (most reliable), on iOS custom schemes.
 */
const upiApps: UPIAppOption[] = [
  {
    id: "gpay",
    name: "Google Pay",
    androidPackage: "com.google.android.apps.nbu.paisa.user",
    iosScheme: "tez",
    fallbackIcon: "G",
    color: "bg-blue-500",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    androidPackage: "com.phonepe.app",
    iosScheme: "phonepe",
    fallbackIcon: "P",
    color: "bg-purple-600",
  },
  {
    id: "paytm",
    name: "Paytm",
    androidPackage: "net.one97.paytm",
    iosScheme: "paytmmp",
    fallbackIcon: "₽",
    color: "bg-sky-500",
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    androidPackage: "in.amazon.mShop.android.shopping",
    fallbackIcon: "A",
    color: "bg-amber-500",
  },
  {
    id: "bhim",
    name: "BHIM",
    androidPackage: "in.org.npci.upiapp",
    iosScheme: "bhim",
    fallbackIcon: "B",
    color: "bg-emerald-600",
  },
  {
    id: "default",
    name: "Other UPI",
    fallbackIcon: "U",
    color: "bg-muted-foreground",
  },
];

interface UPIAppSelectorProps {
  open: boolean;
  onClose: () => void;
  upiUrl: string;
  onPaymentInitiated: () => void;
}

const isAndroid = () => /android/i.test(navigator.userAgent);
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * Re-normalize the UPI URL so all params are properly URL-encoded.
 * Many QR codes have spaces / special chars in `pn` that break app parsing
 * and trigger the "open from gallery" prompt.
 */
const normalizeUpiUrl = (rawUrl: string): string => {
  try {
    const u = new URL(rawUrl);
    const params = new URLSearchParams();
    u.searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    return `upi://pay?${params.toString()}`;
  } catch {
    return rawUrl;
  }
};

/**
 * Build a payment URL targeted at a specific app.
 * - Android: intent:// URL with explicit package + S.browser_fallback_url
 * - iOS: app's custom scheme with same query string
 * - Desktop / unknown: plain upi:// (will likely show OS chooser or fail gracefully)
 */
const buildAppUrl = (upiUrl: string, app: UPIAppOption): string => {
  const normalized = normalizeUpiUrl(upiUrl);
  const queryStart = normalized.indexOf("?");
  const query = queryStart >= 0 ? normalized.slice(queryStart) : "";

  if (isAndroid() && app.androidPackage) {
    // intent:// is the most reliable way to deep-link to a specific Android app.
    return `intent://pay${query}#Intent;scheme=upi;package=${app.androidPackage};end`;
  }

  if (isIOS() && app.iosScheme) {
    return `${app.iosScheme}://pay${query}`;
  }

  // Universal UPI intent — Android will show app chooser, desktop will do nothing useful.
  return normalized;
};

const UPIAppSelector = ({ open, onClose, upiUrl, onPaymentInitiated }: UPIAppSelectorProps) => {
  const handleAppSelect = (app: UPIAppOption) => {
    const appUrl = buildAppUrl(upiUrl, app);

    // Use a hidden iframe on iOS for better reliability, location.href on Android.
    if (isIOS()) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = appUrl;
      document.body.appendChild(iframe);
      setTimeout(() => document.body.removeChild(iframe), 1500);
    } else {
      window.location.href = appUrl;
    }

    onPaymentInitiated();
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(normalizeUpiUrl(upiUrl));
      toast.success("UPI link copied — paste it in any payment app");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const showDesktopHint = !isAndroid() && !isIOS();

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            Choose UPI App
          </SheetTitle>
        </SheetHeader>

        {showDesktopHint && (
          <div className="mb-4 rounded-xl border border-border bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">
              UPI apps only work on mobile. Open this page on your phone, or copy the
              payment link below to pay from another device.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleCopyLink}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy UPI Link
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {upiApps.map((app) => (
            <Button
              key={app.id}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-secondary transition-all"
              onClick={() => handleAppSelect(app)}
            >
              <div className={`w-12 h-12 rounded-full ${app.color} flex items-center justify-center overflow-hidden`}>
                <span className="text-white font-bold text-lg">{app.fallbackIcon}</span>
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
