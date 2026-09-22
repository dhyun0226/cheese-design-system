import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import * as react from "../packages/react/dist/index.js";
const source = readFileSync(
  new URL("../site/catalog.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { entries } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);
const ids = entries.map((e) => e.id);
if (new Set(ids).size !== ids.length) throw Error("Duplicate catalog ID");
const demos = readdirSync(new URL("../site/examples", import.meta.url)).filter(
  (n) => n.endsWith(".tsx"),
);
const demoIds = new Set(demos.map((file) => file.slice(0, -4)));
const missing = ids.filter((id) => !demoIds.has(id));
if (missing.length)
  throw Error(
    "Catalog entries without executable examples: " + missing.join(", "),
  );
for (const file of demos) {
  const id = file.slice(0, -4),
    entry = entries.find((e) => e.id === id);
  if (!entry?.api || !entry?.accessibility)
    throw Error("Missing API/accessibility documentation: " + id);
  const text = readFileSync(
    new URL("../site/examples/" + file, import.meta.url),
    "utf8",
  );
  const ast = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let imported = false;
  for (const node of ast.statements) {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.text === "@cheese/react"
    ) {
      imported = true;
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        for (const item of bindings.elements) {
          if (item.isTypeOnly || node.importClause?.isTypeOnly) continue;
          const name = (item.propertyName || item.name).text;
          if (!(name in react))
            throw Error("Missing package export: " + name + " in " + file);
        }
    }
  }
  if (!imported) throw Error("Demo must import the actual package: " + file);
}
console.log(
  "Catalog: " +
    entries.length +
    " entries; " +
    demos.length +
    " real-package demos; " +
    (entries.length - demos.length) +
    " explicitly planned.",
);
