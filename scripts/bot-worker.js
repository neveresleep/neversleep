// neversleep.bot — Cloudflare Worker (minimal)
export default {
  async fetch(request, env) {
    const TG_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const GH_TOKEN = env.GITHUB_PAT;
    const GH_REPO  = env.GH_REPO || 'neveresleep/neversleep';
    const GH_OWNER = env.GH_OWNER || 'neveresleep';
    const ALLOWED  = env.ALLOWED_USER_ID;

    const url = new URL(request.url);

    // ─── Routes ───

    if (request.method === 'GET' && url.pathname === '/setup') {
      const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${url.origin}/webhook` }),
      });
      const j = await r.json();
      return new Response(JSON.stringify(j), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response('neversleep bot alive', { status: 200 });
    }

    if (request.method === 'POST' && url.pathname === '/webhook') {
      const update = await request.json();
      if (!update.message) return new Response('ok', { status: 200 });

      const msg = update.message;
      const chatId = msg.chat.id;

      if (ALLOWED && String(msg.from.id) !== ALLOWED) return new Response('ok', { status: 200 });

      const text = msg.text || '';

      if (text === '/start') {
        await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: '👋 Отправь ссылку — сделаю пост на neversleep.chat' }),
        });
        return new Response('ok', { status: 200 });
      }

      let payload = text.trim();
      const cmd = text.match(/^\/(ru|en|both)\s+(.+)/s);
      if (cmd) payload = cmd[2].trim();
      if (!payload) return new Response('ok', { status: 200 });

      // Call GitHub API — one single operation
      const res = await fetch(
        `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/actions/workflows/generate-post.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GH_TOKEN}`,
            Accept: 'application/vnd.github+json',
          },
          body: JSON.stringify({ ref: 'main', inputs: { source_url: payload, lang: 'ru' } }),
        }
      );

      let status = '✅';
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        status = `❌ ${res.status}: ${body.slice(0, 200)}`;
      }

      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: status }),
      });

      return new Response('ok', { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  },
};
