import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import api from "../lib/axios";

const DELIVERY_FEE = 3000; // NGN — keep in sync with backend DELIVERY_FEE constant
const FREE_DELIVERY_THRESHOLD = 200000; // NGN — keep in sync with backend FREE_DELIVERY_THRESHOLD constant
const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;

function loadFlutterwaveScript() {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function Checkout() {
  const { cart, loading, subtotal, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem || null;

  const displayItems = buyNowItem
    ? [
        {
          id: "buy-now",
          quantity: buyNowItem.quantity,
          variant: {
            size: buyNowItem.size,
            product: { name: buyNowItem.productName, price: buyNowItem.price },
          },
        },
      ]
    : cart.items;

  const buyNowSubtotal = buyNowItem
    ? buyNowItem.price * buyNowItem.quantity
    : null;
  const effectiveSubtotal = buyNowItem ? buyNowSubtotal : subtotal;

  const CHECKOUT_FORM_STORAGE_KEY = "onfleek_checkout_form";
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            customerName: "",
            phoneNumber: "",
            customerEmail: "",
            deliveryAddress: "",
          };
    } catch {
      return {
        customerName: "",
        phoneNumber: "",
        customerEmail: "",
        deliveryAddress: "",
      };
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [checkingDiscount, setCheckingDiscount] = useState(false);

  useEffect(() => {
    loadFlutterwaveScript()
      .then(() => setScriptReady(true))
      .catch(() => showToast("Could not load payment provider. Please refresh and try again."));
  }, [showToast]);

  useEffect(() => {
    if (loading || typeof window.gtag !== "function") return;
    if (!buyNowItem && cart.items.length === 0) return;
    window.gtag("event", "begin_checkout", {
      currency: "NGN",
      value: effectiveSubtotal + DELIVERY_FEE,
      items: displayItems.map((item) => ({
        item_name: item.variant.product.name,
        price: Number(item.variant.product.price),
        quantity: item.quantity,
      })),
    });
  }, [loading]);

  const [fulfillmentMethod, setFulfillmentMethod] = useState("DELIVERY");
  const effectiveDeliveryFee =
    fulfillmentMethod === "PICKUP" || effectiveSubtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;
  const totalQuantity = displayItems.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount = appliedDiscount
    ? Math.min(appliedDiscount.amount * totalQuantity, effectiveSubtotal + effectiveDeliveryFee)
    : 0;
  const grandTotal = effectiveSubtotal + effectiveDeliveryFee - discountAmount;

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      try {
        localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — ignore, form still works in-memory
      }
      return next;
    });
  }

  async function applyDiscountCode() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingDiscount(true);
    setDiscountError("");
    try {
      const res = await api.get(`/discount-codes/${encodeURIComponent(code)}`);
      setAppliedDiscount({ code, amount: Number(res.data.amount) });
    } catch (err) {
      setAppliedDiscount(null);
      setDiscountError(err.response?.data?.error || "Invalid or already used code");
    } finally {
      setCheckingDiscount(false);
    }
  }

  function removeDiscountCode() {
    setAppliedDiscount(null);
    setCouponInput("");
    setDiscountError("");
  }

  function isFormValid() {
    return (
      form.customerName.trim() &&
      form.phoneNumber.trim() &&
      form.customerEmail.trim() &&
      (fulfillmentMethod === "PICKUP" || form.deliveryAddress.trim())
    );
  }

  async function handlePay() {
    if (!isFormValid()) {
      setShowErrors(true);
      return;
    }
    if (!scriptReady || !window.FlutterwaveCheckout) {
      showToast("Payment provider is still loading. Please try again in a moment.");
      return;
    }
    if (!buyNowItem && cart.items.length === 0) {
      showToast("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const txRef = `onfleek-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let pendingOrder;
    try {
      const res = await api.post("/orders/pending", {
        customerName: form.customerName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        customerEmail: form.customerEmail.trim(),
        fulfillmentMethod,
        ...(fulfillmentMethod === "DELIVERY"
          ? { deliveryAddress: form.deliveryAddress.trim() }
          : {}),
        paymentReference: txRef,
        ...(buyNowItem ? { buyNowItem } : {}),
        ...(appliedDiscount ? { discountCode: appliedDiscount.code } : {}),
      });
      pendingOrder = res.data;
    } catch (err) {
      setSubmitting(false);
      showToast(
        err.response?.data?.error || "Could not start checkout. Please try again.",
      );
      return;
    }

    window.FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: txRef,
      amount: Number(pendingOrder.totalAmount),
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: form.customerEmail.trim(),
        phone_number: form.phoneNumber.trim(),
        name: form.customerName.trim(),
      },
      callback: (data) => {
        if (data.status === "successful" || data.status === "completed") {
          finalizeOrder(txRef);
        } else {
          setSubmitting(false);
        }
      },
      onclose: () => {
        setSubmitting(false);
      },
    });
  }

  async function finalizeOrder(paymentReference) {
    try {
      await api.post("/orders/confirm", { paymentReference });
      if (!buyNowItem) {
        await refreshCart();
      }
      localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      showToast("Payment successful! Your order has been placed.", "success");
      navigate("/order-success", {
        state: {
          orderData: {
            transactionId: paymentReference,
            value: grandTotal,
            items: displayItems.map((item) => ({
              item_name: item.variant.product.name,
              price: Number(item.variant.product.price),
              quantity: item.quantity,
            })),
          },
        },
      });
    } catch (err) {
      showToast(
        err.response?.data?.error ||
          "Payment succeeded but the order could not be created. Please contact support with your payment reference.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="px-6 py-12 max-w-3xl mx-auto">Loading...</div>;
  }

  if (!buyNowItem && cart.items.length === 0) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="font-serif text-3xl text-ink mb-4">Your Cart is Empty</h1>
        <Link
          to="/"
          className="text-sm uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <h1 className="font-serif text-4xl text-ink mb-10">Checkout</h1>

      <section className="mb-10">
        <h2 className="font-serif text-xl text-ink mb-4">Delivery Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              className={`w-full border px-4 py-2 text-sm ${
                showErrors && !form.customerName.trim()
                  ? "border-red-600"
                  : "border-ink/20"
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.target.value)}
              className={`w-full border px-4 py-2 text-sm ${
                showErrors && !form.phoneNumber.trim()
                  ? "border-red-600"
                  : "border-ink/20"
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => updateField("customerEmail", e.target.value)}
              className={`w-full border px-4 py-2 text-sm ${
                showErrors && !form.customerEmail.trim()
                  ? "border-red-600"
                  : "border-ink/20"
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Fulfillment Method <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentMethod("DELIVERY")}
                className={`flex-1 border px-4 py-2 text-sm uppercase tracking-[0.15em] ${
                  fulfillmentMethod === "DELIVERY"
                    ? "border-ink bg-ink text-offwhite"
                    : "border-ink/20 text-ink/70"
                }`}
              >
                Delivery
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentMethod("PICKUP")}
                className={`flex-1 border px-4 py-2 text-sm uppercase tracking-[0.15em] ${
                  fulfillmentMethod === "PICKUP"
                    ? "border-ink bg-ink text-offwhite"
                    : "border-ink/20 text-ink/70"
                }`}
              >
                Pickup
              </button>
            </div>
          </div>

          {fulfillmentMethod === "DELIVERY" && (
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
                Delivery Address <span className="text-red-600">*</span>
              </label>
              <textarea
                value={form.deliveryAddress}
                onChange={(e) => updateField("deliveryAddress", e.target.value)}
                className={`w-full border px-4 py-2 text-sm ${
                  showErrors && !form.deliveryAddress.trim()
                    ? "border-red-600"
                    : "border-ink/20"
                }`}
                rows={3}
                required
              />
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl text-ink mb-4">Order Summary</h2>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
            Discount Code
          </label>
          {appliedDiscount ? (
            <div className="flex items-center justify-between border border-ink/20 px-4 py-2 text-sm">
              <span className="text-ink">
                {appliedDiscount.code} applied — ₦{appliedDiscount.amount.toLocaleString()} off
              </span>
              <button
                type="button"
                onClick={removeDiscountCode}
                className="text-xs uppercase tracking-[0.15em] text-ink/50 hover:text-ink cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter code"
                className="flex-1 border border-ink/20 px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={applyDiscountCode}
                disabled={checkingDiscount || !couponInput.trim()}
                className="border border-ink/20 px-5 py-2 text-xs uppercase tracking-[0.15em] text-ink/70 hover:border-ink hover:text-ink transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {checkingDiscount ? "Checking..." : "Apply"}
              </button>
            </div>
          )}
          {discountError && (
            <p className="text-xs text-red-600 mt-2">{discountError}</p>
          )}
        </div>

        <div className="divide-y divide-ink/10 border-t border-b border-ink/10">
          {displayItems.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <span className="text-ink/80">
                {item.variant.product.name} · Size {item.variant.size} × {item.quantity}
              </span>
              <span className="text-ink">
                ₦{(Number(item.variant.product.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>₦{effectiveSubtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/70">
            <span>Delivery Fee</span>
            <span>
              {effectiveDeliveryFee === 0
                ? "Free"
                : `₦${DELIVERY_FEE.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-lg font-serif text-ink pt-2 border-t border-ink/10">
            <span>Grand Total</span>
            {appliedDiscount ? (
              <span className="flex items-center gap-2">
                <span className="text-ink/40 line-through text-base">
                  ₦{(effectiveSubtotal + effectiveDeliveryFee).toLocaleString()}
                </span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </span>
            ) : (
              <span>₦{grandTotal.toLocaleString()}</span>
            )}
          </div>
        </div>
      </section>

      <button
        onClick={handlePay}
        disabled={submitting}
        className="w-full bg-ink text-offwhite text-sm uppercase tracking-[0.2em] py-4 hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? "Processing..." : "Pay with Flutterwave"}
      </button>
    </div>
  );
}

export default Checkout;