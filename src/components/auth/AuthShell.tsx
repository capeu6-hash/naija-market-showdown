import { Link } from "@tanstack/react-router";
import { ArrowLeft, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const benefits = [
  { icon: PackageCheck, heading: "Trusted products", text: "Quality phones and laptops from verified suppliers." },
  { icon: Truck, heading: "Fast nationwide delivery", text: "Clear delivery fees and reliable order updates." },
  { icon: ShieldCheck, heading: "Secure by design", text: "Your account and personal details stay protected." },
];

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-muted lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-gold/20" />
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-gold/20" />
        <Link to="/" className="relative w-fit text-2xl font-extrabold tracking-tight">
          ShopArena <span className="text-gold">NG</span>
        </Link>
        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-gold">Your shopping, simplified</p>
          <h2 className="text-5xl font-extrabold leading-[1.08] tracking-tight">
            Quality gadgets.
            <br />
            <span className="text-gold">Delivered with confidence.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-ink-muted">
            One secure account for faster checkout, easy order tracking, and support whenever you need it.
          </p>
          <div className="mt-10 space-y-5">
            {benefits.map(({ icon: Icon, heading, text }) => (
              <div key={heading} className="flex items-start gap-4">
                <div className="rounded-xl bg-gold/10 p-3 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{heading}</p>
                  <p className="mt-1 text-sm text-ink-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-ink-muted">Shop smart. Shop secure. ShopArena NG.</p>
      </aside>

      <main className="flex min-h-screen flex-col px-4 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tight lg:hidden">
            ShopArena <span className="text-primary">NG</span>
          </Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            <section className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-foreground/5 sm:p-7">{children}</section>
            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              Protected by secure authentication. Never share your password or verification links.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
