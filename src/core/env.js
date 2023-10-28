import { parse } from "toml";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { spawn } from "node:child_process";

const env = parse(readFileSync("../../.env", "utf-8"));
console.dir(env);
writeFileSync("./tmp.env", JSON.stringify(env));

const wrangler = spawn("npx", ["wrangler", "secret:bulk", "./tmp.env"]);

wrangler.stderr.pipe(process.stderr);
wrangler.stdout.pipe(process.stdout);

wrangler.on("close", _ => process.exit());

process.on("exit", _ => unlinkSync("./tmp.env"));