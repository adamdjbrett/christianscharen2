import { readFile, writeFile } from "node:fs/promises";
import { minifyCss } from "./minify-css.mjs";

const path = process.argv[2] || "_site/css/style.css";
await writeFile(path, minifyCss(await readFile(path, "utf8")));
