import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { AccountMenu } from "@/features/auth/AccountMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function itemClass(active: boolean): string {
  return `relative pb-0.5 text-sm transition-colors ${focusRing} ${
    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;
}

export function Nav() {
  const { t } = useTranslation("common");
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const comingSoon =
    location.pathname === "/" && new URLSearchParams(location.search).get("tab") === "coming-soon";
  const nowShowing = location.pathname === "/" && !comingSoon;

  const links = [
    { to: "/", label: t("nav.nowShowing"), active: nowShowing },
    { to: "/?tab=coming-soon", label: t("nav.comingSoon"), active: comingSoon },
    { to: "/cinema", label: t("nav.cinema"), active: location.pathname === "/cinema" },
    { to: "/membership", label: t("nav.membership"), active: location.pathname === "/membership" },
  ];

  return (
    <header className="bg-background/90 fixed top-0 right-0 left-0 z-50 border-b border-border backdrop-blur-md">
      <a
        href="#main"
        className="bg-primary text-primary-foreground font-display-action sr-only px-3 py-2 focus:not-sr-only focus:absolute focus:top-3 focus:left-4"
      >
        {t("skipToContent")}
      </a>
      <div className="flex h-16 items-center justify-between px-6 md:px-10">
        <Link to="/" className={`flex items-center gap-2 ${focusRing}`}>
          <span className="font-display text-xl tracking-widest text-foreground">{t("nav.logo")}</span>
        </Link>
        <nav aria-label={t("nav.main")} className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={link.active ? "page" : undefined}
              className={itemClass(link.active)}
            >
              {link.label}
              {link.active ? <span className="absolute right-0 bottom-0 left-0 h-px bg-primary" /> : null}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={t("nav.search")}
            className={`text-muted-foreground hover:text-foreground p-2 ${focusRing}`}
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <LanguageSwitcher />
          <AccountMenu />
          <button
            type="button"
            className={`text-muted-foreground hover:text-foreground p-2 md:hidden ${focusRing}`}
            aria-expanded={open}
            aria-controls="public-nav-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            <span className="sr-only">{open ? t("nav.closeMenu") : t("nav.openMenu")}</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="public-nav-mobile" aria-label={t("nav.main")} className="flex flex-col gap-1 border-t border-border px-6 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={link.active ? "page" : undefined}
              className={`${itemClass(link.active)} py-2`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
