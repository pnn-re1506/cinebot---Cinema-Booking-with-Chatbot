import { useTranslation } from "react-i18next";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");
  const current = i18n.resolvedLanguage === "en" ? "en" : "vi";

  return (
    <div role="group" aria-label={t("language.label")} className="font-label flex items-center text-xs">
      <button
        type="button"
        aria-pressed={current === "vi"}
        aria-label={t("language.vi")}
        className={`${focusRing} px-1 ${current === "vi" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => i18n.changeLanguage("vi")}
      >
        VI
      </button>
      <span aria-hidden="true" className="text-muted-foreground">
        |
      </span>
      <button
        type="button"
        aria-pressed={current === "en"}
        aria-label={t("language.en")}
        className={`${focusRing} px-1 ${current === "en" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
