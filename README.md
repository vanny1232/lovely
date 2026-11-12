# Lovely GF Proposal — Telegram Notifications 💌

Static HTML/CSS/JS website with a Vercel serverless endpoint that sends YES / NO choices to your Telegram bot. The existing gift pages, photos, and music stay intact.

## 1) Telegram bot setup

1. Open Telegram and speak to **@BotFather**. Create a bot with `/newbot` if you don't already have one. Keep the token PRIVATE.
2. Open your bot's Telegram chat and press **Start** or send `/start`. Bots cannot privately message you first.
3. Get your `chat_id`: use your own computer/Termux (not a shared website) and request `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` after sending `/start`. Find `result[...].message.chat.id` in the JSON response. **Do not share or commit the URL containing the token.** If you're using a webhook, `getUpdates` may not return results until that webhook is disabled; use an appropriate chat ID lookup method without disrupting another bot workflow.

## 2) Vercel deployment (framework preset: Other)

1. Put the whole project in the ROOT of `vanny1232/lovely`. Your repository should contain `index.html`, `script.js`, `styles.css`, `assets/`, and `api/notify.mjs`.
2. In Vercel, open **Project > Settings > Environment Variables**.
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` with their REAL values. Select **Production** (and Preview if needed). Do not prefix with `VITE_`, `NEXT_PUBLIC_`, etc.
4. Redeploy the production deployment so the function sees the variables. Existing Git integration deploys each push to `main`.
5. Open your deployed website, click YES or NO, and check the chat with your bot. Do not test using file:// HTML, as the `/api/notify` route only exists on Vercel or a local Vercel development server.

### Testing your API

- `GET /api/notify` should return HTTP 405.
- `POST /api/notify` with body `{ "answer": "yes" }` from your website sends a Telegram message.
- Neither the browser source nor GitHub should contain your bot token.

## 3) Upload from Termux

```sh
pkg install git unzip -y
# unzip the downloaded ZIP to a temporary folder, then copy all contents including api/ into your clone
cd ~/lovely
git add .
git commit -m "Notify Telegram bot on GF proposal answers"
git push origin main
```

Only run these commands if your clone is up to date and you have checked that no existing work will be overwritten.

## Security & privacy

- The bot token and chat ID live only in server-side Vercel environment variables.
- This feature transmits only an answer (YES or NO) and a timestamp, **not** visitors' Telegram accounts, names, exact locations, or IP addresses.
- The website visibly tells visitors that their answer is sent to the creator.
- Each answer type is sent once per page load (YES and NO may each be sent if both are clicked); unsuccessful attempts can be retried by clicking again.
- Origin checking is a modest browser abuse deterrent **not real authentication**; a public webhook can still be spammed. For an extensively shared website, add Vercel Firewall rate limiting, Turnstile, or another server-side abuse control.
- Do not publish real credentials in `.env.example`, commits, screenshots, or ChatGPT messages.
