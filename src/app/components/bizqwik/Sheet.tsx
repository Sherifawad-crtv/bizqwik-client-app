import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Bizqwik's own sheet, button and success check (the same components as the
// staff app), in the gym's colour. Every sheet, confirmation and message in
// the member app uses these.

const SETTLE_MS = 280;
const EXIT_MS = 240;
type Phase = "opening" | "open" | "closing";

/** Floating bottom sheet: slides up, drag the handle down to dismiss. */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label?: string }) {
  const [visible, setVisible] = useState(open);
  const [phase, setPhase] = useState<Phase>(open ? "opening" : "closing");
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const y0 = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setDragY(0);
      setPhase("opening");
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPhase("open"));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setPhase("closing");
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setVisible(false);
    };
    const el = panelRef.current;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "transform") finish();
    };
    el?.addEventListener("transitionend", onEnd);
    const fallback = window.setTimeout(finish, EXIT_MS + 150);
    return () => {
      el?.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
    };
  }, [open]);

  if (!visible) return null;

  const dragEnd = () => {
    setDragging(false);
    if (dragY > 150) onClose();
    else setDragY(0);
  };
  const transform = dragging ? `translateY(${dragY}px)` : phase === "open" ? "translateY(0)" : "translateY(100%)";
  const transition = dragging || phase === "opening" ? "none" : phase === "closing" ? `transform ${EXIT_MS}ms ease-in` : `transform ${SETTLE_MS}ms ease-out`;

  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(26,23,38,.34)" }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: "calc(8px + env(safe-area-inset-left))",
          right: "calc(8px + env(safe-area-inset-right))",
          bottom: "calc(8px + env(safe-area-inset-bottom))",
          maxWidth: 414,
          margin: "0 auto",
          maxHeight: "calc(88svh - 16px)",
          display: "flex",
          flexDirection: "column",
          transform,
          transition,
          touchAction: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#fff", borderRadius: 40, border: "1px solid var(--bq-neutral-dark)", padding: "10px 20px 20px" }}>
          <div
            onPointerDown={(e) => {
              (e.currentTarget as Element).setPointerCapture(e.pointerId);
              y0.current = e.clientY;
              setDragging(true);
            }}
            onPointerMove={(e) => {
              if (!dragging) return;
              const d = e.clientY - y0.current;
              setDragY(d > 0 ? d : d / 6);
            }}
            onPointerUp={dragEnd}
            style={{ padding: "8px 0 14px", cursor: "grab", touchAction: "none", flex: "none" }}
          >
            <div style={{ width: 44, height: 5, borderRadius: 999, background: "var(--bq-neutral-dark)", margin: "0 auto" }} />
          </div>
          <div style={{ overflowY: "auto", touchAction: "pan-y" }}>{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Small monospace caps line above a sheet title. */
export function Kicker({ children }: { children: ReactNode }) {
  return <div style={{ font: "700 11px var(--font-mono)", letterSpacing: ".08em", color: "var(--bq-text-tertiary)", textTransform: "uppercase" }}>{children}</div>;
}
export function SheetTitle({ children }: { children: ReactNode }) {
  return <div style={{ font: "800 26px/1.2 var(--font-display)", letterSpacing: "-.02em", margin: "4px 0 4px", color: "var(--bq-text-primary)" }}>{children}</div>;
}
export function SheetSub({ children }: { children: ReactNode }) {
  return <div style={{ font: "400 13px/1.5 var(--font-mono)", color: "var(--bq-text-secondary)", marginBottom: 16 }}>{children}</div>;
}
export function ErrorNote({ children }: { children: ReactNode }) {
  return <div style={{ marginBottom: 12, font: "600 13px/1.5 var(--font-display)", color: "#b23a3a", background: "#f6dedc", borderRadius: 14, padding: "10px 14px" }}>{children}</div>;
}

type Variant = "primary" | "secondary" | "quiet" | "danger";
const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: "var(--bq-primary)", fg: "var(--bq-on-primary)" },
  secondary: { bg: "color-mix(in srgb, var(--bq-primary) 10%, #fff)", fg: "var(--bq-primary-readable)" },
  quiet: { bg: "var(--bq-neutral)", fg: "var(--bq-text-secondary)", border: "1px solid var(--bq-neutral-dark)" },
  danger: { bg: "#f6dedc", fg: "#b23a3a" },
};

export function Button({ variant = "primary", fullWidth, size = "md", style, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; fullWidth?: boolean; size?: "md" | "lg" }) {
  const v = VARIANTS[variant];
  return (
    <button
      disabled={disabled}
      style={{
        height: size === "lg" ? 56 : 48,
        padding: "0 22px",
        width: fullWidth ? "100%" : undefined,
        borderRadius: 24,
        border: v.border ?? 0,
        background: v.bg,
        color: v.fg,
        font: "700 16px var(--font-display)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "opacity .15s ease",
        ...style,
      }}
      {...rest}
    />
  );
}

const CIRCLE_LEN = 176;
const CHECK_LEN = 42;
/** The check that draws itself inside a sheet when something succeeds. */
export function SheetSuccessIcon({ label, sub, iconIn }: { label: string; sub?: ReactNode; iconIn: boolean }) {
  return (
    <div data-testid="sheet-success" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 4px 10px", textAlign: "center" }}>
      <div
        aria-hidden
        style={{
          width: 84,
          height: 84,
          borderRadius: 999,
          background: "color-mix(in srgb, var(--bq-primary) 10%, #fff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: iconIn ? "scale(1)" : "scale(0.7)",
          opacity: iconIn ? 1 : 0,
          transition: "transform .35s cubic-bezier(.34,1.56,.64,1), opacity .2s ease",
        }}
      >
        <svg width={44} height={44} viewBox="0 0 64 64" fill="none">
          <circle cx={32} cy={32} r={28} stroke="var(--bq-primary)" strokeWidth={3} strokeLinecap="round" style={{ strokeDasharray: CIRCLE_LEN, strokeDashoffset: iconIn ? 0 : CIRCLE_LEN, transition: "stroke-dashoffset .5s cubic-bezier(.65,0,.35,1)" }} />
          <path d="M18 34 L27 43 L46 21" stroke="var(--bq-primary)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: CHECK_LEN, strokeDashoffset: iconIn ? 0 : CHECK_LEN, transition: "stroke-dashoffset .3s ease-out .35s" }} />
        </svg>
      </div>
      <div style={{ marginTop: 16, font: "700 16px var(--font-display)", color: "var(--bq-text-primary)" }}>{label}</div>
      {sub && <div style={{ marginTop: 6, font: "400 13px/1.5 var(--font-mono)", color: "var(--bq-text-secondary)" }}>{sub}</div>}
    </div>
  );
}

/** Show the success check inside a sheet, then close it. */
export function useSheetSuccess(open: boolean, onClose: () => void, holdMs = 900) {
  const [confirmed, setConfirmed] = useState(false);
  const [iconIn, setIconIn] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setIconIn(false);
    }
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const showSuccess = () => {
    setConfirmed(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setIconIn(true)));
    timer.current = window.setTimeout(onClose, holdMs);
  };
  return { confirmed, iconIn, showSuccess };
}

/** Are-you-sure sheet: kicker, title, what happens, confirm + cancel. On
 * success it shows the check and closes itself. */
export function ConfirmSheet({
  open,
  onClose,
  kicker,
  title,
  sub,
  confirmLabel,
  doneLabel,
  cancelLabel = "Cancel",
  danger,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  kicker: string;
  title: string;
  sub?: ReactNode;
  confirmLabel: string;
  doneLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<ReactNode | void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneSub, setDoneSub] = useState<ReactNode>(null);
  const { confirmed, iconIn, showSuccess } = useSheetSuccess(open, onClose, 1600);
  useEffect(() => {
    if (open) setError(null);
  }, [open]);
  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      setDoneSub((await onConfirm()) ?? null);
      showSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} label={title}>
      {confirmed ? (
        <SheetSuccessIcon label={doneLabel ?? confirmLabel} sub={doneSub} iconIn={iconIn} />
      ) : (
        <>
          <Kicker>{kicker}</Kicker>
          <SheetTitle>{title}</SheetTitle>
          {sub && <SheetSub>{sub}</SheetSub>}
          {error && <ErrorNote>{error}</ErrorNote>}
          <Button variant={danger ? "danger" : "primary"} fullWidth size="lg" disabled={busy} onClick={go}>
            {busy ? "Working…" : confirmLabel}
          </Button>
          <Button variant="quiet" fullWidth style={{ marginTop: 8 }} onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
        </>
      )}
    </Sheet>
  );
}

/** For a sheet that's mounted only while needed: starts open, and `close`
 * lets it slide away before the parent unmounts it. */
export function useMountedSheet(onClosed: () => void): [boolean, () => void] {
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    window.setTimeout(onClosed, EXIT_MS);
  };
  return [open, close];
}
