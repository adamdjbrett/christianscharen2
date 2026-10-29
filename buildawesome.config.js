import * as yaml from 'js-yaml';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

// Width/height of a PNG, JPEG or WebP under src/, read from the file header so templates never hard-code sizes.
export function imageSize(src) {
  const b = readFileSync(`src${src}`);
  if (b.toString("ascii", 1, 4) === "PNG") return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
    if (chunk === "VP8L") { const bits = b.readUInt32LE(21); return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }; }
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  for (let i = 2; i < b.length;) { // JPEG: walk segments to the first start-of-frame marker
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`Unknown image format: ${src}`);
}

const escapeAttr = value => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// "-800", "-1200"… width variants of an image plus the image itself, as a srcset; null when there is only one size.
export function srcset(src, ext = "webp") {
  const base = src.replace(/\.(webp|jpe?g|png)$/, ""), dir = dirname(base), name = basename(base);
  if (!existsSync(`src${base}.${ext}`)) throw new Error(`${base}.${ext} is missing: every image needs a WebP and a same-size JPEG`);
  const variants = readdirSync(`src${dir}`)
    .map(file => file.startsWith(`${name}-`) && file.endsWith(`.${ext}`) && file.slice(name.length + 1, -ext.length - 1))
    .filter(width => /^\d+$/.test(width)).sort((a, b) => a - b).map(width => `${base}-${width}.${ext} ${width}w`);
  return variants.length ? [...variants, `${base}.${ext} ${imageSize(`${base}.${ext}`).width}w`].join(", ") : null;
}

// Display width of the home page's feature images (hero, About, Custer, After Laura): about 5/12 of the
// content column, which tops out near 30rem; below 60rem they run full width. Also used by the hero preload.
export const featureSizes = "(min-width: 60rem) min(36vw, 30rem), 100vw";

// One <picture> for every site image: WebP source, same-size JPEG fallback, real width/height, srcset when variants exist.
export function picture(src, alt, { class: className, sizes = featureSizes, loading = "lazy", fetchpriority } = {}) {
  const base = src.replace(/\.(webp|jpe?g|png)$/, "");
  const set = ext => { const list = srcset(base, ext); return list ? ` srcset="${list}"${sizes ? ` sizes="${sizes}"` : ""}` : ""; };
  const { width, height } = imageSize(`${base}.webp`);
  return `<picture><source type="image/webp"${set("webp") || ` srcset="${base}.webp"`}>`
    + `<img src="${base}.jpg"${set("jpg")} alt="${escapeAttr(alt)}" width="${width}" height="${height}"`
    + `${className ? ` class="${className}"` : ""} loading="${loading}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ""}></picture>`;
}

export const minifyCss = css => css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

// collection names, not reader-facing tags ("events" also hides that tag on the speaking posts)
const collectionTags = new Set(["writings", "events", "pages", "all"]);
const iconPaths = {
  "arrow-left": "M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z",
  "arrow-right": "M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z",
  "map-pin": "M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z",
  envelope: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z",
  clock: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
};

export default function(eleventyConfig) {
  eleventyConfig.setQuietMode(true);
  // events.yaml `enabled: false` unpublishes the /events/ pages (home, nav and sitemap check the flag too)
  if (!yaml.load(readFileSync("src/_data/events.yaml", "utf8")).enabled) eleventyConfig.ignores.add("src/events/");
  if (!yaml.load(readFileSync("src/_data/site.yaml", "utf8")).writings.enabled) {
    eleventyConfig.ignores.add("src/writings/");
    // Remove previously published pages and tag lists before rebuilding with writings disabled.
    eleventyConfig.on("eleventy.before", ({ dir }) => {
      for (const folder of ["writings", "tags"]) rmSync(join(dir.output, folder), { recursive: true, force: true });
    });
  }
  // ponytail: reuse Eleventy's own markdown-it instead of installing a second copy
  let md;
  eleventyConfig.amendLibrary("md", lib => { md = lib.set({ linkify: true, typographer: true }); });
  // every offsite link opens in a new tab (_blank implies noopener); the ↗ marker comes from style.css
  eleventyConfig.addTransform("offsite-links", function(html) {
    if (!this.page.outputPath?.endsWith(".html")) return html;
    return html.replace(/<a (?![^>]*\btarget=)(?=[^>]*\bhref="https?:\/\/)/g, '<a target="_blank" ');
  });
  eleventyConfig.addGlobalData("generatorVersion", JSON.parse(readFileSync("node_modules/@awesome.me/buildawesome/package.json", "utf8")).version);
  eleventyConfig.addGlobalData("criticalJs", readFileSync("src/assets/js/theme-critical.js", "utf8"));
  eleventyConfig.setServerOptions({ liveReload: false });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
  eleventyConfig.addShortcode("icon", function(name) {
    const path = iconPaths[name];
    if (!path) throw new Error(`Unknown icon: ${name}`);
    return `<svg class="ph-icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
  });
  eleventyConfig.addFilter("formatDate", function(date) {
    if (!date) return "";
    const d = date === "now" ? new Date() : new Date(date);
    return d.toISOString().split('T')[0];
  });
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
  eleventyConfig.addFilter("md", function(content) {
    if (!content) return "";
    return md.render(content);
  });
  // feeds: readers resolve root-relative links against their own origin
  eleventyConfig.addFilter("absoluteUrls", (html, base) => html.replace(/(href|src)="\//g, `$1="${base}/`));
  eleventyConfig.addShortcode("picture", picture);
  eleventyConfig.addFilter("srcset", srcset);
  eleventyConfig.addGlobalData("featureSizes", featureSizes);
  eleventyConfig.addFilter("jpg", src => src.replace(/\.webp$/, ".jpg"));
  eleventyConfig.addFilter("publicTags", function(tags) {
    return Array.isArray(tags) ? tags.filter(tag => !collectionTags.has(tag)) : [];
  });
  eleventyConfig.addFilter("postDate", function(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  });
  eleventyConfig.addCollection("writings", function(collection) {
    return collection.getFilteredByGlob("src/writings/*.md").reverse();
  });
  eleventyConfig.addCollection("tagList", collection =>
    [...new Set(collection.getAll().flatMap(item => item.data.tags ?? []))].filter(tag => !collectionTags.has(tag)).sort());
  eleventyConfig.addFilter("filterByTags", (items, tags) => items.filter(item => tags.some(tag => item.data.tags?.includes(tag))));
  // the one stylesheet is inlined into every page: no render-blocking request (it is ~4.5 KB gzipped).
  // A shortcode, not global data, so `npm run dev` picks up CSS edits without a restart.
  eleventyConfig.addWatchTarget("./src/assets/css/style.css");
  eleventyConfig.addShortcode("styleCss", () => minifyCss(readFileSync("src/assets/css/style.css", "utf8")));
  eleventyConfig.addPassthroughCopy("src/assets/{images,fonts,icons}");
  eleventyConfig.addPassthroughCopy({ "src/assets/favicons": "/" });
  eleventyConfig.addPassthroughCopy({ "src/xmit.toml": "xmit.toml" });
  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk", "md"],
    // no markdown file uses template tags, so skip the Liquid pass
    markdownTemplateEngine: false
  };
}
