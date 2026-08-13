import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

function Welcome() {
  const [searchParams] = useSearchParams();
  const [saved, setSaved] = useState(false);
  const code = searchParams.get("code");
  const amount = searchParams.get("amount");
  const error = searchParams.get("error");

  useEffect(() => {
    if (code) {
      localStorage.setItem(
        "onfleek_discount_code",
        JSON.stringify({ code, amount: Number(amount) }),
      );
      window.dispatchEvent(new Event("onfleek-discount-updated"));
      setSaved(true);
    }
  }, [code, amount]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 text-center">
      {code && saved ? (
        <div>
          <h1 className="font-serif text-2xl text-ink mb-3">You're confirmed 🎉</h1>
          <p className="text-sm text-ink/60 mb-4">
            Your discount code is <strong>{code}</strong>
          </p>
          <Link to="/shop" className="text-sm underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div>
          <h1 className="font-serif text-2xl text-ink mb-3">
            {error ? "That link didn't work" : "Confirming..."}
          </h1>
          <p className="text-sm text-ink/60">
            {error
              ? "This link may have expired or already been used."
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export default Welcome;