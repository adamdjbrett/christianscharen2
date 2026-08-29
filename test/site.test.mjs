import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { minifyCss } from "../scripts/minify-css.mjs";

const [tokens, css, nav, footer, seo, favicon, criticalScript, loader, layout, critical, sharedLayout, entry, pageLayout, article, home] = await Promise.all([
  readFile("tokens.css", "utf8"),
  readFile("src/css/style.css", "utf8"),
  readFile("src/_includes/partials/nav.njk", "utf8"),
  readFile("src/_includes/partials/footer.njk", "utf8"),
  readFile("src/_includes/partials/seo.njk", "utf8"),
  readFile("src/favicon.svg", "utf8"),
  readFile("src/js/theme-critical.js", "utf8"),
  readFile("src/_includes/partials/scripts.njk", "utf8"),
  readFile("src/_includes/default.njk", "utf8"),
  readFile("src/css/critical.css", "utf8"),
  readFile("src/_includes/layout.njk", "utf8"),
  readFile("src/_includes/entry.njk", "utf8"),
  readFile("src/_includes/page.njk", "utf8"),
  readFile("src/_includes/partials/article.njk", "utf8"),
  readFile("src/_includes/home.njk", "utf8")
]);
const [navigationData, indexData, hero, about, selectedBooks] = await Promise.all([
  readFile("src/_data/navigation.yaml", "utf8"),
  readFile("src/index.md", "utf8"),
  readFile("src/_includes/partials/home/hero.njk", "utf8"),
  readFile("src/_includes/partials/home/about_contact.njk", "utf8"),
  readFile("src/_includes/partials/home/selected_books.njk", "utf8")
]);

assert.match(tokens, /html\[data-theme="dark"\]/);
assert.match(css, /overflow-x:\s*clip/);
assert.match(css, /:focus-visible/);
assert.match(nav, /data-theme-toggle/);
assert.doesNotMatch(nav, /class="site-logo"/);
assert.match(tokens, /--text-base: clamp\(/);
assert.match(footer, /site\.author\.social_links/);
assert.match(footer, /aria-label="{{ social\.name }}"/);
assert.match(css, /content:attr\(aria-label\)/);
assert.match(css, /focus::after/);
assert.match(seo, /rel="sitemap"/);
assert.match(seo, /BuildAwesome 4\.0\.0-alpha\.10/);
assert.match(seo, /rel="preload" as="image"/);
assert.match(seo, /ibm-plex-serif-400-latin\.woff2/);
assert.match(favicon, /prefers-color-scheme: dark/);
assert.match(criticalScript, /localStorage\.getItem/);
assert.match(loader, /localStorage\.setItem/);
assert.doesNotMatch(loader, /import\(/);
assert.match(layout, /criticalJs \| safe/);
assert.match(layout, /criticalCss \| safe/);
assert.match(layout, /rel="preload" href="\/css\/style\.css" as="style"/);
assert.match(sharedLayout, /include "default\.njk"/);
assert.doesNotMatch(sharedLayout, /<!DOCTYPE/);
assert.match(entry, /partials\/article\.njk/);
assert.match(entry, /partials\/pagination\.njk/);
assert.match(pageLayout, /partials\/article\.njk/);
assert.match(article, /partials\/content_image\.njk/);
assert.equal([...home.matchAll(/partials\/home\/collection_preview\.njk/g)].length, 2);
assert.ok(home.indexOf("about_contact.njk") < home.indexOf("custer.njk"));
assert.match(navigationData, /^primary:\n  - text: "About"/);
assert.doesNotMatch(hero, /hero-subtitle|hero-description/);
assert.match(indexData, /Christian Scharen is the Gordon Braatz Chair/);
assert.match(about, /Hi-res photo/);
assert.match(about, /Full CV/);
assert.match(selectedBooks, /item\.image/);
assert.doesNotMatch(css, /\.hero-portrait img\{[^}]*grayscale/);
assert.doesNotMatch(css, /#custer img,#after-laura img,#about img\{[^}]*grayscale/);
assert.match(critical, /\.hero/);
assert.equal(minifyCss("a { color: red; } /* x */"), "a{color:red}");
assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
console.log("site smoke test passed");
