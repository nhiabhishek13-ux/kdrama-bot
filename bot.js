const { Client, GatewayIntentBits } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are HanBot, a warm and enthusiastic K-drama expert. You suggest K-dramas based on what users ask. You use Korean words like daebak, aigoo, fighting occasionally. For each drama suggest: title, vibe, why they'll love it, emotional warning, and best mood to watch it. Keep responses concise and fun with emojis. Suggest 2-3 dramas unless asked otherwise.`;

client.on("ready", () => {
  console.log(`HanBot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const userMessage = message.content.replace(/<@!?\d+>/g, "").trim();
  if (!userMessage) {
    message.reply("안녕하세요! Ask me for K-drama recommendations! 🌸");
    return;
  }

  try {
    await message.channel.sendTyping();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(SYSTEM_PROMPT + "\n\nUser: " + userMessage);
    const reply = result.response.text();
    message.reply(reply);
  } catch (err) {
    console.error(err);
    message.reply("Aigoo~ something went wrong! Try again 😅");
  }
});

client.login(process.env.DISCORD_TOKEN);