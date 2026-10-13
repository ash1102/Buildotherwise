import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LOOP = ["Notice", "Try", "Reflect", "Decide"];

/**
 * Login, sign-up and password screens share the homepage's look: a plum panel with
 * the program's name and loop, and the form on chalk. On a phone the panel becomes a band.
 */
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="bg-primary px-5 py-6 text-primary-foreground sm:px-8 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-[18px] font-bold tracking-tight text-primary-foreground">
            Entrepalooza
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary-foreground/85 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </div>

        <div className="mt-6 lg:mt-0">
          <p className="text-[13px] font-semibold text-primary-soft">Build Otherwise · Pilot 1</p>
          <p className="mt-2 max-w-[22ch] text-[clamp(1.4rem,1rem+2vw,2.6rem)] font-semibold leading-[1.1] tracking-tight">
            You don’t need your whole life figured out.
          </p>
          <ol className="mt-5 hidden flex-wrap gap-2 sm:flex" aria-label="The learning loop">
            {LOOP.map((step, index) => (
              <li
                key={step}
                className={`rounded-full border px-3 py-1 text-[14px] ${
                  index === LOOP.length - 1
                    ? "border-primary-soft bg-primary-soft text-foreground"
                    : "border-primary-foreground/40 text-primary-foreground"
                }`}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 hidden text-[13px] text-primary-foreground/70 lg:block">
          An educational workbook, not therapy, treatment or diagnosis.
        </p>
      </aside>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12 lg:items-center">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3">
            {Icon ? (
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-wash">
                <Icon className="h-5 w-5 text-accent-ink" aria-hidden="true" />
              </span>
            ) : null}
            <div>
              <h1 className="text-[1.75rem] font-semibold leading-tight text-foreground">{title}</h1>
              {subtitle ? <p className="mt-0.5 text-[15px] text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">{children}</div>
          {footer ? <p className="mt-6 text-center text-[15px] text-muted-foreground">{footer}</p> : null}
        </div>
      </main>
    </div>
  );
}
