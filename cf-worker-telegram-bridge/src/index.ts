/**
 * Telegram → GitHub Actions bridge.
 *
 * Receives Telegram webhook updates, validates the secret token,
 * allowlists the sender, then fires `phone-task.yml` via
 * GitHub repository_dispatch. For investigate mode the workflow
 * will reply directly to Telegram when done.
 *
 * Message format:
 *   "? <question>"          → investigate mode
 *   "/investigate <q>"      → investigate mode
 *   anything else           → implement mode
 *
 * Secrets (set via `wrangler secret put`):
 *   GITHUB_TOKEN          — PAT with repo + workflow scopes
 *   TELEGRAM_BOT_TOKEN    — bot token from BotFather
 *   TELEGRAM_SECRET       — webhook secret (X-Telegram-Bot-Api-Secret-Token)
 */

interface Env {
  GITHUB_TOKEN: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_SECRET: string;
  ALLOWED_CHAT_ID: string;  // var, not secret
  GITHUB_REPO: string;      // var, not secret
}

interface TelegramUpdate {
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    from?: { username?: string };
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Validate Telegram webhook secret
    const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (!secret || secret !== env.TELEGRAM_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    let update: TelegramUpdate;
    try {
      update = await request.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    const message = update.message;
    if (!message?.text) return new Response('OK');

    const chatId = String(message.chat.id);
    const text   = message.text.trim();
    const msgId  = message.message_id;

    // Silently ignore non-allowlisted chats
    if (chatId !== env.ALLOWED_CHAT_ID) return new Response('OK');

    // Parse mode + task from message text
    let mode = 'implement';
    let task = text;

    if (text.startsWith('? ')) {
      mode = 'investigate';
      task = text.slice(2).trim();
    } else if (text.toLowerCase().startsWith('/investigate ')) {
      mode = 'investigate';
      task = text.slice('/investigate '.length).trim();
    } else if (text.toLowerCase().startsWith('/implement ')) {
      task = text.slice('/implement '.length).trim();
    } else if (text === '/status') {
      await sendTelegram(env.TELEGRAM_BOT_TOKEN, chatId,
        '📊 Use the GitHub Actions UI or run `bash scripts/claude-usage-status.sh` locally.');
      return new Response('OK');
    }

    if (!task) {
      await sendTelegram(env.TELEGRAM_BOT_TOKEN, chatId,
        '❓ Usage:\n`? <question>` — investigate mode\n`<instruction>` — implement mode', msgId);
      return new Response('OK');
    }

    // Acknowledge immediately so the user knows it was received
    const ackEmoji = mode === 'investigate' ? '🔍' : '⚡';
    await sendTelegram(
      env.TELEGRAM_BOT_TOKEN, chatId,
      `${ackEmoji} Dispatching (*${mode}* mode)…\n\n${task.slice(0, 200)}`,
      msgId,
    );

    // Fire GitHub repository_dispatch → phone-task.yml
    const ghResp = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization:  `token ${env.GITHUB_TOKEN}`,
          Accept:         'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent':   'telegram-claude-bridge/1.0',
        },
        body: JSON.stringify({
          event_type: 'phone-task',
          client_payload: {
            task,
            mode,
            base_branch:          'main',
            telegram_chat_id:     chatId,
            telegram_message_id:  String(msgId),
          },
        }),
      },
    );

    if (!ghResp.ok) {
      const err = await ghResp.text().catch(() => '');
      await sendTelegram(
        env.TELEGRAM_BOT_TOKEN, chatId,
        `❌ GitHub dispatch failed (${ghResp.status}): ${err.slice(0, 200)}`,
      );
    }

    return new Response('OK');
  },
};

async function sendTelegram(
  token: string,
  chatId: string,
  text: string,
  replyTo?: number,
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id:    chatId,
    text,
    parse_mode: 'Markdown',
  };
  if (replyTo) payload.reply_to_message_id = replyTo;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).catch(() => {});  // non-fatal — we already returned OK to Telegram
}
