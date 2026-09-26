import type { ReactNode } from "react";

// The one empty state used across the member app: what's missing, what to do
// next, and (when the member can act on it) a button that does it.
export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: ReactNode; action?: { label: string; onClick: () => void } }) {
  return (
    <div data-testid="empty-state" className="py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--bq-neutral)] text-[var(--bq-primary)] flex items-center justify-center mb-3 [&_svg]:w-6 [&_svg]:h-6">{icon}</div>
      <div className="font-display text-[17px] text-[var(--bq-text-primary)]">{title}</div>
      {body && <p className="text-sm text-[var(--bq-text-secondary)] mt-1 max-w-[300px]">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 h-11 px-5 rounded-[0.9rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] font-semibold active:scale-[0.98] transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
