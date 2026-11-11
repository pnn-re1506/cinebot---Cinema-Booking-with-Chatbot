import { useTranslation } from "react-i18next";

export function AccountMenu() {
  const { t } = useTranslation("common");

  return (
    <button
      type="button"
      className="bg-primary text-primary-foreground font-display-action px-4 py-2 text-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {t("auth.signIn")}
    </button>
  );
}
