import { Outlet } from "react-router-dom";
import TopMenu from "@/components/layout/top-menu";
import { Footer } from "@/components/layout/footer";

export function Layout() {
  return (
    <div className="flex flex-column min-h-screen">
      <TopMenu />

      <main className="flex-grow-1 flex flex-column">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}