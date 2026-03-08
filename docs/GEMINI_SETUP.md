# Text-to-Voxels Setup (Google Gemini)

The voxel editor can generate structures from text descriptions using Google Gemini. This guide covers API keys, rate limiting, and security.

---

## 1. Get a Gemini API Key (Required)

1. Go to **[Google AI Studio](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **Create API key**
4. Copy the key (starts with `AIza...`)

**Cost:** Gemini has a generous free tier (e.g. 60 requests/min, 2M tokens/day). No credit card required for basic usage.

---

## 2. Add the API Key

### Local development
Create `.env.local` in the project root:

```
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your-key-here
```

### Vercel (production)
1. Open your project on [Vercel](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Add:
   - **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value:** Your API key
   - **Environments:** Production, Preview, Development (as needed)

---

## 3. Rate Limiting (Optional but Recommended)

To prevent abuse and protect your API quota, add Upstash Redis for per-IP rate limiting.

### Get Upstash credentials
1. Sign up at **[Upstash](https://upstash.com)** (free)
2. Create a **Redis database**
3. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

### Add to Vercel
Add both env vars in Vercel → Settings → Environment Variables.

### Default limit
- **10 requests per minute per IP** (sliding window)
- If Upstash vars are not set, rate limiting is disabled (Gemini’s own limits still apply)

---

## Security Notes

| Measure | Purpose |
|--------|---------|
| **API key server-side only** | Never sent to the client; used only in the API route |
| **Input validation** | Max 300 chars per prompt to reduce token abuse |
| **Output validation** | Zod schema validates voxel data; max 300 voxels |
| **Rate limiting** | Per-IP limits via Upstash (when configured) |
| **No CORS for external origins** | API only usable from your deployed domain |

---

## Troubleshooting

- **"AI generation is not configured"** → Set `GOOGLE_GENERATIVE_AI_API_KEY` in env
- **429 Too many requests** → Rate limit hit; wait a minute or add Upstash
- **503** → Check API key is valid and Gemini quota isn’t exceeded
