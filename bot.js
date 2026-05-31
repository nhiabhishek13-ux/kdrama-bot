
import { useState, useRef, useEffect } from "react";

const BOT_AVATAR = "🎬";
const USER_AVATAR = "🎮";

const SYSTEM_PROMPT = `You are a K-drama suggestion bot named "Ddukbokki" living in a Discord server. You are warm, dramatic, passionate, and deeply knowledgeable about every K-drama ever made.

Your personality:
- You speak with theatrical flair, often using Korean expressions like "Aigoo~", "Daebak!", "Omo!", "Jinjja?", "Saranghae~"
- You are obsessed with K-dramas and get genuinely excited recommending them
- You know plot summaries, cast, themes, emotional hooks, and exactly what kind of mood each drama fits
- You're like that one friend who has watched 300 K-dramas and will not shut up about them (affectionately)

When recommending dramas:
- Give 2-3 specific recommendations with the title, year, and a 1-2 sentence emotionally compelling hook
- Match the vibe to what the user asks (romantic, thriller, fantasy, slice-of-life, etc.)
- Include a fun "watch warning" (e.g., "⚠️ Warning: You will ugly cry")
- Use emojis naturally
- Keep responses under 200 words — punchy, exciting, shareable

Never break character. Never say you're an AI. You are Ddukbokki, the K-drama oracle of this Discord server.`;

const WELCOME_MSG = {
  id: 0,
  from: "bot",
  name: "K-drama suggestion bot",
  text: "Annyeong~! 🌸 I'm **Ddukbokki**, your personal K-drama oracle! Ask me to recommend something — romantic, thrilling, fantasy, tearjerker, whatever your heart needs today~ 🎬✨",
  time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
};

export default function KDramaBot() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      from: "user",
      name: "TheUnluckyBro",
      text,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 0)
        .map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        }));

      history.push({ role: "user", content: text });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await res.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Aigoo~ something went wrong! Try again 😅";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          name: "K-drama suggestion bot",
          text: reply,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          name: "K-drama suggestion bot",
          text: "Aigoo~ my drama senses are overwhelmed! 😩 Try asking again~",
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} style={{ color: "#fff", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const suggestions = [
    "recommend me something romantic 💕",
    "I want to cry, give me a tearjerker 😭",
    "something with fantasy elements ✨",
    "a thriller that'll keep me up all night 😱",
    "best K-drama of all time?",
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#313338",
      fontFamily: "'gg sans', 'Noto Sans', Whitney, 'Helvetica Neue', sans-serif",
      color: "#dcddde",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "#2b2d31",
        borderBottom: "1px solid #1e1f22",
        boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, color: "#80848e" }}>#</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#f2f3f5" }}>general</span>
        <div style={{
          marginLeft: 8,
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "#80848e",
          fontSize: 13,
        }}>
          <span style={{
            width: 8, height: 8,
            borderRadius: "50%",
            background: "#23a55a",
            display: "inline-block",
          }}/>
          2 Online
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{
            background: "linear-gradient(135deg, #ff6b9d, #ff4d6d)",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 12,
            letterSpacing: 0.5,
          }}>APP</span>
        </div>
      </div>

      {/* System message */}
      <div style={{
        padding: "12px 16px 4px",
        fontSize: 13,
        color: "#80848e",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ color: "#5865f2", fontSize: 16 }}>→</span>
        <span><strong style={{ color: "#dcddde" }}>K-drama suggestion bot</strong> is here.</span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 0",
        scrollbarWidth: "thin",
        scrollbarColor: "#1e1f22 #2b2d31",
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: "flex",
            gap: 12,
            padding: "4px 16px",
            borderRadius: 4,
            transition: "background 0.1s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2e3035"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            {/* Avatar */}
            <div style={{
              width: 40, height: 40,
              borderRadius: "50%",
              background: msg.from === "bot"
                ? "linear-gradient(135deg, #ff6b9d 0%, #ff4d6d 100%)"
                : "#5865f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
              marginTop: 2,
              boxShadow: msg.from === "bot" ? "0 0 12px rgba(255,107,157,0.4)" : "none",
            }}>
              {msg.from === "bot" ? BOT_AVATAR : USER_AVATAR}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                <span style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: msg.from === "bot" ? "#ff6b9d" : "#c9cdfb",
                }}>
                  {msg.name}
                </span>
                {msg.from === "bot" && (
                  <span style={{
                    background: "#5865f2",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: 4,
                    letterSpacing: 0.3,
                  }}>APP</span>
                )}
                <span style={{ fontSize: 12, color: "#80848e" }}>{msg.time}</span>
              </div>
              <div style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: "#dcddde",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {renderText(msg.text)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: "flex",
            gap: 12,
            padding: "4px 16px",
          }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff6b9d 0%, #ff4d6d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
              marginTop: 2,
              boxShadow: "0 0 12px rgba(255,107,157,0.4)",
            }}>🎬</div>
            <div style={{ paddingTop: 10 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 8, height: 8,
                    borderRadius: "50%",
                    background: "#ff6b9d",
                    animation: "pulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}/>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div style={{
        padding: "8px 16px 0",
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        flexShrink: 0,
      }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
            style={{
              background: "#2b2d31",
              border: "1px solid #3f4147",
              borderRadius: 20,
              color: "#b5bac1",
              fontSize: 12,
              padding: "4px 12px",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#404249";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#ff6b9d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2b2d31";
              e.currentTarget.style.color = "#b5bac1";
              e.currentTarget.style.borderColor = "#3f4147";
            }}
          >{s}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px 16px",
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: "#383a40",
          borderRadius: 8,
          padding: "0 12px",
          border: "1px solid transparent",
          transition: "border 0.2s",
        }}
          onFocusWithin={(e) => e.currentTarget.style.borderColor = "#ff6b9d"}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message #general"
            disabled={loading}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#dcddde",
              fontSize: 15,
              padding: "11px 0",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? "linear-gradient(135deg, #ff6b9d, #ff4d6d)" : "#3f4147",
              border: "none",
              borderRadius: 6,
              color: "white",
              padding: "6px 14px",
              fontSize: 14,
              fontWeight: 600,
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            {loading ? "…" : "↵"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #2b2d31; }
        ::-webkit-scrollbar-thumb { background: #1e1f22; border-radius: 3px; }
      `}</style>
    </div>
  );
}
