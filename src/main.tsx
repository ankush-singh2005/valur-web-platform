import { createRoot } from "react-dom/client";
import "./styles/index.css";
import AdminApp from "./admin/AdminApp";

const root = createRoot(document.getElementById("root")!);
root.render(<AdminApp />);
