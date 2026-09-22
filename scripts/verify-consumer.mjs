// Verify actual npm tarballs OUTSIDE the monorepo. No workspace symlinks,
// source aliases or ancestor node_modules may make a broken package pass.
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run via npm run test:consumer.");
const temporary = realpathSync(mkdtempSync(join(tmpdir(), "cheese-consumer-")));
const artifacts = join(root, "artifacts", "packages");
mkdirSync(artifacts, { recursive: true });
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const version = (name) => lock.packages["node_modules/" + name].version;
const npmRun = (args, cwd = temporary, capture = false) =>
  execFileSync(process.execPath, [npm, ...args], {
    cwd,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    timeout: 240000,
  });
let passed = false;
try {
  cpSync(join(root, "tests", "consumer"), temporary, { recursive: true });
  const packages = ["tokens", "css", "react", "vue"].map((name) => {
    const info = JSON.parse(
      npmRun(
        [
          "pack",
          "--workspace",
          "@cheese/" + name,
          "--pack-destination",
          artifacts,
          "--json",
        ],
        root,
        true,
      ),
    )[0];
    if (info.files.some((file) => /node_modules|tsbuildinfo/.test(file.path)))
      throw Error("Unexpected private build file in " + name);
    if (
      name === "css" &&
      !info.files.some((file) => file.path === "licenses/Pretendard-OFL.txt")
    )
      throw Error("Font license missing from CSS package.");
    return join(artifacts, info.filename);
  });
  const common = ["vue", "typescript", "vite"].map(
    (name) => `${name}@${version(name)}`,
  );
  const report = [];
  for (const reactMajor of [19, 18]) {
    const react =
      reactMajor === 19
        ? ["react", "react-dom", "@types/react", "@types/react-dom"].map(
            (name) => `${name}@${version(name)}`,
          )
        : [
            "react@18.3.1",
            "react-dom@18.3.1",
            "@types/react@18.3.12",
            "@types/react-dom@18.3.1",
          ];
    console.log(
      `\nIsolated tarball consumer: React ${reactMajor} + Vue ${version("vue")}`,
    );
    npmRun([
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--save-exact",
      ...packages,
      ...common,
      ...react,
    ]);
    for (const name of ["react", "react-dom"]) {
      const installedVersion = JSON.parse(readFileSync(join(temporary, "node_modules", name, "package.json"), "utf8")).version;
      if (!installedVersion.startsWith(reactMajor + ".")) throw Error(`Expected ${name} ${reactMajor}, got ${installedVersion}`);
    }
    for (const name of ["tokens", "css", "react", "vue"]) {
      const installed = realpathSync(
        join(temporary, "node_modules", "@cheese", name),
      );
      if (
        !installed.startsWith(temporary + "/") &&
        !installed.startsWith(temporary + "\\")
      )
        throw Error("Workspace link leaked into isolated consumer.");
    }
    npmRun(["run", "typecheck"]);
    execFileSync(process.execPath, ["ssr.mjs"], {
      cwd: temporary,
      stdio: "inherit",
    });
    npmRun(["run", "build"]);
    if (!existsSync(join(temporary, "dist", "index.html")))
      throw Error("Consumer output missing.");
    if (!existsSync(join(temporary, "dist", "vue.html")))
      throw Error("Vue consumer output missing.");
    report.push({
      react: reactMajor,
      vue: version("vue"),
      typecheck: true,
      ssr: true,
      productionBundle: true,
    });
  }
  writeFileSync(
    join(artifacts, "consumer-verification.json"),
    JSON.stringify(
      { checkedAt: new Date().toISOString(), results: report },
      null,
      2,
    ) + "\n",
  );
  passed = true;
} finally {
  // Delete only this task-created, resolved temporary directory; preserve failures for debugging.
  if (
    passed &&
    dirname(temporary) === realpathSync(tmpdir()) &&
    temporary.split(/[\\/]/).at(-1).startsWith("cheese-consumer-")
  )
    rmSync(temporary, { recursive: true });
  else console.error("Consumer evidence retained at", temporary);
}
