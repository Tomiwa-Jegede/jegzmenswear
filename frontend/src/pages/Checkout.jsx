import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import api from "../lib/axios";

const DELIVERY_FEE = 3000; // NGN — keep in sync with backend DELIVERY_FEE constant
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
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

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    customerEmail: "",
    deliveryAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadPaystackScript()
      .then(() => setScriptReady(true))
      .catch(() => showToast("Could not load payment provider. Please refresh and try again."));
  }, [showToast]);

  const grandTotal = effectiveSubtotal + DELIVERY_FEE;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function isFormValid() {
    return (
      form.customerName.trim() &&
      form.phoneNumber.trim() &&
      form.customerEmail.trim() &&
      form.deliveryAddress.trim()
    );
  }

  function handlePay() {
    if (!isFormValid()) {
      showToast("Please fill in all delivery information fields.");
      return;
    }
    if (!scriptReady || !window.PaystackPop) {
      showToast("Payment provider is still loading. Please try again in a moment.");
      return;
    }
    if (!buyNowItem && cart.items.length === 0) {
      showToast("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: form.customerEmail.trim(),
      amount: Math.round(grandTotal * 100),
      currency: "NGN",
      callback: (response) => {
        finalizeOrder(response.reference);
      },
      onClose: () => {
        setSubmitting(false);
      },
    });

    handler.openIframe();
  }

  async function finalizeOrder(paymentReference) {
    try {
      await api.post("/orders", {
        customerName: form.customerName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        customerEmail: form.customerEmail.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        paymentReference,
        ...(buyNowItem ? { buyNowItem } : {}),
      });
      if (!buyNowItem) {
        await refreshCart();
      }
      showToast("Payment successful! Your order has been placed.", "success");
      navigate("/order-success");
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
              className="w-full border border-ink/20 px-4 py-2 text-sm"
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
              className="w-full border border-ink/20 px-4 py-2 text-sm"
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
              className="w-full border border-ink/20 px-4 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
              Delivery Address <span className="text-red-600">*</span>
            </label>
            <textarea
              value={form.deliveryAddress}
              onChange={(e) => updateField("deliveryAddress", e.target.value)}
              className="w-full border border-ink/20 px-4 py-2 text-sm"
              rows={3}
              required
            />
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-xl text-ink mb-4">Order Summary</h2>
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
            <span>₦{DELIVERY_FEE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-serif text-ink pt-2 border-t border-ink/10">
            <span>Grand Total</span>
            <span>₦{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </section>

      <button
        onClick={handlePay}
        disabled={submitting}
        className="w-full bg-ink text-offwhite text-sm uppercase tracking-[0.2em] py-4 hover:bg-charcoal transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? "Processing..." : "Pay with Paystack"}
      </button>
    </div>
  );
}

export default Checkout;