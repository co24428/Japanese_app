/**
 * Layout for every page behind the login.
 *
 * Folder names in (parentheses) are "route groups": they organise files
 * without appearing in the URL.
 *   (app)/(main)   pages with the navigation bar
 *   (app)/(focus)  full-screen pages (the lesson player)
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrefsProvider } from "@/components/PrefsProvider";
import { TimeZoneSync } from "@/components/TimeZoneSync";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getPrefs } from "@/server/settings";
import { getTimeZone } from "@/server/today";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // The proxy already blocks visitors without a session. Checking again here
  // means the pages stay protected even if the proxy is ever misconfigured.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) redirect("/login");

  const [prefs, timeZone] = await Promise.all([getPrefs(), getTimeZone()]);

  return (
    <PrefsProvider prefs={prefs}>
      <TimeZoneSync serverTimeZone={timeZone} />
      {children}
    </PrefsProvider>
  );
}
