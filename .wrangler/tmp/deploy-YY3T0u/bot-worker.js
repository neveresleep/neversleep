var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// scripts/bot-worker.js
var bot_worker_default = {
  async fetch(request, env) {
    const TG_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const GH_TOKEN = env.GITHUB_PAT;
    const GH_REPO = env.GH_REPO || "neveresleep/neversleep";
    const ALLOWED = env.ALLOWED_USER_ID;
    const url = new URL(request.url);
    const tg = /* @__PURE__ */ __name(async (chatId, text) => {
      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
      });
    }, "tg");
    if (request.method === "GET" && url.pathname === "/setup") {
      const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `${url.origin}/webhook` })
      });
      return new Response(JSON.stringify(await r.json()), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "GET" && url.pathname === "/") {
      return new Response("neversleep bot alive", { status: 200 });
    }
    if (request.method === "POST" && url.pathname === "/webhook") {
      const update = await request.json();
      if (!update.message) return new Response("ok", { status: 200 });
      const msg = update.message;
      const chatId = msg.chat.id;
      if (ALLOWED && String(msg.from.id) !== ALLOWED) return new Response("ok", { status: 200 });
      const text = msg.text || "";
      if (text === "/start") {
        await tg(chatId, "\u{1F44B} \u041E\u0442\u043F\u0440\u0430\u0432\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u2014 \u0441\u0434\u0435\u043B\u0430\u044E \u0441\u0442\u0430\u0442\u044C\u044E \u043D\u0430 neversleep.chat");
        return new Response("ok", { status: 200 });
      }
      let payload = text.trim();
      const cmd = text.match(/^\/(ru|en|both)\s+(.+)/s);
      if (cmd) payload = cmd[2].trim();
      if (!payload) return new Response("ok", { status: 200 });
      const res = await fetch(
        `https://api.github.com/repos/${GH_REPO}/actions/workflows/274114119/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GH_TOKEN}`,
            "User-Agent": "neversleep-bot",
            Accept: "application/vnd.github+json"
          },
          body: JSON.stringify({ ref: "main", inputs: { source_url: payload, lang: "ru" } })
        }
      );
      if (res.ok) {
        await tg(
          chatId,
          `\u23F3 \u0417\u0430\u043F\u0443\u0441\u043A\u0430\u044E \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044E...

1/3 \u{1F50D} \u041F\u043E\u043B\u0443\u0447\u0430\u044E \u043A\u043E\u043D\u0442\u0435\u043D\u0442
2/3 \u{1F916} \u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u044E \u043F\u043E\u0441\u0442
3/3 \u{1F4DD} \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u044E \u0438 \u043A\u043E\u043C\u043C\u0438\u0447\u0443

\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043F\u0440\u0438\u0434\u0435\u0442 \u0432 \u044D\u0442\u043E\u0442 \u0447\u0430\u0442 \u043E\u0442 GitHub \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F.`
        );
      } else {
        const body = await res.text().catch(() => "");
        await tg(chatId, `\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0443\u0441\u043A\u0430: ${res.status}`);
      }
      return new Response("ok", { status: 200 });
    }
    return new Response("Not found", { status: 404 });
  }
};
export {
  bot_worker_default as default
};
//# sourceMappingURL=bot-worker.js.map
