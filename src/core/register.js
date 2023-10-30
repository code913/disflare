/**
 * Uploads your commands to discord and generates an internal meta file when changes are made
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join as pathJoin } from "path";
import isEqual from "lodash.isequal";
import { parse } from "toml";
import { dapi } from "./utils.js";

const join = (...paths) => pathJoin("./src", ...paths);
const metaLocation = join("core/meta.json"); // Assuming you ran this from root directory
const existingMeta = existsSync(metaLocation) ? JSON.parse(readFileSync(metaLocation, "utf-8")) : null;

// import() works from src/core dir
const handlers = await Promise.all(readdirSync(join("handlers")).map(filename => import(`../handlers/${filename}`).then(module => ({
    filename,
    module
}))));
const meta = {
    commands: {}
};
const discordPayload = [];

for (let { filename, module: { metadata } } of handlers) {
    // TODO: validate metadata to ensure it matches discord's rules
    meta.commands[metadata.command.name] = {
        ...metadata,
        type: 1, // slash command
        path: `../handlers/${filename}` // relative to index.js file
    };
    discordPayload.push(metadata.command);
}

if (isEqual(existingMeta, meta)) {
    console.log("No changes were made to commands");
} else {
    console.log("Uploading changes to discord API");
    const { TOKEN, APPLICATION_ID } = parse(readFileSync("./.env", "utf-8"));
    dapi(`applications/${APPLICATION_ID}/commands`, TOKEN, "PUT", discordPayload).then(_ => {
        writeFileSync(metaLocation, JSON.stringify(meta));
        console.log("Done");
    });
}