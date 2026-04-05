# Portfolio Insight API - Setup & Configuration

## ✅ Endpoint Status
The API endpoint **`POST /api/portfolioInsight`** is now **active and ready to use**.

## 🔧 Configuration

The endpoint supports two LLM providers. Choose based on your situation:

### Option 1: OpenAI (Recommended for production)
If you have an OpenAI API key:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini  # or gpt-3.5-turbo for cheaper option
```

**Cost**: Pay-per-token (gpt-4o-mini is ~$0.0015 per task)

---

### Option 2: HuggingFace (Free tier available)
If you're a student without paid credentials:

```bash
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=tiiuae/falcon-7b-instruct  # or meta-llama/Llama-2-7b-chat-hf
```

**Free options**:
- HuggingFace **free API** (public models, rate-limited)
- Get free key at: https://huggingface.co/settings/tokens

---

## 📝 .env File Example

Create or update `.env` in the project root:

```env
# MongoDB
MONGO_URI=your_mongodb_uri_here
NODE_ENV=development
PORT=5000

# Auth
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000

# AI Provider (choose one)
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_key_here

# OR for OpenAI:
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk_your_key_here
```

---

## 🧪 Testing the Endpoint

### Using the Web Test Page
1. Open `portfolioInsight_test.html` in your browser
2. Make sure API base URL is: `http://localhost:5000`
3. Click "Load Example" to populate sample portfolio data
4. Click "Send Request"

### Using curl / PowerShell

**PowerShell Example:**
```powershell
$body = @{
    portfolio = @{
        currentValue = 1083431.10
        investedAmount = 1134995
        totalProfitLoss = -51563.90
        latestDate = "02-04-2026"
    }
    schemes = @(
        @{
            scheme_code = 122639
            scheme_name = "Parag Parikh Flexi Cap Fund"
            principal = 349429
            currentNav = 86.5155
            marketValue = 344864.62
            profit = -4564.37
        }
    )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/portfolioInsight" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

---

## 📊 Expected Response

**Success (200 OK):**
```json
{
  "insight": "Your portfolio of ₹1.08M is down 4.8% (₹51.5K loss) primarily from BANDHAN SMALL CAP Fund. Recent 1-day gains of ₹1.8K (+0.16%) show modest recovery."
}
```

**Error (500):**
```json
{
  "error": "OPENAI_API_KEY is required for OpenAI provider."
}
```

---

## 🛠️ File Structure

```
services/
├── llmService.js          ← AI logic (provider-agnostic)
routes/
├── portfolioInsight.js    ← Route handler
server.js                   ← Updated with new route registration
portfolioInsight_test.html  ← Web-based test client
```

---

## 🔄 Switching Providers

To switch providers without code changes:
1. Update `AI_PROVIDER` in `.env`
2. Add the required API key environment variable
3. Restart the server: `npm start`

---

## 💡 Next Steps

1. **Choose your provider** (OpenAI or HuggingFace)
2. **Obtain an API key** (free HF key or OpenAI credits)
3. **Add to `.env` file** in the project root
4. **Restart the server**: `npm start`
5. **Test using `portfolioInsight_test.html`** or curl

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| `404 - Cannot POST /api/portfolioInsight` | Server not restarted. Run `npm start` |
| `OPENAI_API_KEY is required` | Set correct `AI_PROVIDER` and key in `.env` |
| `Invalid JSON` | Portfolio input must be valid JSON |
| `Empty summary` | LLM provider might be rate-limited or API key invalid |

---

## 📌 Key Features

✅ **Provider-agnostic** - Swap providers without touching code  
✅ **Scalable** - Easy to add new LLM providers  
✅ **Isolated** - AI logic in separate service layer  
✅ **Public API** - No authentication required  
✅ **Error handling** - Graceful error messages  
✅ **Student-friendly** - Works with free HuggingFace tier
