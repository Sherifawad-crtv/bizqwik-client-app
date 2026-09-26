import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { installNativeShell } from "./app/nativeShell.ts";
import { BrandingProvider } from "./lib/branding";
import { AuthProvider } from "./lib/auth";
import { SECURE_FALLBACK_ORIGIN, subdomainSlug } from "./lib/config";
import "./styles/index.css";

// The camera (QR check-in) only works on a secure, top-level page. If the app
// is ever reached over plain http, or framed by another site (e.g. a domain
// forwarded "with masking"), move to the real https page first.
async function ensureSecureTopLevel(): Promise<boolean> {
  const { protocol, hostname, host, pathname, search, hash } = window.location;
  const local = hostname === "localhost" || hostname === "127.0.0.1";
  if (protocol === "http:" && !local) {
    // Only move if https actually works for this domain (a gym's subdomain
    // may not have its certificate yet) — otherwise stay on http rather than
    // sending the member to a broken page.
    const secure = `https://${host}`;
    // http -> https is cross-origin: no-cors resolves (opaque) when the TLS
    // handshake succeeds and rejects when it doesn't, which is all we need.
    const ok = await fetch(`${secure}/?probe=${Date.now()}`, { mode: "no-cors", cache: "no-store" })
      .then(() => true)
      .catch(() => false);
    if (ok) {
      window.location.replace(`${secure}${pathname}${search}${hash}`);
      return false;
    }
    // No certificate for this gym's subdomain yet: use the shared secure
    // address instead, carrying the gym along.
    const slug = subdomainSlug(hostname);
    if (slug) {
      const params = new URLSearchParams(search);
      params.set("gym", slug);
      window.location.replace(`${SECURE_FALLBACK_ORIGIN}${pathname}?${params}${hash}`);
      return false;
    }
  }
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = window.location.href;
      return false;
    }
  } catch {
    // A cross-origin parent blocks access; nothing more we can do from here.
  }
  return true;
}

void ensureSecureTopLevel().then((ok) => {
  if (!ok) return;
  installNativeShell();
  createRoot(document.getElementById("root")!).render(
    <BrandingProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrandingProvider>,
  );
});
