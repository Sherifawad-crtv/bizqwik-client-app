import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Sheet, Kicker, SheetTitle, SheetSub, Button, SheetSuccessIcon } from "../app/components/bizqwik/Sheet";

// The member app's one way of telling people how something went, in
// Bizqwik's sheet style: a success shows the check and closes itself; a
// problem stays until it's dismissed and can offer a way forward.
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
  kicker?: string;
  action?: Action;
  dismissLabel?: string;
}
type Opts = Omit<Message, "id" | "tone" | "title" | "body">;
interface Feedback {
  success: (title: string, body?: ReactNode, opts?: Opts) => void;
  error: (title: string, body?: ReactNode, opts?: Opts) => void;
  info: (title: string, body?: ReactNode, opts?: Opts) => void;
}

const Ctx = createContext<Feedback | null>(null);
const HOLD_MS = 1600;

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<Message | null>(null);
  const [open, setOpen] = useState(false);
  const seq = useRef(0);
  const show = useCallback((tone: Tone, title: string, body?: ReactNode, opts?: Opts) => {
    setMsg({ ...opts, tone, title, body, id: ++seq.current });
    setOpen(true);
  }, []);
  const api = useMemo<Feedback>(
    () => ({
      success: (t, b, o) => show("success", t, b, o),
      error: (t, b, o) => show("error", t, b, o),
      info: (t, b, o) => show("info", t, b, o),
    }),
    [show],
  );
  const close = useCallback(() => setOpen(false), []);

  // A success closes itself once the check has been seen.
  const [iconIn, setIconIn] = useState(false);
  useEffect(() => {
    setIconIn(false);
    if (!msg || !open || msg.tone !== "success") return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setIconIn(true)));
    const t = window.setTimeout(close, HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [msg, open, close]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {msg && (
        <Sheet open={open} onClose={close} label={msg.title}>
          <div data-testid="feedback" data-tone={msg.tone}>
            {msg.tone === "success" ? (
              <SheetSuccessIcon label={msg.title} sub={msg.body} iconIn={iconIn} />
            ) : (
              <>
                <Kicker>{msg.kicker ?? (msg.tone === "error" ? "Couldn't finish" : "Heads up")}</Kicker>
                <SheetTitle>{msg.title}</SheetTitle>
                {msg.body && <SheetSub>{msg.body}</SheetSub>}
                {msg.action && (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => {
                      close();
                      msg.action?.onClick?.();
                    }}
                  >
                    {msg.action.label}
                  </Button>
                )}
                <Button variant={msg.action ? "quiet" : "primary"} fullWidth size={msg.action ? "md" : "lg"} style={msg.action ? { marginTop: 8 } : undefined} onClick={close}>
                  {msg.dismissLabel ?? "OK"}
                </Button>
              </>
            )}
          </div>
        </Sheet>
      )}
    </Ctx.Provider>
  );
}

export function useFeedback(): Feedback {
  const f = useContext(Ctx);
  if (!f) throw new Error("useFeedback needs a FeedbackProvider");
  return f;
}
