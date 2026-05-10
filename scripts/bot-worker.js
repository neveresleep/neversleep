// neversleep.bot — Cloudflare Worker
// Деплой: npx wrangler deploy scripts/bot-worker.js --name neversleep-bot
// Первый запуск: открыть /setup в браузере, чтобы привязать вебхук

export default {
  async fetch(request, env) {
    const TG_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const GH_TOKEN = env.GITHUB_PAT;
    const GH_REPO  = env.GH_REPO || 'neveresleep/neversleep';
    const GH_OWNER = env.GH_OWNER || 'neveresleep';
    const ALLOWED  = env.ALLOWED_USER_ID;

    // ── Helpers ─────────────────────────────────────────

    const tgSend = async (chatId, text) => {
      const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId, text,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      });
    };

    const tgSetWebhook = async (url) => {
      const r = await fetch(
        `https://api.telegram.org/bot${TG_TOKEN}/setWebhook`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }
      );
      return r.json();
    };

    const triggerActions = async (source, lang = 'ru', note = '') => {
      const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/generate-post.yml/dispatches`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GH_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'neversleep-bot',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { source_url: source, lang, user_note: note },
        }),
      });
      if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    };

    // ── Routes ──────────────────────────────────────────

    const url = new URL(request.url);

    // Setup webhook
    if (request.method === 'GET' && url.pathname === '/setup') {
      const wh = await tgSetWebhook(`${url.origin}/webhook`);
      return new Response(JSON.stringify(wh, null, 2), { headers: { 'Content-Type': 'application/json' } });
    }

    // Health
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('neversleep bot alive', { status: 200 });
    }

    // Webhook
    if (request.method === 'POST' && url.pathname === '/webhook') {
      const update = await request.json();
      if (!update.message) return new Response('ok', { status: 200 });

      const msg = update.message;
      const chatId = msg.chat.id;

      // Restrict to one user (optional)
      if (ALLOWED && msg.from?.id?.toString() !== ALLOWED) {
        return new Response('ok', { status: 200 });
      }

      const text = msg.text || '';

      // /start
      if (text === '/start') {
        await tgSend(chatId,
          `👋 Привет! Я бот neversleep.chat.\n\n` +
          `Просто отправь ссылку (X, YouTube, статья) или текст — ` +
          `я превращу в пост на сайте.\n\n` +
          `Команды:\n` +
          `/ru <ссылка> — русский (умолчание)\n` +
          `/en <ссылка> — английский\n` +
          `/both <ссылка> — оба языка`
        );
        return new Response('ok', { status: 200 });
      }

      let lang = 'ru';
      let payload = text.trim();

      const cmd = text.match(/^\/(ru|en|both)\s+(.+)/s);
      if (cmd) {
        lang = cmd[1];
        payload = cmd[2].trim();
      }

      if (!payload) return new Response('ok', { status: 200 });

      await tgSend(chatId, `⏳ Генерирую пост...`);

      try {
        await triggerActions(payload, lang);
        await tgSend(chatId, `✅ Готово! Пост скоро будет на neversleep.chat`);
      } catch (err) {
        await tgSend(chatId, `❌ ${err.message}`);
      }

      return new Response('ok', { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  },
};
