/** Pages with navigation: a bottom tab bar on phones, a sidebar on laptops. */
import { Nav } from "@/components/Nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-56">
      <Nav />
      {/* Bottom padding keeps content clear of the phone tab bar. */}
      <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16">{children}</main>
    </div>
  );
}
