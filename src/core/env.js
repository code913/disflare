/**
 * Puts your environment variables from the root .env file into wrangler
 * Wrangler accepts JSON instead of .env files when bulk uploading which is a pain
 */
import { parse } from "toml";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { spawn } from "node:child_process";

const env = parse(readFileSync("./.env", "utf-8")); // Assuming you ran it from root dir with npm run env
console.dir(env);
writeFileSync("./tmp.env", JSON.stringify(env));

const wrangler = spawn("npx", ["wrangler", "secret:bulk", "./tmp.env"]);

wrangler.stderr.pipe(process.stderr);
wrangler.stdout.pipe(process.stdout);

wrangler.on("close", _ => process.exit());

process.on("exit", _ => unlinkSync("./tmp.env"));