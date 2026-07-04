import { Outlet, useLocation } from "react-router";
import * as React from "react";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminLayout() {
  const { pathname } = useLocation();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // reset scroll on route change
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="adm-root flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1320px] px-8 py-7">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--adm-elevated)",
            border: "1px solid var(--adm-line-strong)",
            color: "var(--adm-text)",
          },
        }}
      />
    </div>
  );
}
