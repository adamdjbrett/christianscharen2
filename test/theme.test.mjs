import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

let writes = 0, text = "Dark mode", pressed = "false", click, change;
const root = { dataset: {} };
const button = {
  get textContent() { return text; },
  set textContent(value) { writes++; text = value; },
  getAttribute: () => pressed,
  setAttribute: (_, value) => { writes++; pressed = value; },
  addEventListener: (_, handler) => { click = handler; }
};
const media = { matches: false, addEventListener: (_, handler) => { change = handler; } };
const script = (await readFile("src/_includes/partials/scripts.njk", "utf8")).replace(/<\/?script>/g, "");
vm.runInNewContext(script, {
  document: { documentElement: root, querySelectorAll: () => [button] },
  matchMedia: () => media,
  localStorage: { setItem() {} }
});
assert.equal(writes, 0, "Initial matching theme must not rewrite the DOM");
change();
assert.equal(writes, 0, "Unchanged system theme must not rewrite the DOM");
media.matches = true;
change();
assert.equal(text, "Light mode");
assert.equal(pressed, "true");
assert.equal(writes, 2);
click();
assert.equal(root.dataset.theme, "light");
assert.equal(text, "Dark mode");
assert.equal(pressed, "false");
console.log("Theme updates avoid redundant DOM writes");
