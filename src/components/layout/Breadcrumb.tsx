import { Link } from "react-router-dom";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <Fragment key={item.label}>
            {i > 0 && (
              <li aria-hidden="true" className="text-neutral-400">
                /
              </li>
            )}
            <li>
              {item.href ? (
                <Link to={item.href} className="focus-ring rounded hover:text-brand-600 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-neutral-900">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
