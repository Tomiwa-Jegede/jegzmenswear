import { Link } from "react-router-dom";
import onfleekLogoDark from "../assets/onfleek-logo-dark.png";

export function IconInstagram({ className = "" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="12" height="12" rx="3" />
      <circle cx="8" cy="8" r="2.8" />
      <circle cx="11.5" cy="4.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTikTok({ className = "" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M11.5 2a3.5 3.5 0 003.5 3.5V8a6 6 0 01-3.5-1.1V11a5 5 0 11-5-5v2.7a2.3 2.3 0 102.3 2.3V2h2.7z" />
    </svg>
  );
}

export function IconPinterest({ className = "" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M8 1a7 7 0 00-2.6 13.5c0-.7.1-1.7.3-2.5l1.1-4.7s-.3-.6-.3-1.4c0-1.3.8-2.3 1.7-2.3.8 0 1.2.6 1.2 1.4 0 .8-.5 2.1-.8 3.2-.2.9.5 1.7 1.4 1.7 1.7 0 2.8-2.2 2.8-4.7 0-1.9-1.3-3.3-3.4-3.3-2.4 0-3.8 1.8-3.8 3.7 0 .7.2 1.2.5 1.5.1.1.1.2.1.3l-.2.8c-.1.2-.2.3-.4.2-1.2-.5-1.8-1.9-1.8-3.5 0-2.6 2.2-5.7 6.5-5.7 3.5 0 5.7 2.6 5.7 5.3 0 3.5-1.9 6-4.7 6-.9 0-1.8-.5-2.1-1.1l-.6 2.2c-.2.8-.7 1.7-1.1 2.3A7 7 0 108 1z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-offwhite px-6 py-16 sm:px-10 lg:px-16">
      <div className="flex flex-col items-center gap-8">
        <Link to="/" className="inline-block">
          <img src={onfleekLogoDark} alt="Onfleek" className="w-32 h-auto" />
        </Link>
        <Link
          to="/info"
          className="text-xs uppercase tracking-[0.2em] text-ink/40 hover:text-ink transition-colors"
        >
          Refund Policy &amp; Delivery Info
        </Link>
        <div className="flex gap-6 items-center">
          <IconInstagram className="h-5 w-5 text-ink/60 hover:text-ink transition-colors" />
          <IconTikTok className="h-5 w-5 text-ink/60 hover:text-ink transition-colors" />
          <IconPinterest className="h-5 w-5 text-ink/60 hover:text-ink transition-colors" />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
