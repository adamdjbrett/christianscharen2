import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { imageSize, minifyCss } from "../buildawesome.config.js";

const [css, nav, footer, seo, favicon, criticalScript, loader, layout, sharedLayout, entry, pageLayout, article, home] = await Promise.all([
  readFile("src/assets/css/style.css", "utf8"),
  readFile("src/_includes/partials/nav.njk", "utf8"),
  readFile("src/_includes/partials/footer.njk", "utf8"),
  readFile("src/_includes/partials/seo.njk", "utf8"),
  readFile("src/assets/favicons/favicon.svg", "utf8"),
  readFile("src/assets/js/theme-critical.js", "utf8"),
  readFile("src/_includes/partials/scripts.njk", "utf8"),
  readFile("src/_includes/default.njk", "utf8"),
  readFile("src/_includes/layout.njk", "utf8"),
  readFile("src/_includes/entry.njk", "utf8"),
  readFile("src/_includes/page.njk", "utf8"),
  readFile("src/_includes/partials/article.njk", "utf8"),
  readFile("src/_includes/home.njk", "utf8")
]);
const [navigationData, siteData, indexData, hero, about, selectedBooks] = await Promise.all([
  readFile("src/_data/navigation.yaml", "utf8"),
  readFile("src/_data/site.yaml", "utf8"),
  readFile("src/index.md", "utf8"),
  readFile("src/_includes/partials/home/hero.njk", "utf8"),
  readFile("src/_includes/partials/home/about_contact.njk", "utf8"),
  readFile("src/_includes/partials/home/selected_books.njk", "utf8")
]);

assert.match(css, /html\[data-theme="dark"\]/);
assert.match(css, /overflow-x:\s*clip/);
assert.match(css, /:focus-visible/);
assert.match(nav, /data-theme-toggle/);
assert.doesNotMatch(nav, /class="site-logo"/);
assert.match(css, /--text-base: clamp\(/);
assert.match(footer, /site\.author\.social_links/);
assert.match(footer, /aria-label="{{ social\.name }}"/);
assert.match(css, /content:attr\(aria-label\)/);
assert.match(css, /focus::after/);
assert.match(seo, /rel="sitemap"/);
assert.match(seo, /BuildAwesome {{ generatorVersion }}/);
assert.match(seo, /rel="preload" as="image"/);
assert.match(seo, /ibm-plex-serif-400-latin\.woff2/);
assert.match(favicon, /stroke: #666666/);
assert.match(favicon, /<circle[^>]+fill="#ffffff"/);
assert.doesNotMatch(favicon, /<rect/);
const grayChannel = ((0x66 / 255 + 0.055) / 1.055) ** 2.4;
assert.ok(1.05 / (grayChannel + 0.05) >= 4.5, "favicon gray must contrast with its white backing");
assert.match(criticalScript, /localStorage\.getItem/);
assert.match(loader, /localStorage\.setItem/);
assert.doesNotMatch(loader, /import\(/);
assert.match(layout, /criticalJs \| safe/);
assert.match(layout, /<style>\{% styleCss %\}<\/style>/);
assert.doesNotMatch(layout, /onload="this\.onload=null/);
assert.match(sharedLayout, /include "default\.njk"/);
assert.doesNotMatch(sharedLayout, /<!DOCTYPE/);
assert.match(entry, /partials\/article\.njk/);
assert.match(entry, /partials\/pagination\.njk/);
assert.match(pageLayout, /partials\/article\.njk/);
assert.match(article, /partials\/linked_picture\.njk/);
assert.equal([...home.matchAll(/partials\/home\/collection_preview\.njk/g)].length, 2);
assert.ok(home.indexOf("about_contact.njk") < home.indexOf("custer.njk"));
assert.match(siteData, /^url: "https:\/\/[^"\/]+"/m); // absolute, no trailing slash
assert.match(navigationData, /^primary:\n  - text: "About"/);
assert.doesNotMatch(hero, /hero-subtitle|hero-description/);
assert.match(indexData, /Christian Scharen is the Gordon Braatz Chair/);
assert.match(siteData, /text: Hi-res photo/);
assert.match(siteData, /text: Full CV/);
assert.match(selectedBooks, /item\.image/);
assert.doesNotMatch(css, /\.hero-portrait img\{[^}]*grayscale/);
assert.doesNotMatch(css, /#custer img,#after-laura img,#about img\{[^}]*grayscale/);
assert.equal(minifyCss("a { color: red; } /* x */"), "a{color:red}");
assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
assert.deepEqual(imageSize("/assets/images/bookcover.webp"), { width: 1200, height: 1795 });
assert.deepEqual(imageSize("/assets/images/dad-and-chris.jpg"), { width: 1206, height: 1198 });
assert.deepEqual(imageSize("/assets/favicons/icon-192.png"), { width: 192, height: 192 });
// every WebP needs its same-size JPEG fallback; picture() also refuses to render without one
const images = await readdir("src/assets/images");
for (const webp of images.filter(f => f.endsWith(".webp"))) {
  const jpg = webp.replace(/\.webp$/, ".jpg");
  assert.ok(images.includes(jpg), `${jpg} is missing`);
  assert.deepEqual(imageSize(`/assets/images/${webp}`), imageSize(`/assets/images/${jpg}`), `${webp} and ${jpg} differ in size`);
}
console.log("site smoke test passed");
await import("./writings.test.mjs");
await import("./pwa.test.mjs");
await import("./theme.test.mjs");
await import("./deploy.test.mjs");
