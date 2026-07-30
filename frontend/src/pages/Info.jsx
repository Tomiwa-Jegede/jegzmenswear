import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IconInfo } from "../components/icons";

function Info() {
  return (
    <>
      <Helmet>
        <title>Refund Policy & Delivery Info | Jegzmenswear</title>
        <meta
          name="description"
          content="Refund policy and delivery information for Jegzmenswear orders — processing times, shipping details, and customer support."
        />
        <link rel="canonical" href="https://jegzmenswear.store/info" />
      </Helmet>
    <div className="px-6 py-16 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-10">
        <IconInfo className="h-6 w-6 text-ink/40" />
        <h1 className="font-serif text-3xl text-ink">INFO</h1>
      </div>

      <section className="mb-12">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-ink mb-4">
          Refund Policy
        </h2>
        <p className="text-sm sm:text-base uppercase tracking-[0.15em] text-ink/60 leading-relaxed mb-4">
          ALL SALES ARE FINAL. WE DO NOT OFFER REFUNDS UNLESS THE ITEM IS
          UNAVAILABLE OR IF THE ITEM IS LOST IN TRANSIT.
        </p>
      </section>

      <section className="mb-12 border-t border-ink/10 pt-8">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-[0.2em] text-ink mb-4">
          Delivery Info
        </h2>
        <p className="text-sm sm:text-base uppercase tracking-[0.15em] text-ink/60 leading-relaxed">
          ALL ORDERS ARE PROCESSED WITHIN 7 BUSINESS DAYS BEFORE THEY ARE SENT
          OUT FOR DELIVERY. PLEASE CONFIRM THE DELIVERY INFORMATION FOR EACH
          ITEM BY READING ITS DESCRIPTION. TO ENSURE SMOOTH COMMUNICATION,
          PLEASE PROVIDE A VALID EMAIL AND PHONE NUMBER WHEN PLACING YOUR ORDER.
          NOTE THAT IMPORT DUTIES MAY APPLY FOR CUSTOMERS IN CERTAIN REGIONS.
        </p>
      </section>

      <div className="border-t border-ink/10 pt-8">
        <Link
          to="/shop"
          className="text-xs uppercase tracking-[0.2em] text-ink/50 hover:text-ink transition-colors"
        >
          ← Back to Shop
        </Link>
      </div>
    </div>
    </>
  );
}

export default Info;
