import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, AlertTriangle, Info } from "lucide-react";

// The member app's one way of telling people how something went: a centred
// modal in the gym's colour (never a toast). A success closes itself after a
// moment; a problem stays until it's dismissed, and can offer a way forward.
type Tone = "success" | "error" | "info";
interface Action {
  label: string;
  onClick?: () => void;
}
interface Message {
  id: number;
  tone: Tone;
  title: string;
  body?: ReactNode;
  action?: Action;
  dismissLabel?: string;
  // Accessible name of the dialog (defaults to the title).
  label?: string;
}
type Input = Omit<Message, "id" | "tone">;

interface Feedback {
  success: (title: string, body?: ReactNode, opts?: Omit<Input, "title" | "body">) => void;
  error: (title: string, body?: ReactNode, opts?: Omit<Input, "title" | "body">) => void;
  info: (title: string, body?: ReactNode, opts?: Omit<Input, "title" | "body">) => void;
}

const Ctx = createContext<Feedback | null>(null);
const AUTO_CLOSE_MS = 2400;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<Message | null>(null);
  const seq = useRef(0);
  const show = useCallback((tone: Tone, m: Input) => setMsg({ ...m, tone, id: ++seq.current }), []);
  const api = useMemo<Feedback>(
    () => ({
      success: (title, body, opts) => show("success", { title, body, ...opts }),
      error: (title, body, opts) => show("error", { title, body, ...opts }),
      info: (title, body, opts) => show("info", { title, body, ...opts }),
    }),
    [show],
  );
  const close = useCallback(() => setMsg(null), []);
  return (
    <Ctx.Provider value={api}>
      {children}
      <AnimatePresence>{msg && <FeedbackModal key={msg.id} msg={msg} onClose={close} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

export function useFeedback(): Feedback {
  const f = useContext(Ctx);
  if (!f) throw new Error("useFeedback needs a FeedbackProvider");
  return f;
}

const TONE_ICON = { success: Check, error: AlertTriangle, info: Info } as const;

function FeedbackModal({ msg, onClose }: { msg: Message; onClose: () => void }) {
  const auto = msg.tone === "success" && !msg.action;
  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(onClose, AUTO_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [auto, onClose]);

  const Glyph = TONE_ICON[msg.tone];
  const badge =
    msg.tone === "error"
      ? "bg-[#fef3f2] text-[#d92d20]"
      : "bg-[var(--bq-primary)] text-[var(--bq-on-primary)] shadow-[0_10px_24px_color-mix(in_srgb,var(--bq-primary)_35%,transparent)]";

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,.45)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={msg.label ?? msg.title}
        data-testid="feedback"
        data-tone={msg.tone}
        className="relative w-full max-w-[340px] overflow-hidden rounded-[1.75rem] bg-white px-6 pt-7 pb-6 text-center shadow-[0_24px_60px_rgba(0,0,0,.25)]"
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${badge}`}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.05 }}
        >
          <Glyph className="h-8 w-8" strokeWidth={2.4} />
        </motion.div>
        <div className="font-display text-[21px] leading-tight text-[var(--bq-text-primary)]">{msg.title}</div>
        {msg.body && <div className="mt-2 text-[15px] leading-relaxed text-[var(--bq-text-secondary)]">{msg.body}</div>}

        {auto ? (
          // A thin bar shows the modal is about to close on its own.
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-[var(--bq-neutral)]">
            <motion.div
              className="h-full rounded-full bg-[var(--bq-primary)]"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: AUTO_CLOSE_MS / 1000, ease: "linear" }}
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {msg.action && (
              <button
                onClick={() => {
                  onClose();
                  msg.action?.onClick?.();
                }}
                className="h-12 w-full rounded-[1.1rem] bg-[var(--bq-primary)] font-semibold text-[var(--bq-on-primary)] transition-transform active:scale-[0.98]"
              >
                {msg.action.label}
              </button>
            )}
            <button
              onClick={onClose}
              className={`h-12 w-full rounded-[1.1rem] font-semibold transition-transform active:scale-[0.98] ${
                msg.action ? "bg-[var(--bq-neutral)] text-[var(--bq-text-primary)]" : "bg-[var(--bq-primary)] text-[var(--bq-on-primary)]"
              }`}
            >
              {msg.dismissLabel ?? (msg.tone === "error" ? "OK" : "Done")}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
