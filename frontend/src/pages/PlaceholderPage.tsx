import { useTranslation } from "react-i18next";

export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <main id="main" className="px-6 py-12 md:px-16">
      <h1 className="font-display text-foreground text-4xl md:text-5xl">{t(titleKey)}</h1>
      <p className="font-body text-muted-foreground mt-4 max-w-xl">{t("common:placeholder.body")}</p>
    </main>
  );
}
