import { Suspense, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

function RouteFallback() {
  const { t } = useTranslation("common");
  return (
    <div role="status" className="font-body text-muted-foreground px-6 py-12 md:px-16">
      {t("loading")}
    </div>
  );
}

export function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}
