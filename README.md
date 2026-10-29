# Christian Scharen | [christianscharen.com](https://christianscharen.com)
[![Deploy to xmit](https://github.com/adamdjbrett/christianscharen2/actions/workflows/xmit-deploy.yml/badge.svg)](https://github.com/adamdjbrett/christianscharen2/actions/workflows/xmit-deploy.yml)

[build awesome](https://build.awesome.me) with hosting by [🛰️ xmit](https://xmit.co)

Website for Christian Scharen, practical theologian and writer: his books, research, writing, speaking and newsletter.

Built with [Build Awesome](https://www.npmjs.com/package/@awesome.me/buildawesome) 4.0.0-alpha.10 (Eleventy v4) and Nunjucks, and deployed to [xmit](https://xmit.co) at <https://christianscharen.com>.

## Run it

Node 24 (see `.nvmrc`).

```sh
npm install
npm run dev     # http://localhost:8080, rebuilds on save
npm run build   # production build into _site/
npm test        # smoke test: templates, data, image pairs
```

Install Build Awesome only at the pinned `4.0.0-alpha.10`. Its `latest` tag is an empty placeholder.

## Where things live

| Path | What it is |
|---|---|
| `src/index.md` | Home page. All of its text lives in the front matter, one block per section, in page order. |
| `src/_data/site.yaml` | Site-wide settings: name, address, Christian's details and email, footer icons, the About buttons, Selected Books. |
| `src/_data/navigation.yaml` | Menu links. |
| `src/_data/events.yaml` | Events. `enabled: false` (line 4) leaves every event page, link and list out of the build. |
| `src/writings/` | Posts, one Markdown file each. |
| `src/_includes/` | Layouts and partials. |
| `src/assets/css/style.css` | The only stylesheet: design tokens first, then layout, then components. |
| `src/assets/images/` | Published images (see below). |
| `src/feed/`, `src/pages/` | Atom, RSS and JSON feeds; sitemap, robots, `humans.txt`, web manifest, 404. |
| `src/xmit.toml` | Response headers (caching, feed content types) for xmit. |
| `buildawesome.config.js` | Filters, shortcodes, collections and the build hooks. |
| `.pages.yml` | Pages CMS editing setup. |

## Editing content

**In a browser:** sign in at <https://app.pagescms.org> and open this repository. Saving commits to GitHub, which rebuilds and redeploys the site. Pages CMS may drop the explanatory comments from YAML files when it saves them; the same notes appear as field descriptions in the CMS.

**By hand:** edit the files above. The comments in `src/index.md` and `src/_data/site.yaml` explain each field.

- Christian's email is set once, as `author.email` in `site.yaml`. Every email link and button uses it.
- In `src/_data/site.yaml`, set `writings.enabled` to `true` to publish `/writings/` and the home page's Other Writing section, or `false` to unpublish them. Rebuild after changing the switch; navigation, tags, sitemap and feed entries follow it too.
- Offsite links open in a new tab and get a ↗ automatically.

## Images

Every image on the site is a **pair**: a `.webp` the browser loads, and a `.jpg` of the same size as a fallback. Templates show images with the `{% picture %}` shortcode. It reads the real width and height from the file, and builds a responsive `srcset` from any `-<width>` siblings it finds (for example `photo-800.webp` beside `photo.webp`). A missing `.jpg` stops the build, and `npm test` checks every pair.

To add an image, create both files, for example:

```sh
cwebp -q 80 new-photo.jpg -o src/assets/images/new-photo.webp
cp new-photo.jpg src/assets/images/new-photo.jpg
```

Then point the front matter at the `.webp`. Through Pages CMS, upload both files.

`christian-scharen-photo.jpg` is the full-resolution press headshot behind the "Hi-res photo" button. Keep that download as a `.jpg`.

## Deploying

The PWA manifest and service worker load from the footer after the window load event, when the browser is idle. Visitors can install the site in supporting browsers. The worker stores only `/offline.html`, showing it when a navigation fails without retaining outdated posts. Bump `scharen-offline-v1` in `src/sw.js` when changing the offline page. Service worker JavaScript always revalidates; registration also bypasses the HTTP cache.

Cloudflare injects its email decoder at the edge with `defer`; its loading is controlled by Cloudflare rather than this build. The head preconnects to the Cloudflare Insights origin for its injected analytics beacon.

Every push to `main` runs `.github/workflows/xmit-deploy.yml`: install, test, build, then upload `_site/` to xmit. It needs the repository secret `XMIT_KEY`.

## Metadata

Each page carries Dublin Core and Zotero tags (posts save to Zotero as blog posts), Open Graph, JSON-LD, and microformats: an `h-card` for Christian in the footer, `h-entry` and `h-event` on posts and events, and `h-feed` on lists.

## License

The code is released under the [GNU General Public License v3.0 or later](LICENSE). The content is not: Christian Scharen's writing and photographs, and the book covers, remain © Christian Scharen and their publishers, all rights reserved.
