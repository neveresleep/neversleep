// neversleep.bot — Cloudflare Worker
export default {
  async fetch(request, env) {
    const TG_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const GH_TOKEN = env.GITHUB_PAT;
    const GH_REPO  = env.GH_REPO || 'neveresleep/neversleep';
    const GH_OWNER = env.GH_OWNER || 'neveresleep';
    const ALLOWED  = env.ALLOWED_USER_ID;

    const tg = async (chatId, text) => {
      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      });
    };

    const dispatch = async (source, lang) => {
      const res = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/generate-post.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GH_TOKEN}`,
            Accept: 'application/vnd.github+json',
          },
          body: JSON.stringify({ ref: 'main', inputs: { source_url: source, lang } }),
        }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`GitHub ${res.status}: ${body.slice(0, 200)}`);
      }
    };

    const url = new URL(request.url);

    // Setup webhook
    if (request.method === 'GET' && url.pathname === '/setup') {
      const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${url.origin}/webhook` }),
      });
      return new Response(JSON.stringify(await r.json()), { headers: { 'Content-Type': 'application/json' } });
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

      if (ALLOWED && String(msg.from.id) !== ALLOWED) {
        return new Response('ok', { status: 200 });
      }

      const text = msg.text || '';

      if (text === '/start') {
        await tg(chatId, '👋 Отправь ссылку — сделаю пост на neversleep.chat\n\nКоманды:\n/ru <ссылка>\n/en <ссылка>\n/both <ссылка>');
        return new Response('ok', { status: 200 });
      }

      let lang = 'ru';
      let payload = text.trim();
      const cmd = text.match(/^\/(ru|en|both)\s+(.+)/s);
      if (cmd) { lang = cmd[1]; payload = cmd[2].trim(); }
      if (!payload) return new Response('ok', { status: 200 });

      // Send progress, then generate, then send result
      await tg(chatId, `⏳ Генерирую пост...`);
      await tg(chatId, `⏳ Dispatch...`);

      try {
        await dispatch(payload, lang);
        await tg(chatId, `✅ Готово! Пост скоро будет на neversleep.chat`);
      } catch (e) {
        await tg(chatId, `❌ Ошибка: ${e.message}`);
      }

      return new Response('ok', { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  },
};
