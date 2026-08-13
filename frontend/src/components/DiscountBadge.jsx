import { useEffect, useState, useCallback } from "react";
import api from "../lib/axios";

const STORAGE_KEY = "onfleek_discount_code";

function DiscountBadge() {
  const [discount, setDiscount] = useState(null);
  const [copied, setCopied] = useState(false);

  const checkStoredCode = useCallback(() => {
    let stored;
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      stored = null;
    }
    if (!stored?.code) {
      setDiscount(null);
      return;
    }
    api
      .get(`/discount-codes/${encodeURIComponent(stored.code)}`)
      .then((res) => {
        if (res.data.valid) {
          setDiscount({ code: stored.code, amount: Number(res.data.amount) });
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setDiscount(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setDiscount(null);
      });
  }, []);

  useEffect(() => {
    checkStoredCode();
    window.addEventListener("onfleek-discount-updated", checkStoredCode);
    return () =>
      window.removeEventListener("onfleek-discount-updated", checkStoredCode);
  }, [checkStoredCode]);

  if (!discount) return null;

  function handleClick() {
    navigator.clipboard?.writeText(discount.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-ink text-offwhite text-xs uppercase tracking-[0.15em] shadow-lg hover:scale-105 transition-transform cursor-pointer"
      title="Click to copy your discount code"
    >
      {copied ? "Copied!" : `🎉 ${discount.code} — ₦${discount.amount.toLocaleString()} off`}
    </button>
  );
}

export default DiscountBadge;