import { useEffect, useState } from "react";
import { Dumbbell, QrCode, CheckCircle2 } from "lucide-react";
import { Sheet, Kicker, SheetTitle, SheetSub, Button, useMountedSheet } from "./Sheet";
import QRCode from "qrcode";
import type { PtBundle } from "../../../lib/api";
import { shortDate } from "../../../lib/plans";

// Private training: one card per running bundle. "Show code" opens the
// bundle's QR full screen for the coach to scan at the session — that scan is
// what deducts the session, so it proves the member was there.
export function PtCodes({ bundles }: { bundles: PtBundle[] }) {
  const [open, setOpen] = useState<PtBundle | null>(null);
  if (!bundles.length) return null;
  return (
    <>
      <div className="mt-3 flex flex-col gap-3">
        {bundles.map((b) => (
          <div key={b.id} data-testid="pt-bundle" className="rounded-[1.25rem] border border-[var(--bq-neutral-dark)] p-4">
            <div className="flex items-center gap-2 text-[var(--bq-text-secondary)] text-sm">
              <Dumbbell className="w-4 h-4" /> Private training · {b.coachName}
            </div>
            <div className="text-[var(--bq-text-primary)] font-display text-[17px] mt-1">
              {b.sessionsRemaining} of {b.sessionsIncluded} sessions left
            </div>
            <div className="text-[var(--bq-text-tertiary)] text-xs mt-0.5">
              {b.name}{new Date(b.expiryDate).getFullYear() - new Date().getFullYear() >= 5 ? "" : ` · expires ${shortDate(b.expiryDate)}`}
            </div>
            <button
              onClick={() => setOpen(b)}
              className="mt-3 w-full h-11 rounded-[0.9rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <QrCode className="w-5 h-5" /> Show code to your coach
            </button>
          </div>
        ))}
      </div>
      {open && <PtCodeSheet bundle={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/** The bundle's code for the coach to scan, in the same sheet as the other
 * quick actions. */
export function PtCodeSheet({ bundle, onClose }: { bundle: PtBundle; onClose: () => void }) {
  const [open, close] = useMountedSheet(onClose);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(bundle.qrToken, { errorCorrectionLevel: "M", margin: 2, width: 720 })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [bundle.qrToken]);

  return (
    <Sheet open={open} onClose={close} label="PT code">
      <Kicker>PT code</Kicker>
      <SheetTitle>{bundle.name}</SheetTitle>
      <SheetSub>
        Show this to {bundle.coachName} when your session starts. · {bundle.sessionsRemaining} of {bundle.sessionsIncluded} sessions left
      </SheetSub>
      <div className="mx-auto w-full max-w-[280px] aspect-square rounded-[24px] border border-[var(--bq-neutral-dark)] p-3 flex items-center justify-center bg-white">
        {src ? (
          <img data-testid="pt-qr" src={src} alt="PT session code" className="w-full h-full" style={{ imageRendering: "pixelated" }} />
        ) : (
          <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
        )}
      </div>
      {bundle.loggedToday && (
        <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[12px] text-[var(--bq-text-secondary)]">
          <CheckCircle2 className="w-4 h-4" /> Today's session is already logged
        </div>
      )}
      <Button fullWidth size="lg" style={{ marginTop: 16 }} onClick={close} aria-label="Close code">
        Done
      </Button>
    </Sheet>
  );
}
