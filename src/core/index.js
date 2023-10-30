/**
 * The main worker file
 * Handles 
 */
import { verifyKey, InteractionResponseType } from "discord-interactions";
import { Router } from "itty-router";
import { JsonResponse, Interaction } from "./utils.js";

const router = Router();
const commands = new Map(); // TODO

router.post("/", async (request, env, cfEvent) => {
	const message = await request.json?.();

	if (message.type === InteractionType.PING) {
		return new JsonResponse({
			type: InteractionResponseType.PONG
		});
	}
	const interaction = new Interaction(message);
	switch (message.type) {
		case InteractionType.APPLICATION_COMMAND: {
			return commands.get(interaction.data.name)?.run(interaction, env, cfEvent);
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
			const isValidRequest = botName && signature && timestamp && verifyKey(
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