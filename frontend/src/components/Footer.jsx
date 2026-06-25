import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";

const comingSoon = ["Story", "Journal", "Contact"];
const socials = ["Instagram", "TikTok", "Pinterest"];

function Footer() {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    api
      .get("/collections")
      .then((res) => setCollections(res.data))
      .catch(console.error);
  }, []);

  return (
    <footer className="border-t border-ink/10 bg-offwhite px-6 py-16 sm:px-10 lg:px-16">
      <div className="grid gap-12 sm:grid-cols-3">
        <div>
          <Link to="/" className="font-serif text-2xl text-ink">
            Onfleek
          </Link>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40 mb-4">
            Shop
          </p>
          <ul className="space-y-2">
            {collections.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/collections/${c.slug}`}
                  className="text-sm text-ink/70 hover:text-ink transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink/40 mb-4">
            More
          </p>
          <ul className="space-y-2">
            {comingSoon.map((item) => (
              <li key={item}>
                <span className="text-sm text-ink/30 cursor-default">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-ink/10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-ink/60">
          Onfleek Worldwide — Est. Always.
        </p>
        <div className="flex gap-5">
          {socials.map((s) => (
            <span
              key={s}
              className="text-xs uppercase tracking-[0.15em] text-ink/30 cursor-default"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
