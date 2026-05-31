require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const dramas = [
  {
    title: "Crash Landing on You",
    vibe: "Romance ❤️",
    reason: "Amazing chemistry and emotional story.",
  },
  {
    title: "Queen of Tears",
    vibe: "Drama 😭",
    reason: "Heartbreaking and beautiful.",
  },
  {
    title: "Lovely Runner",
    vibe: "Fantasy ✨",
    reason: "Fun, emotional, and addictive.",
  },
  {
    title: "Vincenzo",
    vibe: "Action 🔥",
    reason: "Dark comedy with great action scenes.",
  },
];

const commands = [
  new SlashCommandBuilder()
    .setName("recommend")
    .setDescription("Get a random K-drama recommendation"),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`🌸 HanBot online as ${client.user.tag}`);

  setInterval(async () => {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);

    const drama = dramas[Math.floor(Math.random() * dramas.length)];

    const embed = new EmbedBuilder()
      .setTitle(`🌸 Daily K-Drama Pick: ${drama.title}`)
      .setDescription(
        `**Vibe:** ${drama.vibe}\n**Why Watch:** ${drama.reason}`
      );

    channel.send({ embeds: [embed] });
  }, 24 * 60 * 60 * 1000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "recommend") {
    const drama = dramas[Math.floor(Math.random() * dramas.length)];

    const embed = new EmbedBuilder()
      .setTitle(`🎬 ${drama.title}`)
      .setDescription(
        `**Vibe:** ${drama.vibe}\n**Why You'll Love It:** ${drama.reason}`
      );

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);