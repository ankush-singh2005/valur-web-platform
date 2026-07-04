import { createRoot } from "react-dom/client";
import "./styles/index.css";

const root = createRoot(document.getElementById("root")!);
const isAdmin = window.location.pathname.startsWith("/admin");

if (isAdmin) {
  // Valur Operations & Business Console (admin portal)
  import("./admin/AdminApp.tsx").then(({ default: AdminApp }) => {
    root.render(<AdminApp />);
  });
} else {
  // Consumer apps (coach / player / club)
  import("./app/App.tsx").then(({ default: App }) => {
    root.render(<App />);
  });
}
