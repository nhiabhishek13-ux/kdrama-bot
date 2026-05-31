const { Client, GatewayIntentBits } = require("discord.js");
const https = require("https");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const SYSTEM_PROMPT = `You are HanBot, a warm and enthusiastic K-drama expert. You suggest K-dramas based on what users ask. You use Korean words like daebak, aigoo, fighting occasionally. For each drama suggest: title, vibe, why they'll love it, emotional warning, and best mood to watch it. Keep responses concise and fun with emojis. Suggest 2-3 dramas unless asked otherwise.`;

function askGemini(userMessage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\nUser: " + userMessage }] }]
    });
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json" }
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve(json.candidates[0].content.parts[0].text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

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
    const reply = await askGemini(userMessage);
    message.reply(reply);
  } catch (err) {
    console.error(err);
    message.reply("Aigoo~ something went wrong! Try again 😅");
  }
});

client.login(process.env.DISCORD_TOKEN);