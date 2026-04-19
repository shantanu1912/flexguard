import { useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Smartphone, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface UPIAppOption {
  id: string;
  name: string;
  androidPackage?: string;
  nativeScheme?: string;
  nativePath?: string;
  fallbackIcon: string;
  color: string;
}

const upiApps: UPIAppOption[] = [
  {
    id: "gpay",
    name: "Google Pay",
    androidPackage: "com.google.android.apps.nbu.paisa.user",
    nativeScheme: "tez",
    nativePath: "upi/pay",
    fallbackIcon: "G",
    color: "bg-blue-500",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    androidPackage: "com.phonepe.app",
    nativeScheme: "phonepe",
    nativePath: "pay",
    fallbackIcon: "P",
    color: "bg-purple-600",
  },
  {
    id: "paytm",
    name: "Paytm",
    androidPackage: "net.one97.paytm",
    nativeScheme: "paytmmp",
    nativePath: "pay",
    fallbackIcon: "₹",
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
    nativeScheme: "bhim",
    nativePath: "pay",
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

const normalizeUpiUrl = (rawUrl: string): string => {
  try {
    const raw = rawUrl.trim();
    const upiStart = raw.toLowerCase().indexOf("upi://pay");
    const candidate = upiStart >= 0 ? raw.slice(upiStart) : raw;
    const url = new URL(candidate);
    const params = new URLSearchParams();

    url.searchParams.forEach((value, key) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    if (!params.get("cu")) {
      params.set("cu", "INR");
    }

    return `upi://pay?${params.toString()}`;
  } catch {
    return rawUrl;
  }
};

const buildNativeAppUrl = (upiUrl: string, app: UPIAppOption): string => {
  const normalized = normalizeUpiUrl(upiUrl);
  const query = normalized.includes("?") ? normalized.slice(normalized.indexOf("?")) : "";

  if (!app.nativeScheme) {
    return normalized;
  }

  return `${app.nativeScheme}://${app.nativePath ?? "pay"}${query}`;
};

const buildAndroidIntentUrl = (upiUrl: string, app: UPIAppOption): string | null => {
  if (!app.androidPackage) return null;

  const normalized = normalizeUpiUrl(upiUrl);
  const query = normalized.includes("?") ? normalized.slice(normalized.indexOf("?")) : "";

  return `intent://upi/pay${query}#Intent;scheme=upi;package=${app.androidPackage};end`;
};

const buildLaunchUrls = (upiUrl: string, app: UPIAppOption) => {
  const normalized = normalizeUpiUrl(upiUrl);

  if (isAndroid()) {
    return {
      primaryUrl: buildAndroidIntentUrl(upiUrl, app) ?? normalized,
      fallbackUrl: normalized,
    };
  }

  if (isIOS()) {
    const nativeUrl = buildNativeAppUrl(upiUrl, app);
    return {
      primaryUrl: nativeUrl,
      fallbackUrl: normalized,
    };
  }

  return {
    primaryUrl: normalized,
    fallbackUrl: normalized,
  };
};

const launchUrl = (url: string) => {
  window.location.assign(url);
};

const UPIAppSelector = ({ open, onClose, upiUrl, onPaymentInitiated }: UPIAppSelectorProps) => {
  const pendingReturnRef = useRef(false);
  const appOpenedRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!pendingReturnRef.current) return;

      if (document.visibilityState === "hidden") {
        appOpenedRef.current = true;
        return;
      }

      if (document.visibilityState === "visible" && appOpenedRef.current) {
        pendingReturnRef.current = false;
        appOpenedRef.current = false;
        onPaymentInitiated();
      }
    };

    const handlePageHide = () => {
      if (pendingReturnRef.current) {
        appOpenedRef.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [onPaymentInitiated]);

  const handleAppSelect = (app: UPIAppOption) => {
    const { primaryUrl } = buildLaunchUrls(upiUrl, app);
    pendingReturnRef.current = true;
    appOpenedRef.current = false;
    launchUrl(primaryUrl);
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
              className="flex h-auto flex-col items-center gap-2 py-4 transition-all hover:bg-secondary"
              onClick={() => handleAppSelect(app)}
            >
              <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${app.color}`}>
                <span className="text-lg font-bold text-white">{app.fallbackIcon}</span>
              </div>
              <span className="text-center text-xs text-muted-foreground">{app.name}</span>
            </Button>
          ))}
        </div>

        <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          Opens your selected app to complete payment
        </p>
      </SheetContent>
    </Sheet>
  );
};

export default UPIAppSelector;
