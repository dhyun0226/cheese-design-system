import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const dependencies = [
  "react",
  "react-dom",
  "vue",
  "radix-ui",
  "aria-hidden",
  "reka-ui",
  "lucide-react",
  "@lucide/vue",
  "react-day-picker",
  "date-fns",
  "@internationalized/date",
];
let result = "CHEESE — Third-party runtime licenses\n\n";
for (const dep of dependencies) {
  const folder = new URL("../node_modules/" + dep + "/", import.meta.url);
  const license = readdirSync(folder).find((n) =>
    /^licen[cs]e(?:\.|$)/i.test(n),
  );
  if (!license) throw Error("License missing for " + dep);
  result +=
    "\n" +
    dep +
    "\n" +
    "=".repeat(50) +
    "\n" +
    readFileSync(new URL(license, folder), "utf8") +
    "\n";
}
result +=
  "\nPretendard\n" +
  readFileSync(
    new URL("../public/licenses/Pretendard-OFL.txt", import.meta.url),
    "utf8",
  );
result +=
  "\nSTARSHIP logo — documentation site only\n" +
  readFileSync(new URL("../site/assets/README.md", import.meta.url), "utf8");
writeFileSync(
  new URL("../dist/THIRD-PARTY-LICENSES.txt", import.meta.url),
  result,
);
