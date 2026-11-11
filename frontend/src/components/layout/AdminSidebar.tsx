import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  CalendarRange,
  Clapperboard,
  LayoutDashboard,
  MonitorPlay,
  Popcorn,
  ScrollText,
  Theater,
  Ticket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const items: { to: string; end?: boolean; labelKey: string; icon: LucideIcon }[] = [
  { to: "/admin", end: true, labelKey: "pages.adminDashboard", icon: LayoutDashboard },
  { to: "/admin/movies", labelKey: "pages.adminMovies", icon: Clapperboard },
  { to: "/admin/rooms", labelKey: "pages.adminRooms", icon: Theater },
  { to: "/admin/showtimes", labelKey: "pages.adminShowtimes", icon: MonitorPlay },
  { to: "/admin/templates", labelKey: "pages.adminTemplates", icon: CalendarRange },
  { to: "/admin/pricing", labelKey: "pages.adminPricing", icon: BadgeDollarSign },
  { to: "/admin/snacks", labelKey: "pages.adminSnacks", icon: Popcorn },
  { to: "/admin/bookings", labelKey: "pages.adminBookings", icon: Ticket },
  { to: "/admin/audit-log", labelKey: "pages.adminAuditLog", icon: ScrollText },
];

export function AdminSidebar() {
  const { t } = useTranslation("common");

  return (
    <aside className="bg-card flex w-56 shrink-0 flex-col border-r border-border">
      <div className="border-b border-border px-5 py-5">
        <p className="font-display text-sm tracking-widest text-foreground">{t("nav.logo")}</p>
        <p className="font-label text-muted-foreground mt-1 text-[10px]">{t("admin.panel")}</p>
      </div>
      <nav aria-label={t("admin.panel")} className="flex-1 space-y-0.5 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${focusRing} ${
                  isActive
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>
      <div className="space-y-1 px-3 pb-4">
        <NavLink
          to="/"
          className={`text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-3 px-3 py-2.5 text-sm ${focusRing}`}
        >
          {t("admin.viewPublic")}
        </NavLink>
        <NavLink
          to="/admin/login"
          className={`text-danger-text hover:bg-accent/10 flex items-center gap-3 px-3 py-2.5 text-sm ${focusRing}`}
        >
          {t("admin.signOut")}
        </NavLink>
      </div>
    </aside>
  );
}
