import * as yaml from 'js-yaml';
import MarkdownIt from 'markdown-it';
import { readFileSync } from 'node:fs';
import { minifyCss } from './scripts/minify-css.mjs';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
const collectionTags = new Set(["writings", "events", "pages", "event_lists", "posts", "all"]);
const iconPaths = {
  "arrow-down": "M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z",
  "arrow-left": "M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z",
  "arrow-right": "M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z",
  "arrow-square-out": "M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z",
  "map-pin": "M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z",
  clock: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"
};

export default function(eleventyConfig) {
  eleventyConfig.addGlobalData("criticalCss", minifyCss(readFileSync("tokens.css", "utf8") + readFileSync("src/css/critical.css", "utf8")));
  eleventyConfig.addGlobalData("criticalJs", readFileSync("src/js/theme-critical.js", "utf8"));
  eleventyConfig.setServerOptions({ liveReload: false });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addShortcode("icon", function(name) {
    const path = iconPaths[name];
    if (!path) throw new Error(`Unknown icon: ${name}`);
    return `<svg class="ph-icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
  });
  eleventyConfig.addFilter("formatDate", function(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  });
  eleventyConfig.addDataExtension("yaml", (contents) => {
    return yaml.load(contents);
  });
  eleventyConfig.addDataExtension("yml", (contents) => {
    return yaml.load(contents);
  });
  eleventyConfig.addFilter("md", function(content) {
    if (!content) return "";
    return md.render(content);
  });
  eleventyConfig.addFilter("limit", function(array, limit) {
    if (!Array.isArray(array)) return [];
    return array.slice(0, limit);
  });
  eleventyConfig.addFilter("publicTags", function(tags) {
    return Array.isArray(tags) ? tags.filter(tag => !collectionTags.has(tag)) : [];
  });
  eleventyConfig.addFilter("postDate", function(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  });
  eleventyConfig.addFilter("slug", function(string) {
  if (!string) return "";
  return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  });
  eleventyConfig.addCollection("writings", function(collection) {
    return collection.getFilteredByGlob("src/writings/*.md").reverse();
  });
  eleventyConfig.addCollection("events", function(collection) {
    return collection.getFilteredByGlob("src/events/*.md").reverse();
  });

eleventyConfig.addCollection("tagList", function(collection) {
  let tagSet = new Set();
  
  collection.getAll().forEach(item => {
    if (item.data.tags && Array.isArray(item.data.tags)) {
      item.data.tags.forEach(tag => {
        if (!collectionTags.has(tag)) {
          tagSet.add(tag);
        }
      });
    }
  });
  
  return Array.from(tagSet).sort();
});
  
  eleventyConfig.addFilter("filterByTags", function(array, tags) {
  if (!Array.isArray(array)) return [];
  if (!tags || !Array.isArray(tags)) return array;
  return array.filter(item => {
    if (!item.data.tags) return false;
    return tags.some(tag => item.data.tags.includes(tag));
    });
  });
  eleventyConfig.addPassthroughCopy({ "src/css/style.css": "css/style.css" });
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/icons");
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "src/icon-192.png": "icon-192.png" });
  eleventyConfig.addPassthroughCopy({ "src/icon-512.png": "icon-512.png" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    passthroughFileCopy: true
  };
}
