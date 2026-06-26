import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import onfleekLogoDark from "../assets/onfleek-logo-dark.png";

const comingSoon = ["Story", "Journal", "Contact"];

function IconInstagram({ className = "" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="3" />
      <circle cx="8" cy="8" r="2.8" />
      <circle cx="11.5" cy="4.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTikTok({ className = "" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M11.5 2a3.5 3.5 0 003.5 3.5V8a6 6 0 01-3.5-1.1V11a5 5 0 11-5-5v2.7a2.3 2.3 0 102.3 2.3V2h2.7z" />
    </svg>
  );
}

function IconPinterest({ className = "" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1a7 7 0 00-2.6 13.5c0-.7.1-1.7.3-2.5l1.1-4.7s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.2.9.5 1.7 1.4 1.7 1.7 0 2.8-2.2 2.8-4.7 0-1.9-1.3-3.3-3.4-3.3-2.4 0-3.8 1.8-3.8 3.7 0 .7.2 1.2.5 1.5.1.1.1.2.1.3l-.2.8c-.1.2-.2.3-.4.2-1.2-.5-1.8-1.9-1.8-3.5 0-2.6 2.2-5.7 6.5-5.7 3.5 0 5.7 2.6 5.7 5.3 0 3.5-1.9 6-4.7 6-.9 0-1.8-.5-2.1-1.1l-.6 2.2c-.2.8-.7 1.7-1.1 2.3A7 7 0 108 1z" />
    </svg>
  );
}

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
          <Link to="/" className="inline-block">
            <img src={onfleekLogoDark} alt="Onfleek" className="w-32 h-auto" />
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
        <div className="flex gap-5 items-center">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/40 cursor-default">
            <IconInstagram className="h-4 w-4" /> Instagram
          </span>
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/40 cursor-default">
            <IconTikTok className="h-4 w-4" /> TikTok
          </span>
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink/40 cursor-default">
            <IconPinterest className="h-4 w-4" /> Pinterest
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
