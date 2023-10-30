export const metadata = {
    command: {
        name: "ping",
        description: "Everyone knows what a ping command does"
    },
};

export async function command(interaction) {
    return interaction.createResponse({
        content: "Pong!"
    });
};