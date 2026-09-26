import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, QrCode, X, CheckCircle2 } from "lucide-react";
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
              {b.name} · expires {shortDate(b.expiryDate)}
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
      <AnimatePresence>{open && <PtCodeSheet bundle={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  );
}

function PtCodeSheet({ bundle, onClose }: { bundle: PtBundle; onClose: () => void }) {
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
    <motion.div
      role="dialog"
      aria-label="PT code"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div className="flex items-start justify-between px-6 pt-14">
        <div>
          <div className="font-display text-[24px] text-[var(--bq-text-primary)]">Your PT code</div>
          <div className="text-[var(--bq-text-secondary)] text-sm mt-1">Show this to {bundle.coachName} when your session starts.</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close code"
          className="w-10 h-10 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center text-[var(--bq-text-primary)] active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[320px] aspect-square rounded-[1.5rem] border border-[var(--bq-neutral-dark)] p-4 flex items-center justify-center bg-white">
          {src ? <img data-testid="pt-qr" src={src} alt="PT session code" className="w-full h-full" style={{ imageRendering: "pixelated" }} /> : <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />}
        </div>
        <div className="font-display text-[18px] text-[var(--bq-text-primary)] mt-5">{bundle.name}</div>
        <div className="text-[var(--bq-text-secondary)] text-sm mt-1">
          {bundle.sessionsRemaining} of {bundle.sessionsIncluded} sessions left
        </div>
        {bundle.loggedToday && (
          <div className="mt-4 flex items-center gap-2 text-sm rounded-[0.9rem] px-4 py-2.5 bg-[var(--bq-neutral)] text-[var(--bq-text-primary)]">
            <CheckCircle2 className="w-4 h-4" /> Today's session is already logged
          </div>
        )}
      </div>
    </motion.div>
  );
}
