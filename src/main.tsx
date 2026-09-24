import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { installNativeShell } from "./app/nativeShell.ts";
import { BrandingProvider } from "./lib/branding";
import { AuthProvider } from "./lib/auth";
import "./styles/index.css";

installNativeShell();
createRoot(document.getElementById("root")!).render(
  <BrandingProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrandingProvider>,
);
