
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { installNativeShell } from "./app/nativeShell.ts";
  import "./styles/index.css";

  installNativeShell();
  createRoot(document.getElementById("root")!).render(<App />);
