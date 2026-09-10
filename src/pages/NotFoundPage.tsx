import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { SeoHead } from "../components/seo/SeoHead";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[520px] flex-col items-center gap-4 px-4 py-24 text-center">
      <SeoHead title="Page not found — Toolkit4Me" description="The page you're looking for doesn't exist or may have moved." path="/404" noindex />
      <h1 className="text-3xl font-bold text-neutral-900">Page not found</h1>
      <p className="text-sm text-neutral-600">
        The page you're looking for doesn't exist or may have moved. Try browsing all tools instead.
      </p>
      <Link to="/tools">
        <Button variant="primary">Browse all tools</Button>
      </Link>
    </div>
  );
}
