// Camera permission is a browser-level, per-origin grant: once accepted, the
// OS/browser never prompts again on that origin — there's no way for app
// code to make it "ask less"; the only lever we have is *when* we first
// trigger it. Doing that lazily (only when someone taps the QR-scan FAB)
// means the very first scan is interrupted by the permission dialog. This
// warms it once, proactively, right after sign-in — mirroring how the
// business app front-loads its notification-permission prompt on login —
// so by the time a member actually taps the FAB, the browser already has an
// answer and the scanner opens instantly with no dialog in the way.
let warmed = false;

export async function warmCameraPermission(): Promise<void> {
  if (warmed) return;
  warmed = true; // set eagerly — never retry-storm, even on denial/failure
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    // We only want the permission decision, not an active camera — release
    // the track immediately. The scanner acquires its own stream when opened.
    stream.getTracks().forEach((t) => t.stop());
  } catch {
    // Denied, no camera, insecure context, etc. — fine. The member sees the
    // same friendly, actionable error (with a retry) if they open the
    // scanner and it still can't get a stream.
  }
}
