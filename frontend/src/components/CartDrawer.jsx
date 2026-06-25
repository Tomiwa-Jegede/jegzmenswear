import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Skeleton from "./ui/Skeleton";

function getCropTransform({ cropX = 0, cropY = 0, cropWidth = 100, cropHeight = 100 } = {}) {
  const scaleX = 100 / cropWidth;
  const scaleY = 100 / cropHeight;
  return {
    transformOrigin: "top left",
    transform: `translate(${-cropX * scaleX}%, ${-cropY * scaleY}%) scale(${scaleX}, ${scaleY})`,
  };
}

function CartDrawer() {
  const { cart, loading, isOpen, setIsOpen, updateQuantity, removeItem, subtotal } =
    useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-ink/40 cursor-pointer"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-sm h-full bg-offwhite flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            Your Bag
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="text-ink/60 hover:text-ink text-sm cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading &&
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-20 h-28 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          {!loading && cart.items.length === 0 && (
            <p className="text-sm text-ink/50">Your bag is empty.</p>
          )}
          {!loading &&
            cart.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-20 h-28 bg-cream flex-shrink-0 overflow-hidden relative">
                {item.variant.product.images[0] && (
                  <>
                    <img
                      src={item.variant.product.images[0].url}
                      alt={item.variant.product.images[0].altText || ""}
                      className="absolute inset-0 h-full w-full sm:hidden"
                      style={getCropTransform({
                        cropX: item.variant.product.images[0].mobileCropX,
                        cropY: item.variant.product.images[0].mobileCropY,
                        cropWidth: item.variant.product.images[0].mobileCropWidth,
                        cropHeight: item.variant.product.images[0].mobileCropHeight,
                      })}
                    />
                    <img
                      src={item.variant.product.images[0].url}
                      alt={item.variant.product.images[0].altText || ""}
                      className="absolute inset-0 h-full w-full hidden sm:block"
                      style={getCropTransform({
                        cropX: item.variant.product.images[0].desktopCropX,
                        cropY: item.variant.product.images[0].desktopCropY,
                        cropWidth: item.variant.product.images[0].desktopCropWidth,
                        cropHeight: item.variant.product.images[0].desktopCropHeight,
                      })}
                    />
                  </>
                )}
              </div>
              <div className="flex-1">
                <p className="font-serif text-ink">
                  {item.variant.product.name}
                </p>
                <p className="text-xs text-ink/50 mt-1">
                  Size {item.variant.size}
                </p>
                <p className="text-sm text-ink/70 mt-1">
                  ₦{Number(item.variant.product.price).toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-3">
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

        <div className="border-t border-ink/10 px-6 py-6 space-y-4">
          <div className="flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          <Link
            to="/cart"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center bg-ink text-offwhite text-sm uppercase tracking-[0.2em] py-3 hover:bg-charcoal transition-colors"
          >
            View Bag
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
