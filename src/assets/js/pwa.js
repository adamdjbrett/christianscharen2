function enablePwa() {
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "/site.webmanifest";
  document.head.append(manifest);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
      .catch(error => console.warn("Offline support unavailable:", error));
  }
}

function schedulePwa() {
  if ("requestIdleCallback" in window) window.requestIdleCallback(enablePwa, { timeout: 2000 });
  else window.setTimeout(enablePwa, 0);
}

if (document.readyState === "complete") schedulePwa();
else window.addEventListener("load", schedulePwa, { once: true });
