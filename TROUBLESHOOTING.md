# Portfolio Insight API - Troubleshooting & Working Setup

## Current Status
✅ Endpoint is running  
❌ HuggingFace returning 404 - model not found

---

## ⚠️ The Issue

HuggingFace is returning `404 Not Found` for the model endpoint. This can happen because:
1. **Model doesn't exist in public HF registry**
2. **API key is invalid**
3. **Model isn't publicly available**

---

## ✅ Solution: Use OpenAI (Recommended for testing)

OpenAI's API is more reliable and easier to debug. You can get $5 free credits just for signing up:

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/signup
2. Sign up and verify email
3. Go to https://platform.openai.com/api/keys
4. Create a new API key
5. **Copy the key** (you'll only see it once)

### Step 2: Update `.env`

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk_test_YOUR_KEY_HERE
OPENAI_MODEL=gpt-3.5-turbo
```

**Note**: Use `gpt-3.5-turbo` for cheaper testing (~$0.0005 per request)

### Step 3: Restart server
```bash
npm start
```

### Step 4: Test

Open `portfolioInsight_test.html` in browser and try the endpoint.

---

## Alternative: Fix HuggingFace Setup

If you want to stick with HuggingFace, try these steps:

### Check Your API Key
1. Go to https://huggingface.co/settings/tokens
2. Create a new **User Access Token** (if you don't have one)
3. Copy the token
4. Update `.env`:
   ```env
   AI_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=hf_YOUR_TOKEN_HERE
   HUGGINGFACE_MODEL=gpt2
   ```

### Use a Simpler Model
Instead of `tiiuae/falcon-7b-instruct`, try these public models:

```env
# Option 1: GPT-2 (smallest, fastest)
HUGGINGFACE_MODEL=gpt2

# Option 2: DistilBERT (small, good)
HUGGINGFACE_MODEL=distilgpt2

# Option 3: Falcon (if you want more powerful)
HUGGINGFACE_MODEL=tiiuae/falcon-7b
```

### Test with GPT-2

Then restart and test. If it works, you'll get shorter outputs but the endpoint will be functional.

---

## 🧪 Test Each Provider

### Test OpenAI (PowerShell)

```powershell
$json = @"
{
  "portfolio": {
    "currentValue": 1000,
    "investedAmount": 1100,
    "totalProfitLoss": -100,
    "latestDate": "05-04-2026"
  },
  "schemes": []
}
"@

Invoke-WebRequest -Uri "http://localhost:5000/api/portfolioInsight" `
  -Method POST `
  -Body $json `
  -ContentType "application/json" `
  -UseBasicParsing
```

### Expected Success Response

```json
{
  "insight": "Portfolio summary based on your data..."
}
```

### Expected Error Response (if not configured)

```json
{
  "error": "OPENAI_API_KEY is required for OpenAI provider."
}
```

---

## 📋 Configuration Checklist

- [ ] Choose provider (OpenAI recommended)
- [ ] Get API key from provider
- [ ] Add to `.env` file
- [ ] Restart server: `npm start`
- [ ] Test using HTML test page or PowerShell
- [ ] Verify "insight" in response

---

## 📞 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `OPENAI_API_KEY is required` | Add `AI_PROVIDER=openai` + `OPENAI_API_KEY=sk_...`` to `.env` |
| `404 Not Found` (HuggingFace) | Try simpler model like `gpt2` or switch to OpenAI |
| `Invalid API key` | Regenerate your API key from provider dashboard |
| `Empty summary` | Model might be rate-limited or API quota exceeded |
| `Connection refused` | Server not running - run `npm start` |

---

## 🎯 Next Steps

**Quickest Path (5 minutes):**
1. Sign up for OpenAI free tier
2. Copy API key  
3. Add to `.env` with `OpenAI_API_KEY=...`
4. Restart server
5. Test immediately

**Still prefer HuggingFace?**
1. Update `.env` with a simpler model (like `gpt2`)
2. Verify your HF API token is valid
3. Restart server

---

## 🔍 Debug Mode

If you want to see what's happening, check server logs when you make a request:

```bash
# The server will print errors like:
# [portfolioInsight] HuggingFace request failed (404): Not Found
```

---

## 💡 Free Options

| Provider | Free? | Speed | Quality |
|----------|-------|-------|---------|
| **OpenAI (gpt-3.5-turbo)** | $5 credits | Fast | Excellent |
| **HuggingFace (gpt2)** | Yes | Very Fast | Basic |
| **HuggingFace (Falcon)** | Depends | Medium | Good |

---

## Need Help?

1. **Check `.env` file** - Make sure it's in project root
2. **Restart server** - Always restart after changing `.env`
3. **Check API key** - Verify it's valid in provider dashboard
4. **Test with curl** - See exact error from API
5. **Check server logs** - See what error was thrown
