import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
const files = readdirSync("src", { recursive: true }).filter((p) =>
  /\.(ts|tsx)$/.test(p),
);
for (const name of files) {
  const text = readFileSync(`src/${name}`, "utf8");
  assert(!/tel:0267/.test(text), `Use international telephone format: ${name}`);
  assert(
    !/NEXT_PUBLIC_.*(?:SERVICE_ROLE|ADMIN_PASSWORD|GATEWAY_SECRET)/.test(text),
    `Server secret in public namespace: ${name}`,
  );
}
console.log(
  `Source checks passed (${files.length} files). Type safety is checked separately.`,
);
