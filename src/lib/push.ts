import { api } from "./api";

// Web push for members — the same approach as the staff app: a minimal
// service worker (/sw.js), a stable per-browser device id, and the gym's
// server-side subscription list.

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

// iOS only offers push to an app added to the Home Screen.
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

// Survives iOS silently re-issuing the subscription, so one device keeps one
// server-side row.
function deviceId(): string {
  const KEY = "bq-member:pushDeviceId";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const raw = atob((base64Url + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!existing) await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  return reg ? reg.pushManager.getSubscription() : null;
}

/** "on" (this device gets pushes), "off" (can be turned on), "blocked"
 * (the browser said no), "install" (iPhone: add to Home Screen first) or
 * "unsupported". */
export type PushState = "on" | "off" | "blocked" | "install" | "unsupported";
export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return isIOS() && !isStandalone() ? "install" : "unsupported";
  if (Notification.permission === "denied") return "blocked";
  return (await currentPushSubscription()) ? "on" : "off";
}

/** Asks for permission (from a tap), subscribes this device and registers it
 * with the gym. Throws a readable message when it can't. */
export async function enablePush(): Promise<void> {
  if (!pushSupported()) throw new Error("Notifications aren't supported on this device.");
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (permission !== "granted") throw new Error("Notifications are blocked. Allow them for this app in your phone's settings.");
  const reg = await registration();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const { publicKey } = await api.pushVapidPublicKey();
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
  }
  await api.pushSubscribe(sub.toJSON(), deviceId());
}

export async function disablePush(): Promise<void> {
  const sub = await currentPushSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await api.pushUnsubscribe(endpoint, deviceId()).catch(() => {});
}

/** After sign-in: re-registers an existing subscription under this member
 * (a device can change accounts), or turns push on straight away when the
 * permission was already granted. Never prompts and never throws. */
export function syncPushOnSignIn(): void {
  if (!pushSupported()) return;
  currentPushSubscription()
    .then(async (sub): Promise<void> => {
      if (sub) await api.pushSubscribe(sub.toJSON(), deviceId());
      else if (Notification.permission === "granted") await enablePush();
    })
    .catch(() => {});
}
