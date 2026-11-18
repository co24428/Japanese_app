/**
 * Animates a page in and out when you navigate (React <ViewTransition> +
 * the browser's View Transitions API; see the "Page transitions" section of
 * src/app/globals.css for the actual animations).
 *
 * Wrap the content of every page.tsx in it. It must be in the page, not in
 * a layout: layouts stay mounted across navigations, so they never "enter".
 *
 * The animation depends on the link that was clicked:
 *   <Link transitionTypes={["nav-forward"]}>  slides the new page in from the right
 *   <Link transitionTypes={["nav-back"]}>     slides it in from the left
 *   any other navigation                       fades and rises
 * Browsers without support switch pages instantly, as before.
 */
import { ViewTransition } from "react";

/** Transition types used on links. Import these instead of typing the strings. */
export const FORWARD = ["nav-forward"];
export const BACK = ["nav-back"];

const ANIMATIONS = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "page-fade" };

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    // `update="none"`: refreshing data on the same page must not animate.
    <ViewTransition enter={ANIMATIONS} exit={ANIMATIONS} update="none" default="none">
      {/* ViewTransition needs one real element to snapshot. */}
      <div>{children}</div>
    </ViewTransition>
  );
}
