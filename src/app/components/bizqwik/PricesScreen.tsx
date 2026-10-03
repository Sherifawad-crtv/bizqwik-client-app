import { useCallback, useEffect, useState } from "react";
import { Clock, Copy, Check, Tag, XCircle } from "lucide-react";
import { Button, ErrorNote, Kicker, Sheet, SheetSub, SheetSuccessIcon, SheetTitle, useSheetSuccess } from "./Sheet";
import { EmptyState } from "./EmptyState";
import { NotificationBell } from "./NotificationBell";
import { api, type PriceOffer, type PricesData } from "../../../lib/api";
import { compressImage } from "../../../lib/image";
import { egp, num, shortDate } from "../../../lib/plans";

interface PricesScreenProps {
  onNotificationsClick: () => void;
  notificationCount: number;
}

const detail = (o: PriceOffer) => {
  if (o.offerType === "plan_type") return `${o.count} classes · valid ${o.months} month${o.months === 1 ? "" : "s"}`;
  return `${o.count} sessions · ${o.expiryDays ? `valid ${o.expiryDays} days` : "no expiry"}`;
};

/** Kids / Adults first, from the first word of the name. */
const groupOf = (name: string) => (/^kids\b/i.test(name) ? "Kids" : /^adults?\b/i.test(name) ? "Adults" : "Other");

// A solo gym's prices. A member picks something, pays it in the InstaPay app,
// uploads the receipt screenshot, and the owner approves it — nothing starts
// until she does.
export function PricesScreen({ onNotificationsClick, notificationCount }: PricesScreenProps) {
  const [data, setData] = useState<PricesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState<PriceOffer | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [tab, setTab] = useState<"classes" | "pt">("classes");

  const load = useCallback(() => {
    api
      .prices()
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load the prices."));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const plans = (data?.offers ?? []).filter((o) => o.offerType === "plan_type");
  const pt = (data?.offers ?? []).filter((o) => o.offerType === "bundle_type");
  // Both kinds: a toggle picks one. Only one kind: just show it.
  const shownTab = plans.length === 0 ? "pt" : pt.length === 0 ? "classes" : tab;
  const lastRejected = !data?.pending ? data?.recent.find((r) => r.status === "rejected") : null;

  const Card = ({ o }: { o: PriceOffer }) => (
    <div className="p-4 rounded-[1.25rem] border border-[var(--bq-neutral-dark)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[var(--bq-text-primary)] font-display text-[17px]">{o.name}</div>
          <div className="text-[var(--bq-text-secondary)] text-sm mt-0.5">{detail(o)}</div>
        </div>
        <div className="flex-none text-right leading-none">
          <div className="font-display font-extrabold text-[26px] text-[var(--bq-text-primary)] tabular-nums">{num(o.price)}</div>
          <div className="text-[11px] font-semibold tracking-wide text-[var(--bq-text-secondary)] mt-1">EGP</div>
        </div>
      </div>
      <button
        disabled={!o.canRequest || !!data?.pending}
        onClick={() => setPaying(o)}
        className="mt-3 w-full h-11 rounded-[1rem] bg-[var(--bq-primary)] text-[var(--bq-on-primary)] disabled:opacity-40 active:scale-[0.98] transition-transform text-sm"
      >
        {!o.canRequest ? (o.offerType === "plan_type" ? "You have an active plan" : "You have an active package") : data?.pending ? "Waiting for approval" : "Pay with InstaPay"}
      </button>
    </div>
  );

  const groups = ["Kids", "Adults", "Other"].map((g) => ({ g, items: plans.filter((o) => groupOf(o.name) === g) })).filter((x) => x.items.length > 0);

  return (
    <div className="min-h-full bg-white pb-28">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[24px] text-[var(--bq-text-primary)]">Prices</h1>
        <NotificationBell count={notificationCount} onClick={onNotificationsClick} />
      </div>

      {!data && !error && (
        <div className="py-10 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--bq-neutral-dark)] border-t-[var(--bq-primary)] animate-spin" />
        </div>
      )}
      {error && (
        <div className="mx-6 text-sm rounded-[0.9rem] px-4 py-3" style={{ color: "#b42318", background: "#fef3f2" }}>
          {error}
        </div>
      )}

      {data && (
        <div className="px-6 flex flex-col gap-3">
          {data.pending && (
            <div data-testid="pending-payment" className="rounded-[1.25rem] p-4 bg-[var(--bq-neutral)]">
              <div className="flex items-center gap-2 font-display text-[16px] text-[var(--bq-text-primary)]">
                <Clock className="w-4 h-4" /> Waiting for approval
              </div>
              <p className="text-sm text-[var(--bq-text-secondary)] mt-1">
                {data.pending.name} · {egp(data.pending.price)}. We'll tell you as soon as your payment is confirmed.
              </p>
              <button
                disabled={cancelling}
                onClick={async () => {
                  setCancelling(true);
                  try {
                    await api.cancelPayment(data.pending!.id);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Couldn't cancel.");
                  } finally {
                    setCancelling(false);
                    load();
                  }
                }}
                className="mt-2 text-sm underline text-[var(--bq-text-secondary)]"
              >
                Cancel this payment
              </button>
            </div>
          )}
          {lastRejected && (
            <div data-testid="rejected-payment" className="rounded-[1.25rem] p-4" style={{ background: "#fef3f2", color: "#b42318" }}>
              <div className="flex items-center gap-2 font-display text-[16px]">
                <XCircle className="w-4 h-4" /> We couldn't confirm your payment
              </div>
              <p className="text-sm mt-1">
                {lastRejected.name}
                {lastRejected.note ? ` — ${lastRejected.note}` : ""}. You can try again below.
              </p>
            </div>
          )}
          {data.activePlan && (
            <p className="text-sm text-[var(--bq-text-secondary)]">
              Your plan: {data.activePlan.name}
              {data.activePlan.kind === "bundle" ? ` · ${data.activePlan.creditsRemaining} of ${data.activePlan.creditsTotal} classes left` : ""} · until {shortDate(data.activePlan.expiresAt)}
            </p>
          )}

          {data.offers.length === 0 && <EmptyState icon={<Tag />} title="No prices yet" body="Your coach hasn't added prices for your location yet." />}

          {plans.length > 0 && pt.length > 0 && (
            <div role="tablist" aria-label="Prices" className="grid grid-cols-2 p-1 rounded-full bg-[var(--bq-neutral)] mt-1">
              {(["classes", "pt"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={shownTab === t}
                  onClick={() => setTab(t)}
                  className={`h-11 rounded-full text-[15px] font-semibold transition-colors ${shownTab === t ? "bg-[var(--bq-primary)] text-[var(--bq-on-primary)] shadow-sm" : "text-[var(--bq-text-secondary)]"}`}
                >
                  {t === "classes" ? "Classes" : "Private training"}
                </button>
              ))}
            </div>
          )}

          {shownTab === "classes" &&
            groups.map(({ g, items }) => (
              <div key={g}>
                <h2 className="font-display text-[20px] text-[var(--bq-text-primary)] mt-3 mb-2">{groups.length > 1 ? `${g} classes` : "Classes"}</h2>
                <div className="flex flex-col gap-3">
                  {items.map((o) => (
                    <Card key={o.id} o={o} />
                  ))}
                </div>
              </div>
            ))}
          {shownTab === "pt" && (
            <div className="flex flex-col gap-3 mt-2">
              {pt.map((o) => (
                <Card key={o.id} o={o} />
              ))}
            </div>
          )}
        </div>
      )}

      <PaySheet offer={paying} pay={data?.pay ?? { address: null, qr: null }} onClose={() => setPaying(null)} onSent={load} />
    </div>
  );
}

function PaySheet({ offer, pay, onClose, onSent }: { offer: PriceOffer | null; pay: PricesData["pay"]; onClose: () => void; onSent: () => void }) {
  const open = offer !== null;
  // Keep the last offer while the sheet slides away.
  const [shown, setShown] = useState<PriceOffer | null>(null);
  useEffect(() => {
    if (offer) setShown(offer);
  }, [offer]);
  const o = offer ?? shown;
  const [proof, setProof] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { confirmed, iconIn, showSuccess } = useSheetSuccess(open, onClose, 1800);
  useEffect(() => {
    if (open) {
      setProof(null);
      setError(null);
      setCopied(false);
    }
  }, [open]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setProof(await compressImage(file));
    } catch {
      setError("Couldn't read that image. Try another screenshot.");
    }
  };
  const submit = async () => {
    if (!o || !proof) return;
    setBusy(true);
    setError(null);
    try {
      await api.requestPayment(o, proof);
      showSuccess();
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send your payment.");
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    if (!pay.address) return;
    try {
      await navigator.clipboard.writeText(pay.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the address is shown, so they can still copy it by hand */
    }
  };

  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} label="Pay with InstaPay">
      {confirmed ? (
        <SheetSuccessIcon label="Sent for approval" sub="We'll tell you once your payment is confirmed." iconIn={iconIn} />
      ) : (
        o && (
          <>
            <Kicker>Pay with InstaPay</Kicker>
            <SheetTitle>
              {o.name} · {egp(o.price)}
            </SheetTitle>
            <SheetSub>{detail(o)}</SheetSub>

            <ol className="text-sm text-[var(--bq-text-secondary)] list-decimal pl-5 mb-3 space-y-1">
              <li>Copy the InstaPay address{pay.qr ? " (or scan the QR)" : ""}.</li>
              <li>
                Pay <b>{egp(o.price)}</b> in the InstaPay app.
              </li>
              <li>Screenshot the green success receipt and upload it here.</li>
            </ol>

            {pay.address ? (
              <button onClick={copy} aria-label="Copy InstaPay address" className="w-full flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--bq-neutral-dark)] px-4 h-12 mb-3 active:scale-[0.99] transition-transform">
                <span data-testid="ipa" className="font-mono text-[15px] truncate text-[var(--bq-text-primary)]">{pay.address}</span>
                <span className="flex items-center gap-1 text-sm text-[var(--bq-primary-readable)] flex-none">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copied" : "Copy"}
                </span>
              </button>
            ) : (
              !pay.qr && <ErrorNote>Payment details aren't set up yet. Please ask your coach.</ErrorNote>
            )}
            {pay.qr && <img src={pay.qr} alt="InstaPay QR" className="mx-auto mb-3 w-44 h-44 object-contain rounded-xl border border-[var(--bq-neutral-dark)] bg-white" />}

            <label className="flex items-center gap-3 rounded-[1rem] border border-dashed border-[var(--bq-neutral-dark)] px-4 py-3 mb-3 cursor-pointer">
              {proof ? <img src={proof} alt="Your receipt" className="w-14 h-20 object-cover rounded-lg" /> : null}
              <span className="text-sm text-[var(--bq-text-primary)]">{proof ? "Change screenshot" : "Upload receipt screenshot"}</span>
              <input data-testid="proof-input" type="file" accept="image/*" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
            </label>

            {error && <ErrorNote>{error}</ErrorNote>}
            <Button fullWidth size="lg" disabled={!proof || busy} onClick={submit}>
              {busy ? "Sending…" : "Send for approval"}
            </Button>
            <Button variant="quiet" fullWidth style={{ marginTop: 8 }} onClick={onClose} disabled={busy}>
              Cancel
            </Button>
          </>
        )
      )}
    </Sheet>
  );
}
