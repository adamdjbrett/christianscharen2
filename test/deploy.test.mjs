import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { load } from "js-yaml";

const workflow = load(await readFile(".github/workflows/xmit-deploy.yml", "utf8"));
assert.deepEqual(workflow.on.push.branches, ["main"]);
assert.equal(workflow.concurrency["cancel-in-progress"], false);
const steps = workflow.jobs.deploy.steps;
const purge = steps.find(step => step.name === "Purge Cloudflare cache");
assert.ok(steps.indexOf(purge) > steps.findIndex(step => step.name === "Deploy to Xmit team 626"));
assert.equal(purge.shell, "bash");

// Execute the actual purge step with a fake HTTP response, without credentials or network.
for (const [response, curlStatus, token, expected] of [
  ['{"success":true}', 0, "test", 0],
  ['{"success":false,"errors":[]}', 0, "test", 1],
  ['{}', 0, "test", 1],
  ['not JSON', 0, "test", 1],
  ['{"success":true}', 22, "test", 1],
  ['{"success":true}', 0, "", 1]
]) {
  const result = spawnSync("bash", ["-e", "-o", "pipefail", "-c", `
    curl() { printf '%s' "$TEST_RESPONSE"; return "$TEST_CURL_STATUS"; }
    ${purge.run}
  `], { encoding: "utf8", env: { ...process.env, CF_API_TOKEN: token, CF_ZONE_ID: "test",
    TEST_RESPONSE: response, TEST_CURL_STATUS: String(curlStatus) } });
  assert.equal(result.status === 0, expected === 0, result.stderr || result.stdout);
  assert.equal(result.stdout.includes("Cloudflare cache purged"), expected === 0);
}
console.log("deployment trigger and Cloudflare purge checks passed");
