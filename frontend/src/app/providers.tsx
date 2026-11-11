import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/components/ui/use-mobile";
import i18n from "@/i18n";
import { createQueryClient } from "@/lib/queryClient";

function AppToaster() {
  const isMobile = useIsMobile();
  return <Toaster position={isMobile ? "top-center" : "bottom-right"} />;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        {children}
        <AppToaster />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
