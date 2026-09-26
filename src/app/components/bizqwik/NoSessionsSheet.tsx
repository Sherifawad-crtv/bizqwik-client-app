import { Ticket, X } from "lucide-react";

// Shown when a check-in is refused because the member's class bundle has no
// sessions left: says so plainly and points to renewing (at the desk, or from
// My Plans with wallet credit).
export function NoSessionsSheet({ message, planName, onClose, onSeePlans }: { message: string; planName: string | null; onClose: () => void; onSeePlans: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose} role="dialog" aria-label="No sessions left">
      <div className="w-full max-w-[430px] bg-white rounded-t-[1.75rem] p-6 pb-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bq-primary)]/10 text-[var(--bq-primary-readable)] flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-[var(--bq-neutral)] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="font-display text-[22px] text-[var(--bq-text-primary)] mb-1">No sessions left</div>
        {planName && <div className="text-[var(--bq-text-secondary)] text-sm mb-3">{planName} · 0 sessions remaining</div>}
        <p className="text-[var(--bq-text-primary)] text-[15px] leading-relaxed mb-6">{message}</p>
        <button onClick={onSeePlans} className="w-full h-14 rounded-[1.25rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] active:scale-[0.98] transition-transform">
          See plans
        </button>
        <button onClick={onClose} className="w-full h-12 mt-2 rounded-[1.25rem] text-[var(--bq-text-secondary)]">
          Got it
        </button>
      </div>
    </div>
  );
}
