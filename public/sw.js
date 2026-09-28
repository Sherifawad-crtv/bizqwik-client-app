// Minimal service worker: only receives Web Push and shows it, and routes a
// tap on the notification back into the app. No caching or offline mode
// (the app updates itself through version.json instead).

self.addEventListener("push", (event) => {
  let payload = { title: "New notification", body: "" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // keep the default payload
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      data: { url: payload.url || "/?open=notifications" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/?open=notifications";
  const url = target === "/" ? "/?open=notifications" : target;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = all.find((c) => "focus" in c);
      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await existing.navigate(url);
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
