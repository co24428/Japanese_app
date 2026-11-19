# Nihongo Daily

A personal web app for learning everyday Japanese conversation. It works on a laptop and on a phone, and is built for one user: a Korean speaker who is fluent in English.

- **Lessons**: 14 real-life situations, 31 short dialogues, 188 phrases. Every phrase has Japanese with furigana, romaji, English and Korean, and audio. Each lesson opens with a "Key particles & words" preview and ends with a recap that breaks every sentence into word + particle blocks.
- **Exercises**: pick the meaning, listen, choose the reply, put words in order, type the sentence. Mistakes come back before the lesson ends.
- **Review**: spaced repetition brings each phrase back just before you would forget it.
- **Tracking**: a GitHub-style activity map, streaks, and a daily XP goal.
- **AI (your own Claude or Gemini key)**: role-play conversations with corrections, lessons written for any situation you describe, and "Explain" on any phrase with a comparison to Korean.
- **Words**: an everyday dictionary (places, nature, clothes with their "wear" verb, verbs) with search and "Save to review", plus a particle cheat sheet mapping は, が, を, の, に, で to Korean 조사.
- **Kana**: hiragana and katakana charts with audio and a quiz.

Lessons, review, tracking and kana work without any AI key.

## Run it on your computer

Requires Node.js 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000 and log in with the password `dev`.

No database setup is needed locally: the app creates an embedded database in `./.data`. To use your own password locally, copy `.env.example` to `.env.local` and edit it.

## Deploy (Vercel, free tier)

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, choose **Add New → Project**, and import this repository. Leave the build settings as they are.
2. Before the first deploy (or afterwards under **Settings → Environment Variables**), add:

   | Name | Value |
   |---|---|
   | `APP_PASSWORD` | The password you will type to log in. Make it long. |
   | `APP_SECRET` | A long random string. Generate one with `openssl rand -base64 32`. |

3. Open the project's **Storage** tab, choose **Create Database → Neon (Postgres)**, and connect it to the project. This adds `DATABASE_URL` for you.
4. **Redeploy** (Deployments → the latest one → Redeploy) so the new variables are picked up.
5. Open the URL Vercel gives you, log in, and add your Claude or Gemini key under **Settings**.

Every push to the deployed branch redeploys automatically. The tables are created on first use; there is no migration step.

**On your phone**: open the URL, then use *Share → Add to Home Screen* (iPhone) or *⋮ → Add to Home screen* (Android). It then opens full screen like an app.

Any host that runs Next.js and gives you a Postgres connection string works the same way: set the three variables from `.env.example`.

## How the code is organised

```
src/
  lib/            Pure logic shared by server and browser. No database, no React.
    japanese.ts     The sentence markup: furigana, word tiles, romaji, answer checking
    content/        The built-in lessons, one file per situation   <- edit lessons here
    exercises.ts    Turns phrases into a session of exercises
    srs.ts          Review scheduling (boxes and intervals)
    streak.ts       Streaks and the activity-map grid
    xp.ts           How much XP each activity is worth
    prefs.ts        Preferences and AI provider defaults
    content/dictionary.ts  Words page dictionary and the "wear" verbs   <- add words here
    content/particles.ts   Particle cheat sheet (Korean bridge)
    grammar.ts      Particles and their Korean equivalents; splits sentences into word + particle chunks
    scenarios.ts    Role-play scenes for the Talk tab             <- add scenes here
    auth.ts         Login cookie signing
  server/         Runs only on the server.
    db.ts           Database connection and the table definitions
    progress.ts     Saving and reading activity, lesson and review progress
    settings.ts     Preferences and encrypted API keys
    crypto.ts       Encryption of the API keys
    api.ts          Wrapper used by every API route (login check, errors)
    ai/             Claude and Gemini providers, prompts, AI features
  app/            Pages and API routes (Next.js App Router).
    (app)/(main)/   Pages with the navigation bar: home, learn, words, review, talk, kana, settings
    (app)/(focus)/  Full-screen pages: the lesson player
    api/            JSON endpoints called by the browser
    login/          The login page
  components/     React components. lesson/ holds the lesson player.
  proxy.ts        Runs before every request and sends logged-out visitors to /login
tests/            Unit tests (npm test)
```

A request to finish a lesson flows like this: `components/lesson/LessonPlayer.tsx` → `POST /api/progress` (`app/api/progress/route.ts`) → `server/progress.ts` → database.

### The sentence format

Every Japanese sentence is one string:

```
すみません、 [駅|えき] は どこ です か。
```

Spaces separate words, and `[kanji|reading]` adds furigana. The display text, the furigana, the word tiles and the answer checking are all derived from it. `src/lib/japanese.ts` explains the details.

### Adding or editing lessons

Edit the files in `src/lib/content/units/`. Each line is `[japanese, romaji, english, korean, optional note]`. After the lines, a lesson can list its key words for the preview card as `[japanese, romaji, english, korean]`. To add a situation, create a new file there and add it to the list in `src/lib/content/index.ts`.

Dictionary words live in `src/lib/content/dictionary.ts` as `[id, japanese, romaji, english, korean, optional note]`. The id is what "Save to review" stores, so never change an existing one.

Then run the tests. They check every line: furigana on all kanji, and romaji that matches the reading.

```bash
npm test
```

Do not change a lesson's `id` after you have studied it, because progress is stored under that id.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the app locally with live reload |
| `npm test` | Run the unit tests |
| `npm run typecheck` | Check the TypeScript types |
| `npm run build` | Production build (what Vercel runs) |

## Security notes

- The app has one account. `APP_PASSWORD` logs you in and you stay logged in on that device for 90 days. Changing `APP_PASSWORD` or `APP_SECRET` logs every device out.
- API keys are sent to the server once, tested, and stored encrypted (AES-256-GCM, key derived from `APP_SECRET`). They are never sent back to the browser. If you change `APP_SECRET`, re-enter your keys.
- After 8 wrong passwords, logging in is paused for 15 minutes. This also pauses you, on devices that are not already logged in.
- AI usage is billed by Anthropic or Google to your own key. Role-play sends the conversation so far on each turn; explanations are cached so the same sentence is only paid for once.

## Things to know

- Audio uses the browser's built-in Japanese voice. Phones and Macs have a good one. If a device has none, listening exercises turn into reading exercises, and Settings tells you.
- The default Claude model is `claude-opus-5-5` and the default Gemini model is `gemini-flash-latest`. In Settings, **List** shows the models your key can use, and you can pick a faster or cheaper one.
- Role-play conversations are not saved; leaving the page ends the scene.
- Sound effects (chimes for right and wrong answers) can be turned off in Settings. Page animations follow the system "reduce motion" setting.
- Page transitions use the browser's View Transitions API. Browsers without it switch pages instantly; everything else works the same.
