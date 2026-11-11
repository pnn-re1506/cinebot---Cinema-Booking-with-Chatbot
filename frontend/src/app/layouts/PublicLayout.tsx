import { Outlet } from "react-router";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";

export function PublicLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Nav />
      <div className="flex-1 pt-16">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
