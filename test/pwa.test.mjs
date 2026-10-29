import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const handlers = {};
const deleted = [];
let cached;
let offline = false;
const fallback = new Response("Offline");
const context = vm.createContext({
  URL,
  self: { location: { origin: "https://christianscharen.com" }, addEventListener: (name, fn) => { handlers[name] = fn; } },
  caches: {
    open: async () => ({ add: async path => { cached = path; } }),
    keys: async () => ["scharen-offline-v0", "scharen-offline-v1", "other-app"],
    delete: async key => { deleted.push(key); },
    match: async path => { assert.equal(path, cached); return fallback; }
  },
  fetch: async () => { if (offline) throw new TypeError("Offline"); return new Response("Current page", { status: 404 }); }
});
vm.runInContext(await readFile("src/sw.js", "utf8"), context);
let pending;
handlers.install({ waitUntil: promise => { pending = promise; } });
await pending;
assert.equal(cached, "/offline.html");
handlers.activate({ waitUntil: promise => { pending = promise; } });
await pending;
assert.deepEqual(deleted, ["scharen-offline-v0"]);
const request = { method: "GET", mode: "navigate", url: "https://christianscharen.com/about/" };
handlers.fetch({ request, respondWith: promise => { pending = promise; } });
assert.equal((await pending).status, 404, "HTTP errors must not be replaced by offline content");
offline = true;
handlers.fetch({ request, respondWith: promise => { pending = promise; } });
assert.equal(await pending, fallback);
for (const change of [{ method: "POST" }, { mode: "cors" }, { url: "https://other.example/" }]) {
  handlers.fetch({ request: { ...request, ...change }, respondWith: () => assert.fail("Unexpected interception") });
}

let load, idle, manifest, registered;
vm.runInNewContext(await readFile("src/assets/js/pwa.js", "utf8"), {
  document: { readyState: "loading", createElement: () => ({}), head: { append: link => { manifest = link; } } },
  window: {
    addEventListener: (name, fn) => { assert.equal(name, "load"); load = fn; },
    requestIdleCallback: fn => { idle = fn; }
  },
  navigator: { serviceWorker: { register: async url => { registered = url; } } },
  console
});
assert.equal(manifest, undefined);
load();
assert.equal(manifest, undefined, "Manifest should wait for idle after load");
idle();
assert.equal(manifest.rel, "manifest");
assert.equal(manifest.href, "/site.webmanifest");
assert.equal(registered, "/sw.js");
console.log("PWA scheduling and offline fallback passed");
