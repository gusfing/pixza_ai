/**
 * Razorpay client-side integration
 * Loads the Razorpay checkout script and opens the payment modal.
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  plan: "pro" | "agency";
  onSuccess?: (data: { plan: string; credits: number; payment_id: string }) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout({
  plan,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayCheckoutOptions): Promise<void> {
  // 0. Check auth before loading SDK
  const token = typeof window !== "undefined" ? localStorage.getItem("pixza_token") : null;
  if (!token) {
    window.location.href = "/auth/signin?next=/create";
    return;
  }

  // 1. Load SDK
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError?.("Failed to load Razorpay. Check your internet connection.");
    return;
  }

  // 2. Create order server-side
  let orderData: any;
  try {
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    orderData = await res.json();
    if (!res.ok) throw new Error(orderData.error || "Failed to create order");
  } catch (e) {
    onError?.(e instanceof Error ? e.message : "Failed to create order");
    return;
  }

  // 3. Open Razorpay modal
  const rzp = new window.Razorpay({
    key:         orderData.key_id,
    amount:      orderData.amount,
    currency:    orderData.currency,
    name:        "Pixza Studio",
    description: `${orderData.plan_name} — Monthly Subscription`,
    image:       "/pixza-logo.png",
    order_id:    orderData.order_id,
    prefill: {
      name:  orderData.user_name,
      email: orderData.user_email,
    },
    theme: { color: "#7c6af7" },
    modal: {
      ondismiss: () => onDismiss?.(),
    },
    handler: async (response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      // 4. Verify payment server-side
      try {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            plan,
          }),
        });
        const result = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(result.error || "Verification failed");
        onSuccess?.(result);
      } catch (e) {
        onError?.(e instanceof Error ? e.message : "Payment verification failed");
      }
    },
  });

  rzp.open();
}
