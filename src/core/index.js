/**
 * The main worker file
 * Handles interactions requests from discord and calls your command/component handlers
 */
import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";
import { Router } from "itty-router";
import { JsonResponse, Interaction } from "./utils.js";
import meta from "./meta.json" assert { type: "json" };
console.log(meta);

const router = Router();

router.post("/", async (request, env, cfEvent) => {
	const message = await request.json?.();

	if (message.type === InteractionType.PING) return new JsonResponse({
		type: InteractionResponseType.PONG
	});
	const interaction = new Interaction(message);
	switch (message.type) {
		case InteractionType.APPLICATION_COMMAND: {
			const { path } = meta.commands[interaction.data.name];
			return await import(path).then(({ command }) => command(interaction));
		};
		case InteractionType.MESSAGE_COMPONENT: {
			// TODO
		};
	}
});

export default {
	async fetch(request, env) {
		if (request.method === "POST") {
			const publicKey = env.PUBLIC_KEY;
			const signature = request.headers.get("x-signature-ed25519");
			const timestamp = request.headers.get("x-signature-timestamp");
			const body = await request.clone().arrayBuffer();
			const isValidRequest = signature && timestamp && verifyKey(
				body,
				signature,
				timestamp,
				publicKey ?? ""
			);

			if (!isValidRequest) return new Response("Bad request signature.", { status: 401 });
		}

		return router.handle(request, env);
	}
};