import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, symlink, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import * as yaml from "js-yaml";

const fixture = await mkdtemp(join(tmpdir(), "scharen-writings-"));
try {
  await cp("src", join(fixture, "src"), { recursive: true });
  await cp("buildawesome.config.js", join(fixture, "buildawesome.config.js"));
  await writeFile(join(fixture, "package.json"), '{"type":"module"}');
  await symlink(resolve("node_modules"), join(fixture, "node_modules"), "dir");
  const sitePath = join(fixture, "src/_data/site.yaml");
  const site = yaml.load(await readFile(sitePath, "utf8"));
  for (const enabled of [true, false]) {
    site.writings.enabled = enabled;
    await writeFile(sitePath, yaml.dump(site));
    execFileSync(process.execPath, [resolve("node_modules/@awesome.me/buildawesome/cmd.js")], { cwd: fixture, stdio: "pipe" });
    const output = path => readFile(join(fixture, "_site", path), "utf8");
    const home = await output("index.html");
    assert.equal(home.includes('id="writing"'), enabled);
    assert.equal(home.includes('href="#writing"'), enabled);
    assert.equal(home.includes("Other Writing"), enabled);
    const feed = JSON.parse(await output("feed/feed.json"));
    assert.equal(feed.items.length > 0, enabled);
    for (const path of ["sitemap.xml", "feed/feed.xml", "feed/feed.rss"]) {
      assert.equal((await output(path)).includes("/writings/"), enabled, path);
    }
    if (enabled) {
      await access(join(fixture, "_site/writings/index.html"));
      await access(join(fixture, "_site/tags/writing/index.html"));
    } else {
      for (const folder of ["writings", "tags/writing"]) {
        await assert.rejects(access(join(fixture, "_site", folder)), { code: "ENOENT" });
      }
    }
  }
} finally {
  await rm(fixture, { recursive: true, force: true });
}
console.log("writings publishing toggle passed");
