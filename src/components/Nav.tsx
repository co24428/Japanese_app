"use client";
/**
 * Main navigation. One list of tabs, drawn two ways with CSS:
 *   - phones:  fixed bar at the bottom of the screen
 *   - md and up: fixed sidebar on the left
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, ChatIcon, GearIcon, HomeIcon, RepeatIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/learn", label: "Learn", icon: BookIcon },
  { href: "/review", label: "Review", icon: RepeatIcon },
  { href: "/talk", label: "Talk", icon: ChatIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:w-56 md:border-t-0 md:border-r md:px-3 md:py-6"
    >
      <Link href="/" className="mb-6 hidden items-baseline gap-2 px-3 md:flex">
        <span lang="ja" className="text-2xl font-black">
          日本語
        </span>
        <span className="text-sm font-semibold text-muted">Daily</span>
      </Link>

      <ul className="flex md:flex-col md:gap-1">
        {TABS.map(({ href, label, icon: TabIcon }) => {
          const active = isActive(href);
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-semibold md:flex-row md:gap-3 md:rounded-xl md:px-3 md:py-2.5 md:text-sm ${
                  active ? "text-primary md:bg-primary-soft" : "text-muted hover:text-ink md:hover:bg-surface-2"
                }`}
              >
                <TabIcon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
