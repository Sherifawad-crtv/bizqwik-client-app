import { api, type HomeData } from "./api";

// Home's data is requested the moment we know there is a login, at the same
// time as "who is this member" — so the loading screen waits for one round
// trip, not two in a row. Nothing is kept afterwards: the request is handed
// to the app once, and every later refresh asks the server again.
let pending: { at: number; promise: Promise<HomeData> } | null = null;

export function startHome(): void {
  if (pending && Date.now() - pending.at < 30_000) return;
  const promise = api.home();
  promise.catch(() => {}); // the app that takes it handles the failure
  pending = { at: Date.now(), promise };
}

export function takeHome(): Promise<HomeData> {
  const p = pending && Date.now() - pending.at < 30_000 ? pending.promise : api.home();
  pending = null;
  return p;
}

export function dropHome(): void {
  pending = null;
}
