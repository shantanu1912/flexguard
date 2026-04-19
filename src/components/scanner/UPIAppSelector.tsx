import { useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Smartphone, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface UPIAppOption {
  id: string;
  name: string;
  /** Android package name — used for intent:// targeting */
  androidPackage?: string;
  /**
   * Native app scheme (works on BOTH iOS and Android for most UPI apps).
   * Using the app's own scheme (e.g. phonepe://, tez://) avoids the
   * "pay via gallery" / ₹2,000 cap warning that PhonePe & GPay show
   * when receiving a generic upi:// intent from a browser.
   */
  nativeScheme?: string;
  /** Path appended after the scheme (default: "pay") */
  nativePath?: string;
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
    // GPay accepts tez://upi/pay on both iOS and Android — bypasses the
    // generic upi:// gallery flow entirely.
    nativeScheme: "tez",
    nativePath: "upi/pay",
    fallbackIcon: "G",
    color: "bg-blue-500",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    androidPackage: "com.phonepe.app",
    // CRITICAL: PhonePe's phonepe:// scheme works on Android too and
    // avoids the "pay up to ₹2,000 via gallery" restriction.
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
 *
 * Strategy (avoiding PhonePe/GPay "pay via gallery" ₹2,000 cap):
 * 1. Prefer each app's NATIVE scheme (phonepe://, tez://upi/pay, paytmmp://)
 *    — these are treated as direct app-to-app calls, not gallery scans.
 * 2. Fall back to Android intent:// only when no native scheme is defined.
 * 3. iOS always uses native scheme (only option).
 * 4. Desktop / unknown: plain upi://.
 */
const buildNativeAppUrl = (upiUrl: string, app: UPIAppOption): string => {
  const normalized = normalizeUpiUrl(upiUrl);
  const queryStart = normalized.indexOf("?");
  const query = queryStart >= 0 ? normalized.slice(queryStart) : "";

  if (app.nativeScheme) {
    const path = app.nativePath ?? "pay";
    return `${app.nativeScheme}://${path}${query}`;
  }

  return normalized;
};

const buildAndroidIntentUrl = (upiUrl: string, app: UPIAppOption): string | null => {
  if (!app.androidPackage) return null;

  const normalized = normalizeUpiUrl(upiUrl);
  const queryStart = normalized.indexOf("?");
  const query = queryStart >= 0 ? normalized.slice(queryStart) : "";
  const scheme = app.nativeScheme ?? "upi";
  const path = app.nativePath ?? "pay";

  return `intent://${path}${query}#Intent;scheme=${scheme};package=${app.androidPackage};end`;
};

const buildLaunchUrls = (upiUrl: string, app: UPIAppOption) => {
  const normalized = normalizeUpiUrl(upiUrl);
  const nativeUrl = buildNativeAppUrl(upiUrl, app);
  const androidIntentUrl = isAndroid() ? buildAndroidIntentUrl(upiUrl, app) : null;

  if (isIOS()) {
    return { primaryUrl: nativeUrl, fallbackUrl: normalized };
  }

  if (isAndroid()) {
    return {
      primaryUrl: androidIntentUrl ?? nativeUrl,
      fallbackUrl: nativeUrl !== normalized ? nativeUrl : normalized,
    };
  }

  return { primaryUrl: normalized, fallbackUrl: normalized };
};

const launchUrl = (url: string) => {
  window.location.href = url;
};

const UPIAppSelector = ({ open, onClose, upiUrl, onPaymentInitiated }: UPIAppSelectorProps) => {
  const pendingReturnRef = useRef(false);
  const appOpenedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!pendingReturnRef.current) return;

      if (document.visibilityState === "hidden") {
        appOpenedRef.current = true;
        if (fallbackTimerRef.current) {
          window.clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        return;
      }

      if (document.visibilityState === "visible" && appOpenedRef.current) {
        pendingReturnRef.current = false;
        appOpenedRef.current = false;
        onPaymentInitiated();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [onPaymentInitiated]);

  const handleAppSelect = (app: UPIAppOption) => {
    const { primaryUrl, fallbackUrl } = buildLaunchUrls(upiUrl, app);

    pendingReturnRef.current = true;
    appOpenedRef.current = false;

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
    }

    if (isAndroid() && fallbackUrl !== primaryUrl) {
      fallbackTimerRef.current = window.setTimeout(() => {
        if (!appOpenedRef.current && document.visibilityState === "visible") {
          launchUrl(fallbackUrl);
        }
      }, 900);
    }

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
