import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export function AdminLayout() {
  const { t } = useTranslation("common");

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/95 sticky top-0 z-10 flex items-center justify-end border-b border-border px-8 py-4 backdrop-blur">
          <p className="font-label border-primary/30 bg-primary/10 text-primary flex items-center gap-2 border px-3 py-1.5">
            <Shield size={12} aria-hidden="true" />
            {t("admin.badge")}
          </p>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
