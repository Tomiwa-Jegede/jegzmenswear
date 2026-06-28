import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Skeleton from "../components/ui/Skeleton";

function CartPage() {
  const { cart, loading, updateQuantity, removeItem, subtotal } = useCart();

  if (loading) {
  return (
    <div className="px-6 py-12 max-w-3xl mx-auto animate-pulse">
      <Skeleton className="h-10 w-48 mb-10" />

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-6 py-6">
            <div className="w-24 h-32 bg-cream border border-ink/10 flex-shrink-0" />

            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-20 mb-6" />

              <div className="flex gap-4">
                <div className="h-8 w-16 border border-ink/10 bg-offwhite" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center border-t border-ink/10 pt-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>

      <Skeleton className="mt-8 h-14 w-full" />
    </div>
  );
}

  if (cart.items.length === 0) {
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
      <h1 className="font-serif text-4xl text-ink mb-10">Your Cart</h1>

      <div className="divide-y divide-ink/10">
        {cart.items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-6">
            <div className="w-24 h-32 bg-cream flex-shrink-0 overflow-hidden">
              {item.variant.product.images[0] && (
                <img
                  src={item.variant.product.images[0].url}
                  alt={item.variant.product.images[0].altText || ""}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-serif text-lg text-ink">
                    {item.variant.product.name}
                  </p>
                  <p className="text-xs text-ink/50 mt-1">
                    Size {item.variant.size}
                  </p>
                  <p className="text-sm text-ink/70 mt-1">
                    ₦{Number(item.variant.product.price).toLocaleString()}
                  </p>
                </div>
                <p className="text-ink/80 text-sm whitespace-nowrap">
                  ₦
                  {(
                    Number(item.variant.product.price) * item.quantity
                  ).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.id, Number(e.target.value))
                  }
                  className="border border-ink/20 text-sm px-2 py-1 bg-offwhite"
                >
                  {Array.from(
                    { length: Math.max(item.variant.stock, item.quantity) },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs uppercase tracking-wide text-ink/40 hover:text-burgundy transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center border-t border-ink/10 pt-6">
        <span className="text-ink/70 text-sm uppercase tracking-[0.2em]">
          Subtotal
        </span>
        <span className="text-xl text-ink font-serif">
          ₦{subtotal.toLocaleString()}
        </span>
      </div>

      <button
        disabled
        className="mt-8 w-full bg-ink/30 text-offwhite text-sm uppercase tracking-[0.2em] py-4 cursor-not-allowed"
        title="Checkout will be implemented in a future phase"
      >
        Checkout — Coming Soon
      </button>
    </div>
  );
}

export default CartPage;
