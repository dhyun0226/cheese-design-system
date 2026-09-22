import { readFileSync, writeFileSync } from "node:fs";
const t = JSON.parse(
  readFileSync(new URL("../packages/tokens/src/tokens.json", import.meta.url)),
);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const aliases = { cheeseGold: "gold", cheeseWeak: "gold-weak" };
const lines = Object.entries(t.color).map(
  ([k, v]) => `  --cheese-color-${aliases[k] || kebab(k)}: ${v};`,
);
lines.push(`  --cheese-font-family: ${t.font.family};`);
for (const [key, value] of Object.entries(t.semantic)) {
  const resolved = value.replace(
    /\{color\.([^}]+)\}/g,
    (_, name) => `var(--cheese-color-${aliases[name] || kebab(name)})`,
  );
  lines.push(`  --cheese-${kebab(key)}: ${resolved};`);
}
for (const [group, values] of Object.entries({
  space: t.space,
  radius: t.radius,
  "font-size": t.font.size,
  "line-height": t.font.lineHeight,
  "font-weight": t.font.weight,
})) {
  for (const [k, v] of Object.entries(values))
    lines.push(
      `  --cheese-${group}-${k}: ${v}${["line-height", "font-weight"].includes(group) ? "" : "px"};`,
    );
}
const css =
  "/* Generated from @cheese/tokens. Do not edit directly. */\n:root {\n" +
  lines.join("\n") +
  "\n}\n";
const target = new URL("../packages/css/src/tokens.css", import.meta.url);
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== css)
    throw Error("Token CSS is stale: npm run tokens");
} else writeFileSync(target, css);
