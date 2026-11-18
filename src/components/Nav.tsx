"use client";
/**
 * Main navigation. One list of tabs, drawn two ways with CSS:
 *   - phones:  fixed bar at the bottom of the screen
 *   - md and up: fixed sidebar on the left
 *
 * Switching tabs slides the page in the direction of the tab (a tab to the
 * right slides in from the right), like native mobile apps.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BACK, FORWARD } from "./PageTransition";
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
  // /kana lives under Learn even though its URL does not start with /learn.
  const activeIndex = pathname.startsWith("/kana") ? 1 : TABS.findIndex((t) => isActive(t.href));

  return (
    <nav
      aria-label="Main"
      // A fixed name lets page transitions leave the navigation in place.
      style={{ viewTransitionName: "app-nav" }}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:inset-y-0 md:right-auto md:w-56 md:border-t-0 md:border-r md:bg-surface md:px-3 md:py-6"
    >
      <Link href="/" className="group mb-6 hidden items-baseline gap-2 px-3 md:flex">
        <span lang="ja" className="text-2xl font-black transition-colors group-hover:text-primary">
          日本語
        </span>
        <span className="text-sm font-semibold text-muted">Daily</span>
      </Link>

      <ul className="flex md:flex-col md:gap-1">
        {TABS.map(({ href, label, icon: TabIcon }, index) => {
          const active = index === activeIndex;
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                transitionTypes={index > activeIndex ? FORWARD : index < activeIndex ? BACK : undefined}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center gap-0.5 px-1 pt-1.5 pb-2 text-[11px] font-semibold transition-colors md:flex-row md:gap-3 md:rounded-xl md:px-3 md:py-2.5 md:text-sm ${
                  active ? "text-primary md:bg-primary-soft" : "text-muted hover:text-ink md:hover:bg-surface-2"
                }`}
              >
                {/* On phones the active icon sits in a coloured pill. */}
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-[background-color,scale] duration-200 group-hover:scale-110 group-active:scale-90 md:h-auto md:w-auto md:bg-transparent ${
                    active ? "bg-primary-soft" : ""
                  }`}
                >
                  <TabIcon className="size-[22px]" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
