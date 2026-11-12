/**
 * Vercel Function at POST /api/notify
 * Never put TELEGRAM_BOT_TOKEN in your website's JavaScript or GitHub repository.
 */
const json = (data, status = 200, extra = {}) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store', ...extra },
});

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed' }, 405, { Allow: 'POST' });
    }

    // Reduces accidental cross-origin browser requests; not authentication or strong anti-spam.
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) {
      return json({ ok: false, error: 'Origin not allowed' }, 403);
    }
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
      return json({ ok: false, error: 'Use application/json' }, 415);
    }
    if (Number(request.headers.get('content-length') || 0) > 1000) {
      return json({ ok: false, error: 'Request too large' }, 413);
    }

    let body;
    try {
      const text = await request.text();
      if (text.length > 1000) return json({ ok: false, error: 'Request too large' }, 413);
      body = JSON.parse(text);
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400);
    }

    if (!body || !['yes', 'no'].includes(body.answer)) {
      return json({ ok: false, error: 'Answer must be yes or no' }, 400);
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return json({ ok: false, error: 'Notifications are not configured' }, 503);
    }

    const answer = body.answer === 'yes' ? 'YES 💕' : 'NO 🥺';
    const time = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Phnom_Penh'
    }).format(new Date());
    const message = [
      '💌 New proposal response',
      'Question: Can you be my gf?',
      `Answer: ${answer}`,
      `Time (Cambodia): ${time}`,
    ].join('\n');

    try {
      const upstream = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
        signal: AbortSignal.timeout(8000),
      });
      const result = await upstream.json().catch(() => null);
      if (!upstream.ok || !result?.ok) {
        console.error('Telegram sendMessage failed', upstream.status); // never log tokens
        return json({ ok: false, error: 'Telegram could not deliver the message' }, 502);
      }
      return json({ ok: true });
    } catch (error) {
      console.error('Telegram request failed', error?.name || 'NetworkError');
      return json({ ok: false, error: 'Notification service unavailable' }, 502);
    }
  }
};
