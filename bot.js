const { Client, GatewayIntentBits } = require("discord.js");
const Anthropic = require("@anthropic-ai/sdk");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are HanBot, a warm and enthusiastic K-drama expert. You suggest K-dramas based on what users ask. You use Korean words like daebak, aigoo, fighting occasionally. For each drama suggest: title, vibe, why they'll love it, emotional warning, and best mood to watch it. Keep responses concise and fun with emojis. Suggest 2-3 dramas unless asked otherwise.`;

client.on("ready", () => {
  console.log(`HanBot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const userMessage = message.content.replace(/<@!?\\d+>/g, "").trim();
  if (!userMessage) {
    message.reply("안녕하세요! Ask me for K-drama recommendations! 🌸");
    return;
  }

  try {
    await message.channel.sendTyping();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const reply = response.content[0].text;
    message.reply(reply);
  } catch (err) {
    message.reply("Aigoo~ something went wrong! Try again 😅");
  }
});

client.login(process.env.DISCORD_TOKEN);
