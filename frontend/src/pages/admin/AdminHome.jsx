import { Link } from "react-router-dom";

function AdminHome() {
  return (
    <div className="px-6 py-12 max-w-2xl">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-ink">Admin</h1>
      </div>
      <ul className="space-y-4">
        <li>
          <Link
            to="/admin/hero"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Hero Images
          </Link>
        </li>
        <li>
          <Link
            to="/admin/campaign"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Campaign Images
          </Link>
        </li>
        <li>
          <Link
            to="/admin/products"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Products
          </Link>
        </li>
        <li>
          <Link
            to="/admin/collections"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Manage Collections
          </Link>
        </li>
        <li>
          <Link
            to="/admin/site-content"
            className="block border border-ink/10 px-6 py-4 text-sm uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-offwhite transition-colors"
          >
            Site Content
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default AdminHome;
