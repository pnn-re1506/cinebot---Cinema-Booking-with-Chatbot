import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Providers } from "./app/providers";
import { router } from "./app/router";
import "./i18n";
import "./styles/index.css";

async function prepare(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element #root is missing");
}

void prepare().then(() => {
  createRoot(root).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
});
