
require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const https = require("https");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const SYSTEM_PROMPT = `
You are HanBot, a warm and enthusiastic K-drama expert.
You suggest K-dramas based on what users ask.
Use Korean words like daebak, aigoo, and fighting occasionally.
For each drama include:
• Title
• Vibe
• Why they'll love it
• Emotional warning
• Best mood to watch it

Keep responses concise, fun, and use emojis.
Recommend 2-3 dramas unless asked otherwise.
`;

function askAI(userMessage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const options = {
      hostname: "openrouter.ai",
      path: "/api/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://github.com/yourusername/kdrama-bot",
        "X-Title": "HanBot",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(body);

          if (json.error) {
            reject(new Error(json.error.message));
            return;
          }

          if (!json.choices || !json.choices.length) {
            reject(new Error("No AI response received."));
            return;
          }

          resolve(json.choices[0].message.content);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

client.once("ready", () => {
  console.log(`🌸 HanBot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.mentions.has(client.user)) return;

  const userMessage = message.content
    .replace(/<@!?\d+>/g, "")
    .trim();

  if (!userMessage) {
    return message.reply(
      "안녕하세요! 🌸 Mention me and ask for K-drama recommendations!"
    );
  }

  if (userMessage.toLowerCase() === "help") {
    return message.reply(
      "🌸 Examples:\n" +
      "• Romantic K-dramas\n" +
      "• Sad K-dramas\n" +
      "• Action K-dramas\n" +
      "• Similar to Crash Landing on You\n" +
      "• Best K-dramas of