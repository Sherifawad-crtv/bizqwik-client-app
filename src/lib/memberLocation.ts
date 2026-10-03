// The location a visitor picked before signing in, remembered on this phone
// per gym, so it can be saved to their account right after they sign in.
const key = (slug: string) => `bq.location.${slug}`;

export function readPickedLocation(slug: string): string | null {
  try {
    return localStorage.getItem(key(slug));
  } catch {
    return null;
  }
}

export function savePickedLocation(slug: string, id: string): void {
  try {
    localStorage.setItem(key(slug), id);
  } catch {
    // private mode: it's still saved to the account after sign-in
  }
}
