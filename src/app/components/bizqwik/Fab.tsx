import { Icon } from "./Icon";

// Global check-in shortcut, always reachable from any tab — mirrors the
// business app's Fab.tsx (circular, brand-colored, glowing shadow) but
// themed by the org's brand color and fixed to "scan to check in" rather
// than switching action by role.
export function Fab({ onClick, size = 60 }: { onClick: () => void; size?: number }) {
  return (
    <button
      onClick={onClick}
      aria-label="Scan to check in"
      title="Scan to check in"
      className="flex-none flex items-center justify-center active:scale-95 transition-transform"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: 0,
        background: "var(--bq-primary)",
        color: "#fff",
        boxShadow: "var(--glow-primary), 0 10px 24px rgba(0,0,0,.18)",
      }}
    >
      <Icon name="qr-code" size={size * 0.42} strokeWidth={2} />
    </button>
  );
}
