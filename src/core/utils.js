// https://github.com/code913/snippets/blob/main/discord/fetch.js
export const dapi = (path, token, method = "GET", body, parse = true) => fetch(`https://discord.com/api/v10/${path}`, {
	headers: {
		"Authorization": `Bot ${token}`,
		"Content-Type": body && "application/json"
	},
	body: body && JSON.stringify(body),
	method: method
}).then(r => parse ? r.json() : r);

export class JsonResponse extends Response {
	/**
	 * @param {any} body 
	 * @param {ResponseInit} init 
	 */
	constructor(body, init) {
		const jsonBody = JSON.stringify(body);
		init ??= {
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			}
		};
		super(jsonBody, init);
	}
};

// https://github.com/code913/snippets/blob/main/discord/interaction.ts
export class Interaction {
	constructor(interaction) {
		Object.assign(this, interaction);

		function getResolved(group) {
			return interaction.data.resolved[group][interaction.data.target_id];
		}

		switch (interaction.data.type) {
			case 2: {
				this.target = getResolved("users");
				break;
			};
			case 3: {
				this.target = getResolved("messages");
				break;
			};
		}

		function unpackOptions(opts) {
			let unpacked = {};
			for (let { name, value } of (opts ?? [])) {
				unpacked[name] = value ?? {};
			}
			return unpacked;
		}

		let { options } = interaction.data;

		if (options?.length) {
			let opt = options[0];
			switch (opt.type) {
				case 2: {
					const sub = opt.options[0];
					this.subcommand = `${opt.name} ${sub.name}`;
					({ options } = sub);
					break;
				}
				case 1: {
					this.subcommand = opt.name;
					({ options } = opt);
					break;
				}
				default:
					break;
			}

			this.options = unpackOptions(options);
		}
	}

	/**
	 * Creates a response to the interaction
	 */
	async createResponse(data) {
		const { attachments } = data;
		const body = {
			type,
			data // intended to be a reference
		};

		if (attachments) {
			data.attachments = data.attachments?.map((_, i) => ({ id: i }));

			const formData = new FormData();

			formData.append("payload_json", JSON.stringify(body));

			for (let [i, { name, bits, type }] of Object.entries(attachments))
				formData.append(`files[${i}]`, new File([bits], name, {
					type: type ?? "application/octet-stream"
				}));

			return new Response(formData);
		}

		return new JsonResponse(body);
	}
};