import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (window.location.hostname === "planalert.com") {
  window.location.replace(
    `https://www.planalert.com${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
