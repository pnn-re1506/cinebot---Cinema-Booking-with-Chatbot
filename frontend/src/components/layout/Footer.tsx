import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="border-t border-border px-6 py-10 md:px-16">
      <p className="font-display text-xl tracking-widest text-foreground">{t("nav.logo")}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-label text-muted-foreground">{t("footer.addressLabel")}</p>
          <p>
            <Link
              to="/cinema"
              aria-label={t("footer.addressLabel")}
              className={`text-foreground text-sm hover:text-primary ${focusRing}`}
            >
              {t("footer.cinemaDetails")}
            </Link>
          </p>
          <p className="font-label text-muted-foreground">{t("footer.hotlineLabel")}</p>
          <p>
            <Link
              to="/cinema"
              aria-label={t("footer.hotlineLabel")}
              className={`text-foreground text-sm hover:text-primary ${focusRing}`}
            >
              {t("footer.cinemaDetails")}
            </Link>
          </p>
        </div>
        <nav aria-label={t("footer.findBooking")} className="flex flex-col items-start gap-3">
          <Link to="/bookings/lookup" className={`text-sm text-foreground hover:text-primary ${focusRing}`}>
            {t("footer.findBooking")}
          </Link>
          <Link to="/admin" className={`text-sm text-muted-foreground hover:text-primary ${focusRing}`}>
            {t("footer.adminDemo")}
          </Link>
        </nav>
      </div>
      <p className="font-label text-muted-foreground mt-8">{t("demoDisclaimer")}</p>
    </footer>
  );
}
