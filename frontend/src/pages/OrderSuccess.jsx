import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="px-6 py-24 text-center max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-ink mb-4">Order Placed</h1>
      <p className="text-sm text-ink/60 mb-10">
        Thank you for your order. We'll be in touch with delivery updates shortly.
      </p>
      <Link
        to="/shop"
        className="text-sm uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderSuccess;